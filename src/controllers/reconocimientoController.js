const iaService = require('../services/iaService');
const Vehiculo = require('../models/Vehiculo');
const Historial = require('../models/Historial');

const escanearPlaca = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ estado: 'FAIL', error: 'No se envió imagen.' });

        const resultadoIA = await iaService.analizarImagen(req.file.buffer);

        if (resultadoIA.estado === 'FAIL') {
            return res.status(200).json({ estado: 'FAIL', mensaje: 'Buscando...' });
        }

        const placaDetectada = resultadoIA.placa;
        const nivelConfianza = resultadoIA.confianza; 
        const box = resultadoIA.box; 

        if (nivelConfianza < 60) {
            return res.status(200).json({
                estado: 'FAIL', placa: placaDetectada,
                mensaje: `Confianza baja (${nivelConfianza}%)`, confianza: nivelConfianza, box: box
            });
        }

        const vehiculoPermitido = await Vehiculo.findOne({ Placa: placaDetectada });

        if (vehiculoPermitido) {
            const ahora = new Date();
            const tiempoDeCooldown = 60000; // 60 segundos
            let accionDetectada = 'INGRESO';

            // 1. Buscamos el ÚLTIMO registro de esta placa
            const ultimoRegistro = await Historial.findOne({ placa: placaDetectada }).sort({ fecha_ingreso: -1 });

            if (ultimoRegistro) {
                if (!ultimoRegistro.fecha_salida) {
                    // EL VEHÍCULO ESTÁ ADENTRO: Significa que está intentando salir
                    const tiempoAdentro = ahora.getTime() - ultimoRegistro.fecha_ingreso.getTime();
                    
                    if (tiempoAdentro < tiempoDeCooldown) {
                        // Anti-Spam: Acaba de entrar, ignoramos la lectura
                        return res.status(200).json({ estado: 'FAIL', mensaje: 'Cooldown activo...' });
                    } else {
                        // Registrar SALIDA
                        ultimoRegistro.fecha_salida = ahora;
                        await ultimoRegistro.save();
                        accionDetectada = 'SALIDA';
                    }
                } else {
                    // EL VEHÍCULO ESTÁ AFUERA: Intentando ingresar de nuevo
                    const tiempoAfuera = ahora.getTime() - ultimoRegistro.fecha_salida.getTime();
                    
                    if (tiempoAfuera < tiempoDeCooldown) {
                        return res.status(200).json({ estado: 'FAIL', mensaje: 'Cooldown activo...' });
                    } else {
                        // Nuevo INGRESO
                        const nuevoIngreso = new Historial({
                            placa: placaDetectada, propietario: vehiculoPermitido.Nombres,
                            fecha_ingreso: ahora
                        });
                        await nuevoIngreso.save();
                    }
                }
            } else {
                // NUNCA HA ESTADO: Es su primer ingreso
                const nuevoIngreso = new Historial({
                    placa: placaDetectada, propietario: vehiculoPermitido.Nombres,
                    fecha_ingreso: ahora
                });
                await nuevoIngreso.save();
            }

            // Devolvemos a React si fue un ingreso o una salida
            return res.status(200).json({
                estado: 'OK',
                placa: placaDetectada,
                mensaje: accionDetectada === 'INGRESO' ? 'Acceso Permitido' : 'Vehículo Retirado',
                confianza: nivelConfianza,
                box: box,
                datosVehiculo: vehiculoPermitido,
                accion: accionDetectada // 'INGRESO' o 'SALIDA'
            });

        } else {
            return res.status(200).json({
                estado: 'FAIL', placa: placaDetectada,
                mensaje: `DENEGADO: ${placaDetectada} NO REGISTRADA`, confianza: nivelConfianza, box: box
            });
        }
    } catch (error) {
        console.error("Error backend:", error.message);
        res.status(500).json({ estado: 'FAIL', error: 'Error interno.' });
    }
};

module.exports = { escanearPlaca };