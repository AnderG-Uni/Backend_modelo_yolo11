const express = require('express');
const router = express.Router();
const multer = require('multer');
const { escanearPlaca } = require('../controllers/reconocimientoController');
// Importamos el servicio directamente para llamarlo rápido
const iaService = require('../services/iaService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/escanear', upload.single('imagen'), escanearPlaca);

// NUEVA RUTA PARA CANCELAR TODO
router.post('/cancelar', (req, res) => {
    iaService.detenerEscaneo();
    res.status(200).json({ estado: 'OK', mensaje: 'Proceso abortado' });
});

module.exports = router;