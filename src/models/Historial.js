const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: true,
        uppercase: true
    },
    propietario: {
        type: String,
        required: true
    },
    fecha_ingreso: {
        type: Date,
        default: Date.now
    },
    // NUEVO: Campo para registrar cuándo sale el vehículo
    fecha_salida: {
        type: Date,
        default: null 
    },
    estado_acceso: {
        type: String,
        default: 'Permitido'
    }
}, {
    versionKey: false
});

historialSchema.index({ fecha_ingreso: -1 });

module.exports = mongoose.model('Historial', historialSchema, 'historial_ingresos');