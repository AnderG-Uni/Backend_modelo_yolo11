require('dotenv').config();
const connectDB = require('./src/config/database');
const rutasVehiculos = require('./src/routes/vehiculoRoutes');
const rutasReconocimiento = require('./src/routes/reconocimientoRoutes');
const rutasHistorial = require('./src/routes/historialRoutes');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ estado: 'OK', mensaje: 'El servidor está funcionando correctamente', fecha: new Date().toISOString() });
});

app.use('/api/v1/vehiculos', rutasVehiculos);
app.use('/api/v1/reconocimiento', rutasReconocimiento);
app.use('/api/v1/historial', rutasHistorial);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('[Error Inesperado del Servidor]:', err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor', detalle: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const verificarApiPython = async () => {
    let pythonListo = false;
    console.log('Esperando a que la Inteligencia Artificial cargue los modelos...');
    console.log(`================================================================`);
    
    while (!pythonListo) {
        try {
            const response = await fetch('http://localhost:8000/health');
            if (response.ok) {
                pythonListo = true;
                console.log(`✅ SISTEMA PREPARADO. ¡Puedes escanear placas ahora!`);
                console.log(`=========================================================`);

            }
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

// ==========================================
// 4. INICIALIZACIÓN DEL SERVIDOR (ORDEN CORREGIDO)
// ==========================================

// 1. Primero, obligamos a que espere a MongoDB
connectDB().then(() => {
    
    // 2. SOLO cuando MongoDB responda, encendemos el servidor Node.js
    const server = app.listen(PORT, () => {
        console.log(` Servidor Node.js iniciado exitosamente.`);
        console.log(` URL: http://localhost:${PORT}`);
        console.log(`=========================================`);
        
        // 3. Y por último, empezamos a "hacerle ping" a Python
        verificarApiPython();
    });

    // Evento de apagado elegante (Graceful Shutdown)
    process.on('SIGINT', () => {
        console.log('\n Señal de apagado, cerrando conexiones...');
        server.close(() => {
            console.log(' Servidor apagado de forma segura.');
            process.exit(0);
        });
    });

});