document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const mantenimientoBtn = document.getElementById('mantenimientoBtn');
    const mantenimientoDropdown = document.getElementById('mantenimientoDropdown');
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
});