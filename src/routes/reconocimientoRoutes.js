const express = require('express');
const router = express.Router();
const multer = require('multer');
const { escanearPlaca, registrarManual, registroIngresoVisitante, registroSalidaVisitante } = require('../controllers/reconocimientoController');
const iaService = require('../services/iaService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/escanear', upload.single('imagen'), escanearPlaca);

router.post('/manual', registrarManual);

router.post('/cancelar', (req, res) => { res.status(200).json({ estado: 'OK', mensaje: 'Proceso abortado desde el cliente' }); });

// para registrar ingresos de visitantes autorizados (sin placa o con placa no registrada)
router.post('/registro-ingreso', upload.single('imagen'), registroIngresoVisitante);

// Registrar salida de visitantes (sin placa o con placa no registrada)
router.post('/registro-salida-visitante', express.json(), registroSalidaVisitante);

module.exports = router;