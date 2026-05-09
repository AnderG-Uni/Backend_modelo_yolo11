const vehiculoService = require('../services/vehiculoService');

/**
 * Controlador para manejar la petición POST de registro
 */
const registrar = async (req, res) => {
    try {
        // DEBUG: Esto nos dirá exactamente qué está recibiendo el servidor de Postman
        console.log(" Datos recibidos en el Body:", req.body);

        // Si el body llega vacío ({}), detenemos el proceso inmediatamente
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                estado: 'FAIL',
                error: 'El cuerpo de la petición está vacío. Verifica que en Postman seleccionaste raw -> JSON.'
            });
        }

        // Llamamos al servicio para guardar los datos
        const vehiculoGuardado = await vehiculoService.registrarNuevoVehiculo(req.body);

        // Respondemos al cliente
        res.status(201).json({
            estado: 'OK',
            mensaje: 'Vehículo registrado exitosamente en la BD',
            datos: vehiculoGuardado
        });

    } catch (error) {
        // DEBUG: Imprime el error exacto en la consola si Mongoose lo rechaza
        console.error(" Error de validación en BD:", error.message);
        
        res.status(400).json({
            estado: 'FAIL',
            error: 'No se pudo guardar el vehículo',
            detalle: error.message
        });
    }
};


//Controlador para obtener la lista de vehículos registrados con paginación
const obtenerTodos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { vehiculos, total } = await vehiculoService.obtenerVehiculosPaginados(page, limit);

        res.status(200).json({
            estado: 'OK',
            datos: vehiculos,
            paginacion: {
                totalRegistros: total,
                paginaActual: page,
                totalPaginas: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ estado: 'FAIL', error: 'Error al obtener la lista de vehículos' });
    }
};

module.exports = {
    registrar,
    obtenerTodos
};