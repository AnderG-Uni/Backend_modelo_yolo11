const historialService = require('../services/historialService');

const obtenerTodos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { registros, total } = await historialService.obtenerHistorialPaginado(page, limit);

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
};

const obtenerPorPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        const registros = await historialService.obtenerHistorialPorPlaca(placa);
        
        res.status(200).json({ estado: 'OK', datos: registros });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error al cargar el historial del vehículo' });
    }
};

module.exports = { obtenerTodos, obtenerPorPlaca };