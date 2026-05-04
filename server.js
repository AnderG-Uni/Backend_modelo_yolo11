// Importamos la configuración de variables de entorno al inicio
require('dotenv').config();
const connectDB = require('./src/config/database');
const rutasVehiculos = require('./src/routes/vehiculoRoutes');
const rutasReconocimiento = require('./src/routes/reconocimientoRoutes');
const iaService = require('./src/services/iaService');

// Importación de librerías principales
const express = require('express');
const cors = require('cors');

// Inicializamos la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3000;



// ==========================================
// 1. MIDDLEWARES GLOBALES
// ==========================================

// Habilitar CORS: Permite que tu frontend en React se comunique con esta API
// En producción, se debe cambiar '*' por la URL exacta de tu web.
app.use(cors({ origin: '*' }));

// Permite al servidor entender peticiones con formato JSON
app.use(express.json());

// Permite procesar datos enviados desde formularios HTML estándar
app.use(express.urlencoded({ extended: true }));


// ==========================================
// 2. DEFINICIÓN DE RUTAS (ENDPOINTS)
// ==========================================

// Endpoint de Salud (Health Check) - Vital para monitoreo
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        estado: 'OK',
        mensaje: 'El servidor está funcionando correctamente',
        fecha: new Date().toISOString()
    });
});

// Nota: Aquí importaremos las rutas de reconocimiento más adelante.
// Ejemplo futuro:
app.use('/api/v1/vehiculos', rutasVehiculos);
app.use('/api/v1/reconocimiento', rutasReconocimiento);
// const rutasReconocimiento = require('./src/routes/reconocimientoRoutes');


// ==========================================
// 3. MANEJO GLOBAL DE ERRORES
// ==========================================

// Si una ruta no existe (Error 404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores inesperados (Error 500)
// Atrapa cualquier error que ocurra en la lógica de negocio y evita que el servidor se caiga
app.use((err, req, res, next) => {
    console.error('[Error Inesperado del Servidor]:', err.stack);
    res.status(500).json({ 
        error: 'Ocurrió un error interno en el servidor',
        detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// Conectar a la Base de Datos
connectDB();

// Cargamos el modelo de IA en memoria al iniciar el servidor para optimizar rendimiento  
iaService.cargarModelo(); 

// ==========================================
// 4. INICIALIZACIÓN DEL SERVIDOR
// ==========================================

const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` Servidor iniciado exitosamente.`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
});

// ==========================================
// 5. APAGADO ELEGANTE (GRACEFUL SHUTDOWN)
// ==========================================
// Detecta cuando detienes el servidor (ej: presionando Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n Señal de apagado, cerrando conexiones...');
    server.close(() => {
        console.log(' Servidor apagado de forma segura.');
        process.exit(0);
    });
});