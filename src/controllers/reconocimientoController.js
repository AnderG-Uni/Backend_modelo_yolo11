const iaService = require('../services/iaService');
const Vehiculo = require('../models/Vehiculo');

const escanearPlaca = async (req, res) => {
    try {
        // 1. Verificar que llegó una imagen
        if (!req.file) {
            return res.status(400).json({ estado: 'FAIL', error: 'No se envió ninguna imagen.' });
        }

        // 2. Enviar la imagen (Buffer) al motor de Inteligencia Artificial
        const placaDetectada = await iaService.analizarImagen(req.file.buffer);

        if (!placaDetectada) {
            return res.status(200).json({ 
                estado: 'FAIL', 
                mensaje: 'No se detectó ninguna placa legible en la imagen.' 
            });
        }

        // 3. Buscar la placa extraída en MongoDB (modelo_yolo11 -> placas)
        const vehiculoPermitido = await Vehiculo.findOne({ Placa: placaDetectada });

        if (vehiculoPermitido) {
            // ¡Acceso concedido!
            return res.status(200).json({
                estado: 'OK',
                placa: placaDetectada,
                mensaje: 'Acceso Permitido',
                propietario: vehiculoPermitido.Nombres
            });
        } else {
            // Placa leída perfectamente, pero no está en la base de datos
            return res.status(200).json({
                estado: 'FAIL',
                placa: placaDetectada,
                mensaje: 'Acceso Denegado: Vehículo no registrado.'
            });
        }

    } catch (error) {
        console.error("Error en reconocimientoController:", error.message);
        res.status(500).json({ estado: 'FAIL', error: 'Error interno procesando el escaneo.' });
    }
};

module.exports = { escanearPlaca };