const fs = require('fs');
const path = require('path');
const iaService = require('../services/iaService');
const Vehiculo = require('../models/Vehiculo');
const Historial = require('../models/Historial');

// ==========================================
// Escanear placa desde imagen (Función principal del reconocimiento)
// ==========================================
const escanearPlaca = async (req, res) => {
    // ... (Tu código actual de escanearPlaca se mantiene igualito)
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
            const tiempoDeCooldown = 60000; 
            let accionDetectada = 'INGRESO';

            const ultimoRegistro = await Historial.findOne({ placa: placaDetectada }).sort({ fecha_ingreso: -1 });

            if (ultimoRegistro) {
                if (!ultimoRegistro.fecha_salida) {
                    const tiempoAdentro = ahora.getTime() - ultimoRegistro.fecha_ingreso.getTime();
                    if (tiempoAdentro < tiempoDeCooldown) {
                        return res.status(200).json({ estado: 'FAIL', mensaje: 'Cooldown activo...' });
                    } else {
                        ultimoRegistro.fecha_salida = ahora;
                        await ultimoRegistro.save();
                        accionDetectada = 'SALIDA';
                    }
                } else {
                    const tiempoAfuera = ahora.getTime() - ultimoRegistro.fecha_salida.getTime();
                    if (tiempoAfuera < tiempoDeCooldown) {
                        return res.status(200).json({ estado: 'FAIL', mensaje: 'Cooldown activo...' });
                    } else {
                        const nuevoIngreso = new Historial({
                            placa: placaDetectada, propietario: vehiculoPermitido.Nombres,
                            fecha_ingreso: ahora
                        });
                        await nuevoIngreso.save();
                    }
                }
            } else {
                const nuevoIngreso = new Historial({
                    placa: placaDetectada, propietario: vehiculoPermitido.Nombres,
                    fecha_ingreso: ahora
                });
                await nuevoIngreso.save();
            }

            return res.status(200).json({
                estado: 'OK', placa: placaDetectada,
                mensaje: accionDetectada === 'INGRESO' ? 'Acceso Permitido' : 'Vehículo Retirado',
                confianza: nivelConfianza, box: box,
                datosVehiculo: vehiculoPermitido, accion: accionDetectada
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

// ==========================================
// Registrar Ingreso/Salida de forma manual (para casos donde el reconocimiento falle o para visitantes autorizados)
// ==========================================
const registrarManual = async (req, res) => {
    try {
        const { placa } = req.body;
        if (!placa) return res.status(400).json({ estado: 'FAIL', mensaje: 'Placa requerida.' });

        const vehiculoPermitido = await Vehiculo.findOne({ Placa: placa.toUpperCase() });
        if (!vehiculoPermitido) {
            return res.status(404).json({ estado: 'FAIL', mensaje: 'Vehículo no registrado' });
        }

        const ahora = new Date();
        const tiempoDeCooldown = 60000;
        let accionDetectada = 'INGRESO';

        const ultimoRegistro = await Historial.findOne({ placa: vehiculoPermitido.Placa }).sort({ fecha_ingreso: -1 });

        if (ultimoRegistro) {
            if (!ultimoRegistro.fecha_salida) {
                const tiempoAdentro = ahora.getTime() - ultimoRegistro.fecha_ingreso.getTime();
                if (tiempoAdentro < tiempoDeCooldown) {
                    return res.status(200).json({ estado: 'FAIL', mensaje: 'Bloqueo activo (Acaba de registrarse)...' });
                } else {
                    ultimoRegistro.fecha_salida = ahora;
                    await ultimoRegistro.save();
                    accionDetectada = 'SALIDA';
                }
            } else {
                const tiempoAfuera = ahora.getTime() - ultimoRegistro.fecha_salida.getTime();
                if (tiempoAfuera < tiempoDeCooldown) {
                    return res.status(200).json({ estado: 'FAIL', mensaje: 'Bloqueo activo (Acaba de registrarse)...' });
                } else {
                    const nuevoIngreso = new Historial({
                        placa: vehiculoPermitido.Placa, propietario: vehiculoPermitido.Nombres,
                        fecha_ingreso: ahora
                    });
                    await nuevoIngreso.save();
                }
            }
        } else {
            const nuevoIngreso = new Historial({
                placa: vehiculoPermitido.Placa, propietario: vehiculoPermitido.Nombres,
                fecha_ingreso: ahora
            });
            await nuevoIngreso.save();
        }

        return res.status(200).json({
            estado: 'OK',
            placa: vehiculoPermitido.Placa,
            mensaje: accionDetectada === 'INGRESO' ? 'Acceso Permitido' : 'Vehículo Retirado',
            accion: accionDetectada,
            datosVehiculo: vehiculoPermitido
        });
    } catch (error) {
        console.error("Error manual:", error.message);
        res.status(500).json({ estado: 'FAIL', error: 'Error interno en servidor.' });
    }
};

// ==========================================
// Registrar Ingreso de Visitantes (Especial para casos donde el vehículo no está registrado pero se le quiere permitir el acceso por ser un visitante autorizado)
// ==========================================
const registroIngresoVisitante = async (req, res) => {
    try {
        const { nombres, identificacion, placa, color, observaciones } = req.body;

        if (!req.file) {
            return res.status(400).json({ estado: 'FAIL', mensaje: 'La foto del vehículo es obligatoria.' });
        }

        // VALIDACIÓN: Revisar si el vehículo ya está adentro (tiene fecha_ingreso pero no fecha_salida)
        const visitaActiva = await Historial.findOne({ 
            placa: placa.toUpperCase(), 
            fecha_salida: null 
        });

        if (visitaActiva) {
            return res.status(400).json({ 
                estado: 'FAIL', 
                mensaje: `El vehículo ${placa.toUpperCase()} ya se encuentra adentro. Registre su salida primero.` 
            });
        }

        const dir = path.join(__dirname, '../../uploads/visitantes');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // ===============================================================
        // LIMPIEZA DE FOTOS ANTERIORES PARA AHORRAR ESPACIO
        // ===============================================================
        const sufijoPlaca = `_${placa.toUpperCase()}.jpg`;
        const archivos = fs.readdirSync(dir); 
        
        archivos.forEach(archivo => {
            if (archivo.endsWith(sufijoPlaca)) {
                try {
                    fs.unlinkSync(path.join(dir, archivo));
                } catch (err) {
                    console.error("Error al intentar borrar imagen antigua:", err);
                }
            }
        });

        // ===============================================================
        // Guardamos la nueva foto con el timestamp actual
        // ===============================================================
        const fileName = `${Date.now()}_${placa.toUpperCase()}.jpg`;
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);

        const ruta_foto = `/uploads/visitantes/${fileName}`;

        const nuevoVisitante = new Historial({
            placa: placa.toUpperCase(),
            propietario: nombres,
            identificacion,
            color,
            observaciones,
            ruta_foto,
            tipo_registro: 'Visitante'
        });

        await nuevoVisitante.save();

        res.status(200).json({ estado: 'OK', mensaje: 'Visitante registrado con éxito.' });

    } catch (error) {
        console.error("Error al registrar visitante:", error);
        res.status(500).json({ estado: 'FAIL', mensaje: 'Error interno del servidor guardando visitante.' });
    }
};


// ==========================================
// Registrar Salida de Visitantes (Para registrar la salida de un visitante que fue registrado sin placa o con placa no autorizada, se buscará el último ingreso activo y se le asignará la hora de salida actual)
// ==========================================
const registroSalidaVisitante = async (req, res) => {
    try {
        const { placa } = req.body;
        
        if (!placa) {
            return res.status(400).json({ estado: 'FAIL', mensaje: 'La placa es obligatoria.' });
        }

        // Buscamos el ingreso que aún no tiene salida
        const visitaActiva = await Historial.findOne({ 
            placa: placa.toUpperCase(), 
            fecha_salida: null 
        }).sort({ fecha_ingreso: -1 });

        if (!visitaActiva) {
            return res.status(404).json({ 
                estado: 'FAIL', 
                mensaje: `No se encontró un ingreso activo para la placa ${placa.toUpperCase()}.` 
            });
        }

        // Registramos la salida con la hora exacta de ahora
        visitaActiva.fecha_salida = new Date();
        await visitaActiva.save();

        res.status(200).json({ estado: 'OK', mensaje: 'Salida registrada con éxito.' });

    } catch (error) {
        console.error("Error al registrar salida de visitante:", error);
        res.status(500).json({ estado: 'FAIL', mensaje: 'Error interno del servidor guardando salida.' });
    }
};


module.exports = { 
    escanearPlaca, 
    registrarManual, 
    registroIngresoVisitante, 
    registroSalidaVisitante
};