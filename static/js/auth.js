document.addEventListener('DOMContentLoaded', function() {
    function cargarPaises() {
    fetch('/api/paises/?pagina=1&por_pagina=10')
        .then(response => {
        if (response.status === 401) {
            window.location.href = '/login';
            throw new Error('No autorizado');
        }
        return response.json();
        })
        .then(data => {
        // Procesar y mostrar los países
        })
        .catch(error => {
        console.error('Error al cargar países:', error);
        });
    }
});
