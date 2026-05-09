const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');

router.get('/', async (req, res) => {
    try {
        // Paginación: Por defecto página 1, límite de 10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Buscamos con paginación
        const registros = await Historial.find()
            .sort({ fecha_ingreso: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Historial.countDocuments();

        res.status(200).json({ 
            estado: 'OK', 
            datos: registros,
            paginacion: {
                totalRegistros: total,
                paginaActual: page,
                totalPaginas: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error al obtener el historial' });
    }
});

module.exports = router;