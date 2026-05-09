const FormData = require('form-data');
const fetch = require('node-fetch');

const analizarImagen = async (imagenBuffer) => {
    try {
        const formData = new FormData();
        formData.append('imagen', imagenBuffer, { filename: 'frame.jpg' });

        const response = await fetch('http://localhost:8000/detectar', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error conectando con el microservicio Python:', error.message);
        throw new Error('Fallo al procesar la imagen con Inteligencia Artificial.');
    }
};

module.exports = { analizarImagen };