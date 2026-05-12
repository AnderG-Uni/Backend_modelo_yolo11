const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');

router.post('/registrar', vehiculoController.registrar);
router.get('/', vehiculoController.obtenerTodos);

// Rutas de búsqueda
router.get('/buscar/:termino', vehiculoController.buscarDinamico);
router.get('/:placa', vehiculoController.buscarPorPlaca);

module.exports = router;