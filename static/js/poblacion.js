document.addEventListener("DOMContentLoaded", () => {
    function fetchProtegido(url, options = {}) {
        return fetch(url, options)
            .then(response => {
                if (response.status === 401) {
                    window.location.href = '/login';
                    throw new Error('No autorizado');
                }
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || "Error al cargar poblaciones");
                    });
                }
                return response.json();
            });
    }

    const API_BASE = "/api/poblaciones/";

    // Variables y elementos globales
    const tablaContainer = document.getElementById("tablaPoblaciones");
    const tbody = document.getElementById("tbodyPoblaciones");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";
    let provinciaidBusqueda = "";
    let paisidBusqueda = "";

    // Inputs de búsqueda y botón
    const buscarNombreInput = document.getElementById("buscarNombrePoblacionInput");
    const buscarProvinciaidInput = document.getElementById("buscarProvinciaidPoblacionInput");
    const buscarPaisidInput = document.getElementById("buscarPaisidPoblacionInput");
    const buscarNombreBtn = document.getElementById("buscarNombrePoblacionBtn");

    // Buscar por nombre, provinciaid y paisid
    buscarNombreBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
        provinciaidBusqueda = buscarProvinciaidInput.value.trim();
        paisidBusqueda = buscarPaisidInput.value.trim().toUpperCase();
        paginaActual = 1;
        cargarPagina(paginaActual);
    });

    const togglePaginacion = mostrar => {
        paginacionContainer.style.display = mostrar ? "flex" : "none";
    };

    // Función principal de carga y paginación
    const cargarPagina = (pagina) => {
        let url = `${API_BASE}?pagina=${pagina}&por_pagina=${porPagina}`;
        if (nombreBusqueda) url += `&nombre=${encodeURIComponent(nombreBusqueda)}`;
        if (provinciaidBusqueda) url += `&provinciaid=${encodeURIComponent(provinciaidBusqueda)}`;
        if (paisidBusqueda) url += `&paisid=${encodeURIComponent(paisidBusqueda)}`;
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const poblaciones = data.poblaciones || [];
                const totalPaginas = data.total_paginas || 1;

                poblaciones.forEach(poblacion => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${poblacion.poblacionid}</td>
                        <td>${poblacion.nombre}</td>
                        <td>${poblacion.provinciaid}</td>
                        <td>${poblacion.paisid}</td>
                        <td>
                            <button>Editar</button>
                            <button>Eliminar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Crear botones de paginación
                paginacionContainer.innerHTML = '';

                const btnAnterior = document.createElement("button");
                btnAnterior.textContent = "Anterior";
                btnAnterior.disabled = pagina <= 1;
                btnAnterior.addEventListener("click", () => {
                    if (paginaActual > 1) {
                        paginaActual--;
                        cargarPagina(paginaActual);
                    }
                });

                const btnSiguiente = document.createElement("button");
                btnSiguiente.textContent = "Siguiente";
                btnSiguiente.disabled = pagina >= totalPaginas;
                btnSiguiente.addEventListener("click", () => {
                    if (paginaActual < totalPaginas) {
                        paginaActual++;
                        cargarPagina(paginaActual);
                    }
                });

                const estado = document.createElement("span");
                estado.textContent = `Página ${pagina} de ${totalPaginas}`;

                paginacionContainer.appendChild(btnAnterior);
                paginacionContainer.appendChild(estado);
                paginacionContainer.appendChild(btnSiguiente);
            })
            .catch(error => {
                console.error("Error al cargar poblaciones:", error);
                tbody.innerHTML = '<tr><td colspan="5">Error al cargar poblaciones.</td></tr>';
            });
    };

    cargarPagina(paginaActual);

    // Mostrar tabla
    tablaContainer.classList.remove("hide");
    cargarPagina(paginaActual);

    // Elementos de formularios
    const formAgregarDiv = document.getElementById("formAgregarPoblacion");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarPoblacionBtn");

    const formEditarDiv = document.getElementById("formEditarPoblacion");
    const formEditarForm = document.getElementById("poblacionEditForm");
    const btnEditar = document.getElementById("editarPoblacionBtn");

    const formEliminarDiv = document.getElementById("formEliminarPoblacion");
    const eliminarPoblacionForm = document.getElementById("eliminarPoblacionForm");
    const btnEliminar = document.getElementById("eliminarPoblacionBtn");

    const buscarNombrePoblacionInput = document.getElementById("buscarNombrePoblacion");
    const buscarProvinciaidPoblacionInput = document.getElementById("buscarProvinciaidPoblacion");
    const buscarPaisidPoblacionInput = document.getElementById("buscarPaisidPoblacion");
    const btnBuscarPoblacion = document.getElementById("btnBuscarPoblacion");

    const formBuscarPoblacionDiv = document.getElementById("busquedaEditarPoblacion");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarPoblacionBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarPoblacionDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarPoblacionForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'editarPoblacionBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarPoblacionForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarPoblacionDiv.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'eliminarPoblacionBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarPoblacionDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarPoblacionForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEliminar.disabled = true;
                btnAgregar.disabled = false;
                btnEditar.disabled = false;
                break;

            default:
                console.log('Acción desconocida');
        }
    }

    btnAgregar.addEventListener("click", manejarAccion);
    btnEditar.addEventListener("click", manejarAccion);
    btnEliminar.addEventListener("click", manejarAccion);

    // Delegación de eventos en la tabla para editar y eliminar
    tbody.addEventListener('click', function(event) {
        const btn = event.target;
        if (btn.tagName !== 'BUTTON') return;
        const fila = btn.closest('tr');
        const poblacionid = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const provinciaid = fila.children[2].textContent;
        const paisid = fila.children[3].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarPoblacionForm.classList.add("hide");

            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarPoblacionDiv.classList.add("hide");

            formEditarForm.poblacionid.value = poblacionid;
            formEditarForm.nombre.value = nombre;
            formEditarForm.provinciaid.value = provinciaid;
            formEditarForm.paisid.value = paisid;

            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }

        // Si es botón Eliminar, pregunta y elimina
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar la población "${nombre}" (ID: ${poblacionid})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${poblacionid}`, { method: "DELETE" })
                .then(data => {
                    alert("Población eliminada correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar población: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarPoblacionDiv.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarPoblacionForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarPoblacionForm.reset();
        });
    });

    // AGREGAR POBLACION
    btnAgregar.addEventListener("click", () => {
        formAgregarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnAgregar.disabled = true;
    });

    formAgregarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            nombre: formAgregarForm.nombre.value.trim(),
            provinciaid: parseInt(formAgregarForm.provinciaid.value),
            paisid: formAgregarForm.paisid.value.trim().toUpperCase()
        };

        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Población agregada correctamente");

            formAgregarForm.reset();
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;

            cargarPagina(1);
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error al agregar población");
        });
    });

    // EDITAR POBLACION
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarPoblacion.addEventListener("click", () => {
        const nombre = buscarNombrePoblacionInput.value.trim();
        const provinciaid = buscarProvinciaidPoblacionInput.value.trim();
        const paisid = buscarPaisidPoblacionInput.value.trim().toUpperCase();
        if (!nombre || !provinciaid || !paisid) {
            alert("Ingresa nombre, provincia y país de la población a buscar");
            return;
        }

        fetchProtegido(`${API_BASE}buscar?nombre=${encodeURIComponent(nombre)}&provinciaid=${encodeURIComponent(provinciaid)}&paisid=${encodeURIComponent(paisid)}`)
        .then(data => {
            formEditarForm.poblacionid.value = data.poblacionid;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.provinciaid.value = data.provinciaid;
            formEditarForm.paisid.value = data.paisid;
        })
        .catch(err => {
            alert("No se encontró la población");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            poblacionid: parseInt(formEditarForm.poblacionid.value),
            nombre: formEditarForm.nombre.value.trim(),
            provinciaid: parseInt(formEditarForm.provinciaid.value),
            paisid: formEditarForm.paisid.value.trim().toUpperCase()
        };

        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Población actualizada correctamente");

            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarPoblacionDiv.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnEditar.disabled = false;

            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar población");
        });
    });

    // ELIMINAR POBLACION
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarPoblacionDiv.classList.add("hide");

        formEliminarDiv.classList.remove("hide");
        eliminarPoblacionForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarPoblacionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const poblacionid = eliminarPoblacionForm.eliminarPoblacionId.value.trim();

        if (!poblacionid) {
            alert("Debes ingresar el ID de la población a eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar la población "${poblacionid}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        fetchProtegido(`${API_BASE}${poblacionid}`, { method: "DELETE" })
            .then(data => {
                alert("Población eliminada correctamente");

                eliminarPoblacionForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarPoblacionForm.classList.add("hide");

                tablaContainer.classList.remove("hide");
                togglePaginacion(true);

                btnEliminar.disabled = false;

                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar población: " + err.message);
            });
    });

});