const express = require('express');
const router = express.Router();
const reconocimientoController = require('../controllers/reconocimientoController');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route   POST /api/v1/reconocimiento/escanear
 * @desc    Recibe un frame de video, procesa la IA y valida acceso
 */
// El middleware 'upload.single('imagen')' extrae el archivo que el frontend envió con el nombre 'imagen'
router.post('/escanear', upload.single('imagen'), reconocimientoController.escanearPlaca);

module.exports = router;