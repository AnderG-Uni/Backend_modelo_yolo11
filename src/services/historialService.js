const Historial = require('../models/Historial');

const obtenerHistorialPaginado = async (page, limit) => {
    const skip = (page - 1) * limit;
    const registros = await Historial.find().sort({ fecha_ingreso: -1 }).skip(skip).limit(limit);
    const total = await Historial.countDocuments();
    return { registros, total };
};

// Función para obtener TODOS los ingresos y salidas de una placa específica
const obtenerHistorialPorPlaca = async (placa) => {
    // Buscamos ignorando mayúsculas/minúsculas y ordenamos del más reciente al más antiguo
    const registros = await Historial.find({ placa: placa.toUpperCase() }).sort({ fecha_ingreso: -1 });
    return registros;
};

module.exports = {
    obtenerHistorialPaginado,
    obtenerHistorialPorPlaca
};