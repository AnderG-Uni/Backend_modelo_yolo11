const Vehiculo = require('../models/Vehiculo');

const registrarNuevoVehiculo = async (datosVehiculo) => {
    const nuevoVehiculo = new Vehiculo(datosVehiculo);
    return await nuevoVehiculo.save();
};

const obtenerVehiculosPaginados = async (page, limit) => {
    const skip = (page - 1) * limit;
    const vehiculos = await Vehiculo.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Vehiculo.countDocuments();
    return { vehiculos, total };
};

// NUEVO: Búsqueda dinámica (Autocomplete)
const buscarVehiculosDinamico = async (termino) => {
    // $regex permite buscar coincidencias parciales. 'i' ignora mayúsculas/minúsculas.
    const regex = new RegExp(termino, 'i');
    const vehiculos = await Vehiculo.find({
        $or: [
            { Placa: regex },
            { Nombres: regex },
            { id_universitario: regex }
        ]
    }).limit(10); // Limitamos a 10 para no saturar la red en cada teclazo
    return vehiculos;
};

// Búsqueda de un vehículo exacto por su placa
const obtenerVehiculoPorPlaca = async (placa) => {
    return await Vehiculo.findOne({ Placa: placa.toUpperCase() });
};

module.exports = {
    registrarNuevoVehiculo, 
    obtenerVehiculosPaginados,
    buscarVehiculosDinamico,
    obtenerVehiculoPorPlaca
};