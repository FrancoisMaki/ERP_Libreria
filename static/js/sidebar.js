document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');

    const toggleBtn = document.getElementById('toggleSidebar');
    const mantenimientoBtn = document.getElementById('mantenimientoBtn');
    const mantenimientoDropdown = document.getElementById('mantenimientoDropdown');
    
    const ventasBtn = document.getElementById('ventasBtn');
    const ventasDropdown = document.getElementById('ventasDropdown');

    const comprasBtn = document.getElementById('comprasBtn');
    const comprasDropdown = document.getElementById('comprasDropdown');

    const almacenBtn = document.getElementById('almacenBtn');
    const almacenDropdown = document.getElementById('almacenDropdown');

    const estadisticasBtn = document.getElementById('estadisticasBtn');
    const estadisticasDropdown = document.getElementById('estadisticasDropdown');

    const flechaDropdown = document.getElementById('flechaDropdown');

    // Contracción/expansión sidebar
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        sidebar.classList.toggle('contraido');

        // Si contrae, cierra el submenú de mantenimiento
        if (sidebar.classList.contains('contraido')) {
            mantenimientoDropdown.classList.add('hide');
            mantenimientoBtn.classList.remove('mantenimiento-open');
            // Flecha desaparece, lo controla el CSS
        }
    });

    // Expansión submenú de mantenimiento
    mantenimientoBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (sidebar.classList.contains('expanded')) {
            // Toggle submenú solo si expandido
            const abierto = !mantenimientoDropdown.classList.contains('hide');
            if (abierto) {
                mantenimientoDropdown.classList.add('hide');
                mantenimientoBtn.classList.remove('mantenimiento-open');
            } else {
                mantenimientoDropdown.classList.remove('hide');
                mantenimientoBtn.classList.add('mantenimiento-open');
            }
        } else {
            // Si contraído, primero expande el sidebar y después muestra el submenú
            sidebar.classList.remove('contraido');
            sidebar.classList.add('expanded');
            setTimeout(() => {
                mantenimientoDropdown.classList.remove('hide');
                mantenimientoBtn.classList.add('mantenimiento-open');
            }, 300); // espera la animación de expandir
        }
    });

    // Expansión submenú de ventas
    ventasBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (sidebar.classList.contains('expanded')) {
            const abierto = !ventasDropdown.classList.contains('hide');
            if (abierto) {
                ventasDropdown.classList.add('hide');
                ventasBtn.classList.remove('ventas-open');
            } else {
                ventasDropdown.classList.remove('hide');
                ventasBtn.classList.add('ventas-open');
            }
        } else {
            sidebar.classList.remove('contraido');
            sidebar.classList.add('expanded');
            setTimeout(() => {
                ventasDropdown.classList.remove('hide');
                ventasBtn.classList.add('ventas-open');
            }, 300);
        }
    });

    // Expansión submenú de compras
    comprasBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (sidebar.classList.contains('expanded')) {
            const abierto = !comprasDropdown.classList.contains('hide');
            if (abierto) {
                comprasDropdown.classList.add('hide');
                comprasBtn.classList.remove('compras-open');
            } else {
                comprasDropdown.classList.remove('hide');
                comprasBtn.classList.add('compras-open');
            }
        } else {
            sidebar.classList.remove('contraido');
            sidebar.classList.add('expanded');
            setTimeout(() => {
                comprasDropdown.classList.remove('hide');
                comprasBtn.classList.add('compras-open');
            }, 300);
        }
    });

    // Expansión submenú de almacen
    almacenBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (sidebar.classList.contains('expanded')) {
            const abierto = !almacenDropdown.classList.contains('hide');
            if (abierto) {
                almacenDropdown.classList.add('hide');
                almacenBtn.classList.remove('almacen-open');
            } else {
                almacenDropdown.classList.remove('hide');
                almacenBtn.classList.add('almacen-open');
            }
        } else {
            sidebar.classList.remove('contraido');
            sidebar.classList.add('expanded');
            setTimeout(() => {
                almacenDropdown.classList.remove('hide');
                almacenBtn.classList.add('almacen-open');
            }, 300);
        }
    });

    // Expansión submenú de estadísticas
    estadisticasBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (sidebar.classList.contains('expanded')) {
            const abierto = !estadisticasDropdown.classList.contains('hide');
            if (abierto) {
                estadisticasDropdown.classList.add('hide');
                estadisticasBtn.classList.remove('estadisticas-open');
            } else {
                estadisticasDropdown.classList.remove('hide');
                estadisticasBtn.classList.add('estadisticas-open');
            }
        } else {
            sidebar.classList.remove('contraido');
            sidebar.classList.add('expanded');
            setTimeout(() => {
                estadisticasDropdown.classList.remove('hide');
                estadisticasBtn.classList.add('estadisticas-open');
            }, 300);
        }
    });
    
});