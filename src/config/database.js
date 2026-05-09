const mongoose = require('mongoose');

/**
 * Función asíncrona para conectar a MongoDB.
 * Implementa el patrón "Fail-Fast": si la base de datos no conecta al inicio,
 * el servidor se detiene, ya que la API no puede funcionar sin ella.
 */
const connectDB = async () => {
    try {
        // Intentamos la conexión usando la variable de entorno
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`=========================================`);
        console.log(` MongoDB Conectado: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(` Error de conexión a MongoDB: ${error.message}`);
        // Salir del proceso con estado de error (1)
        process.exit(1); 
    }
};

// ==========================================
// EVENTOS DE LA BASE DE DATOS (Buenas Prácticas)
// ==========================================

// Si la conexión se pierde después de haber iniciado
mongoose.connection.on('disconnected', () => {
    console.warn(' Se ha perdido la conexión con MongoDB. Intentando reconectar...');
});

// Si ocurre un error en la conexión ya establecida
mongoose.connection.on('error', (err) => {
    console.error(' Error crítico en MongoDB:', err);
});

module.exports = connectDB;