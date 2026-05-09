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

// obtener los vehiculos registrados con paginación (para la tabla del frontend)
const obtenerVehiculosPaginados = async (page, limit) => {
    const skip = (page - 1) * limit;
    // Buscamos ordenando por los más recientes primero
    const vehiculos = await Vehiculo.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Vehiculo.countDocuments();
    return { vehiculos, total };
};

module.exports = {
    registrarNuevoVehiculo, obtenerVehiculosPaginados
};