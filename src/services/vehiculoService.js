const Vehiculo = require('../models/Vehiculo');

/**
 * Servicio para registrar un nuevo vehículo en MongoDB
 * @param {Object} datosVehiculo - Los datos enviados desde el frontend/Postman
 * @returns {Promise<Object>} - El documento guardado
 */
const registrarNuevoVehiculo = async (datosVehiculo) => {
    // Creamos la instancia con el modelo
    const nuevoVehiculo = new Vehiculo(datosVehiculo);
    
    // Guardamos en la base de datos (modelo_yolo11 -> placas)
    const vehiculoGuardado = await nuevoVehiculo.save();
    
    return vehiculoGuardado;
};

module.exports = {
    registrarNuevoVehiculo
};