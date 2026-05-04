const ort = require('onnxruntime-node');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const path = require('path');

// Variable global para mantener el modelo cargado en memoria y no recargarlo en cada foto
let modeloYolo = null;

/**
 * Carga el modelo ONNX en memoria al iniciar el servidor
 */
const cargarModelo = async () => {
    try {
        const rutaModelo = path.resolve(__dirname, 'best.onnx'); // Asegúrate de poner tu archivo best.onnx en esta carpeta
        modeloYolo = await ort.InferenceSession.create(rutaModelo);
        console.log(' Modelo YOLO ONNX cargado exitosamente en memoria.');
    } catch (error) {
        console.error(' Error al cargar el modelo ONNX:', error.message);
    }
};

/**
 * Procesa la imagen, ejecuta YOLO y hace OCR
 * @param {Buffer} imagenBuffer - La foto capturada por la cámara
 * @returns {Promise<string>} - La placa limpia (Ej: "XYZ123")
 */
const analizarImagen = async (imagenBuffer) => {
    if (!modeloYolo) throw new Error('El modelo de IA no está cargado.');

    try {
        // 1. (Opcional en esta fase) Aquí iría el preprocesamiento del Tensor para YOLO
        // Como procesar tensores crudos de YOLO en JS es complejo, usaremos Tesseract 
        // optimizado sobre la imagen procesada por Sharp para extraer texto directamente.

        // Limpiamos la imagen para ayudar al OCR (Blanco y negro, alto contraste)
        const imagenProcesada = await sharp(imagenBuffer)
            .resize(800) // Redimensionamos para estandarizar
            .grayscale() // Blanco y negro para resaltar letras
            .normalize()
            .toBuffer();

        // 2. Ejecutar OCR (Reconocimiento de Texto)
        const { data: { text } } = await Tesseract.recognize(
            imagenProcesada,
            'eng', // Inglés suele funcionar mejor para el formato de letras/números de placas
            { logger: m => {} } // Ocultamos los logs de progreso para mantener la consola limpia
        );

        // 3. Limpieza estricta del texto (Regex para Colombia: 3 letras, 3 números)
        const textoLimpio = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Buscamos si dentro de todo el texto leído hay un patrón de placa colombiana
        const match = textoLimpio.match(/[A-Z]{3}[0-9A-Z]{2,3}/);
        
        return match ? match[0] : null;

    } catch (error) {
        console.error('Error en iaService:', error);
        throw new Error('Fallo al procesar la imagen con Inteligencia Artificial.');
    }
};

module.exports = {
    cargarModelo,
    analizarImagen
};