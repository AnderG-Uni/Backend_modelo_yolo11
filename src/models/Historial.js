const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    placa: { type: String, required: true, uppercase: true },
    propietario: { type: String, required: true },
    fecha_ingreso: { type: Date, default: Date.now },
    fecha_salida: { type: Date, default: null },
    estado_acceso: { type: String, default: 'Permitido' },
    
    // =====================================
    // NUEVOS CAMPOS (Especiales para visitantes)
    // =====================================
    tipo_registro: { 
        type: String, 
        enum: ['Autorizado', 'Visitante'], 
        default: 'Autorizado' 
    },
    identificacion: { type: String, default: null },
    color: { type: String, default: null },
    observaciones: { type: String, default: null },
    ruta_foto: { type: String, default: null } // Aquí guardaremos la URL de la imagen

}, { versionKey: false });

historialSchema.index({ fecha_ingreso: -1 });

module.exports = mongoose.model('Historial', historialSchema, 'historial_ingresos');