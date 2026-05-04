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

module.exports = {
    registrar
};