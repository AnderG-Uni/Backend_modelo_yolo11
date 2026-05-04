const mongoose = require('mongoose');

// 1. Definición del Esquema (Molde de los datos)
const vehiculoSchema = new mongoose.Schema({
    Nombres: {
        type: String,
        required: [true, 'El nombre del propietario es obligatorio.'],
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    id_universitario: {
        type: String,
        required: [true, 'El ID universitario es obligatorio.'],
        unique: true, // Garantiza que no haya dos personas con el mismo ID
        trim: true
    },
    fecha_registro: {
        type: Date,
        default: Date.now // Si no se envía fecha, pone la fecha y hora actual automáticamente
    },
    Placa: {
        type: String,
        required: [true, 'La placa del vehículo es obligatoria.'],
        unique: true, // Una placa no puede estar registrada dos veces
        uppercase: true, // Convierte automáticamente "xyz123" a "XYZ123"
        trim: true,
        // Expresión regular para placas de Colombia (3 letras seguidas de 2 o 3 números/letras)
        match: [/^[A-Z]{3}[0-9A-Z]{2,3}$/, 'El formato de la placa no es válido. Ej: XYZ123']
    },
    Tipo_vehiculo: {
        type: String,
        required: [true, 'El tipo de vehículo es obligatorio.'],
        // Enum limita las opciones exactas que se pueden guardar en la base de datos
        enum: {
            values: ['Automóvil', 'Motocicleta', 'Camioneta', 'Otro'],
            message: '{VALUE} no es un tipo de vehículo permitido.'
        }
    },
    color: {
        type: String,
        required: [true, 'El color del vehículo es obligatorio.'],
        trim: true,
        lowercase: true // Normalizamos el color a minúsculas para búsquedas más fáciles
    }
}, {
    // 2. Configuraciones Adicionales
    timestamps: true, // Crea automáticamente los campos 'createdAt' y 'updatedAt'
    versionKey: false // Evita que Mongoose guarde el campo '__v' (metadatos internos)
});

// ==========================================
// ÍNDICES PARA ALTO RENDIMIENTO (Buenas Prácticas)
// ==========================================
// Al poner index: true en la Placa, las búsquedas cuando la cámara detecte un vehículo serán ultrarrápidas
vehiculoSchema.index({ Placa: 1 });

// 3. Exportar el Modelo
// El tercer parámetro 'vehiculos' fuerza a Mongoose a usar el nombre exacto de tu colección en Compass
module.exports = mongoose.model('modelo_yolo11', vehiculoSchema, 'placas');