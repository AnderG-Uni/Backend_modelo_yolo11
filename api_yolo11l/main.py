from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import cv2
import numpy as np
import easyocr
import re

app = FastAPI()

print("[INFO] Cargando modelo YOLO...")
model = YOLO("best.pt") 
print("[INFO] Cargando motor OCR (EasyOCR)...")
reader = easyocr.Reader(['es', 'en'], gpu=False)

REGEX_LIMPIEZA = r'[^A-Z0-9]'

# ==========================================
# NUEVO: Endpoint de Health Check
# ==========================================
@app.get("/health")
def health_check():
    return {"status": "ok", "mensaje": "IA lista para procesar"}

@app.post("/detectar")
async def detectar_placa(imagen: UploadFile = File(...)):
    contents = await imagen.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    resultados = model.predict(frame, conf=0.3, verbose=False)

    for r in resultados:
        for box in r.boxes:
            confianza_cruda = float(box.conf[0])
            porcentaje_confianza = round(confianza_cruda * 100, 1)

            b = box.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = b[0], b[1], b[2], b[3]

            pad = 5
            h, w, _ = frame.shape
            plate_crop = frame[max(0, y1-pad):min(h, y2+pad), max(0, x1-pad):min(w, x2+pad)]

            if plate_crop.size > 0:
                ocr_result = reader.readtext(plate_crop, detail=0)
                if ocr_result:
                    texto_limpio = re.sub(REGEX_LIMPIEZA, '', ocr_result[0].upper())

                    if len(texto_limpio) >= 4:
                        # NUEVO: Imprimimos en la consola la placa exacta que acaba de leer
                        print(f"👉 [IA] Placa detectada: {texto_limpio} | Confianza: {porcentaje_confianza}%")
                        
                        return {
                            "estado": "OK", 
                            "placa": texto_limpio, 
                            "confianza": porcentaje_confianza,
                            "box": { "x": int(x1), "y": int(y1), "w": int(x2-x1), "h": int(y2-y1) }
                        }

    return {"estado": "FAIL", "mensaje": "No se detectó placa."}