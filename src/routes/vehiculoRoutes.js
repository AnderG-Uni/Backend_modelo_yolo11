const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');

/**
 * @route   POST /api/v1/vehiculos/registrar
 * @desc    Registra un nuevo vehículo en la base de datos
 */
router.post('/registrar', vehiculoController.registrar);

module.exports = router;