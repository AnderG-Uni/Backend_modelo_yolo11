const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

// Obtener todo el historial paginado
router.get('/', historialController.obtenerTodos);

// Obtener el historial específico de un vehículo
router.get('/vehiculo/:placa', historialController.obtenerPorPlaca);

module.exports = router;