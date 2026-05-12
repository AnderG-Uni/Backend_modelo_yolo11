const vehiculoService = require('../services/vehiculoService');

const registrar = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ estado: 'FAIL', error: 'El cuerpo de la petición está vacío.' });
        }
        const vehiculoGuardado = await vehiculoService.registrarNuevoVehiculo(req.body);
        res.status(201).json({ estado: 'OK', mensaje: 'Vehículo registrado', datos: vehiculoGuardado });
    } catch (error) {
        res.status(400).json({ estado: 'FAIL', error: 'No se pudo guardar', detalle: error.message });
    }
};

const obtenerTodos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { vehiculos, total } = await vehiculoService.obtenerVehiculosPaginados(page, limit);

        res.status(200).json({
            estado: 'OK', datos: vehiculos, paginacion: { totalRegistros: total, paginaActual: page, totalPaginas: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error al obtener la lista' });
    }
};

// NUEVO: Controlador para búsqueda dinámica
const buscarDinamico = async (req, res) => {
    try {
        const { termino } = req.params;
        const resultados = await vehiculoService.buscarVehiculosDinamico(termino);
        res.status(200).json({ estado: 'OK', datos: resultados });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error en la búsqueda dinámica' });
    }
};

// NUEVO: Controlador para búsqueda exacta por placa
const buscarPorPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        const vehiculo = await vehiculoService.obtenerVehiculoPorPlaca(placa);
        
        if (!vehiculo) return res.status(404).json({ estado: 'FAIL', mensaje: 'Vehículo no encontrado' });
        
        res.status(200).json({ estado: 'OK', datos: vehiculo });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error al buscar vehículo' });
    }
};

module.exports = { registrar, obtenerTodos, buscarDinamico, buscarPorPlaca };