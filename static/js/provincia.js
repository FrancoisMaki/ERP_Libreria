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
                        throw new Error(text || "Error al cargar provincias");
                    });
                }
                return response.json();
            });
    }

    const API_BASE = "/api/provincias/";

    // Variables y elementos globales
    const tablaContainer = document.getElementById("tablaProvincias");
    const tbody = document.getElementById("tbodyProvincias");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";
    let paisidBusqueda = "";

    // Inputs de búsqueda y botón
    const buscarNombreInput = document.getElementById("buscarNombreProvinciaInput");
    const buscarPaisidInput = document.getElementById("buscarPaisidProvinciaInput");
    const buscarNombreBtn = document.getElementById("buscarNombreProvinciaBtn");

    // Buscar por nombre y paisid
    buscarNombreBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
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
        if (paisidBusqueda) url += `&paisid=${encodeURIComponent(paisidBusqueda)}`;
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const provincias = data.provincias || [];
                const totalPaginas = data.total_paginas || 1;

                provincias.forEach(provincia => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${provincia.provinciaid}</td>
                        <td>${provincia.nombre}</td>
                        <td>${provincia.paisid}</td>
                        <td>${provincia.codigo_iso || ''}</td>
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
                console.error("Error al cargar provincias:", error);
                tbody.innerHTML = '<tr><td colspan="5">Error al cargar provincias.</td></tr>';
            });
    };

    cargarPagina(paginaActual);

    // Mostrar tabla
    const btnMostrar = document.getElementById("mostrarTablaBtn");
    if (btnMostrar) {
        btnMostrar.addEventListener("click", () => {
            tablaContainer.classList.remove("hide");
            cargarPagina(paginaActual);
        });
    } else {
        tablaContainer.classList.remove("hide");
        cargarPagina(paginaActual);
    }

    // Elementos de formularios
    const formAgregarDiv = document.getElementById("formAgregarProvincia");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarProvinciaBtn");

    const formEditarDiv = document.getElementById("formEditarProvincia");
    const formEditarForm = document.getElementById("provinciaEditForm");
    const btnEditar = document.getElementById("editarProvinciaBtn");

    const formEliminarDiv = document.getElementById("formEliminarProvincia");
    const eliminarProvinciaForm = document.getElementById("eliminarProvinciaForm");
    const btnEliminar = document.getElementById("eliminarProvinciaBtn");

    const buscarNombreProvinciaInput = document.getElementById("buscarNombreProvincia");
    const buscarPaisidProvinciaInput = document.getElementById("buscarPaisidProvincia");
    const btnBuscarProvincia = document.getElementById("btnBuscarProvincia");

    const formBuscarProvinciaDiv = document.getElementById("busquedaEditarProvincia");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarProvinciaBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarProvinciaDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarProvinciaForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'editarProvinciaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarProvinciaForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarProvinciaDiv.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'eliminarProvinciaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarProvinciaDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarProvinciaForm.classList.remove("hide");

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
        const provinciaid = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const paisid = fila.children[2].textContent;
        const codigo_iso = fila.children[3].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarProvinciaForm.classList.add("hide");

            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarProvinciaDiv.classList.add("hide");

            formEditarForm.provinciaid.value = provinciaid;
            formEditarForm.nombre.value = nombre;
            formEditarForm.paisid.value = paisid;
            formEditarForm.codigo_iso.value = codigo_iso;

            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }

        // Si es botón Eliminar, pregunta y elimina
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar la provincia "${nombre}" (ID: ${provinciaid}) del país ${paisid}? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${paisid}/${provinciaid}`, { method: "DELETE" })
                .then(data => {
                    alert("Provincia eliminada correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar provincia: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarProvinciaDiv.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarProvinciaForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarProvinciaForm.reset();
        });
    });

    // AGREGAR PROVINCIA
    btnAgregar.addEventListener("click", () => {
        formAgregarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnAgregar.disabled = true;
    });

    formAgregarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            provinciaid: parseInt(formAgregarForm.provinciaid.value),
            nombre: formAgregarForm.nombre.value.trim(),
            paisid: formAgregarForm.paisid.value.trim().toUpperCase(),
            codigo_iso: formAgregarForm.codigo_iso.value.trim() || null
        };

        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Provincia agregada correctamente");

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
            alert("Error al agregar provincia");
        });
    });

    // EDITAR PROVINCIA
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarProvincia.addEventListener("click", () => {
        const nombre = buscarNombreProvinciaInput.value.trim();
        const paisid = buscarPaisidProvinciaInput.value.trim().toUpperCase();
        if (!nombre || !paisid) {
            alert("Ingresa el nombre y país de la provincia a buscar");
            return;
        }

        fetchProtegido(`${API_BASE}buscar?nombre=${encodeURIComponent(nombre)}&paisid=${encodeURIComponent(paisid)}`)
        .then(data => {
            formEditarForm.provinciaid.value = data.provinciaid;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.paisid.value = data.paisid;
            formEditarForm.codigo_iso.value = data.codigo_iso || "";
        })
        .catch(err => {
            alert("No se encontró la provincia");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            provinciaid: parseInt(formEditarForm.provinciaid.value),
            nombre: formEditarForm.nombre.value.trim(),
            paisid: formEditarForm.paisid.value.trim().toUpperCase(),
            codigo_iso: formEditarForm.codigo_iso.value.trim() || null
        };

        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Provincia actualizada correctamente");

            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarProvinciaDiv.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnEditar.disabled = false;

            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar provincia");
        });
    });

    // ELIMINAR PROVINCIA
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarProvinciaDiv.classList.add("hide");

        formEliminarDiv.classList.remove("hide");
        eliminarProvinciaForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarProvinciaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const paisid = eliminarProvinciaForm.eliminarPaisidProvincia.value.trim().toUpperCase();
        const provinciaid = eliminarProvinciaForm.eliminarProvinciaId.value.trim();

        if (!paisid || !provinciaid) {
            alert("Debes ingresar el ID del país y el código de provincia a eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar la provincia "${provinciaid}" del país "${paisid}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        fetchProtegido(`${API_BASE}${paisid}/${provinciaid}`, { method: "DELETE" })
            .then(data => {
                alert("Provincia eliminada correctamente");

                eliminarProvinciaForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarProvinciaForm.classList.add("hide");

                tablaContainer.classList.remove("hide");
                togglePaginacion(true);

                btnEliminar.disabled = false;

                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar provincia: " + err.message);
            });
    });

});