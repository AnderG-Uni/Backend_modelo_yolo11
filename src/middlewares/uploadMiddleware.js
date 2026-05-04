const multer = require('multer');

// Usamos almacenamiento en memoria (RAM) para máxima velocidad
// No guardamos la foto en el disco duro porque retrasaría la respuesta
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB por foto para evitar saturación
    },
    fileFilter: (req, file, cb) => {
        // Solo aceptamos imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no soportado. Solo imágenes.'), false);
        }
    }
});

module.exports = upload;