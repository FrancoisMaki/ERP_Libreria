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
                        throw new Error(text || "Error al cargar autores");
                    });
                }
                return response.json();
            });
    }
    const API_BASE = "/api/autores/";
    const tablaContainer = document.getElementById("tablaAutores");
    const tbody = document.getElementById("tbodyAutores");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";

    const buscarNombreInput = document.getElementById("buscarNombreInput");
    const buscarNombreBtn = document.getElementById("buscarNombreBtn");

    buscarNombreBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
        paginaActual = 1;
        cargarPagina(paginaActual);
    });

    const togglePaginacion = mostrar => {
        paginacionContainer.style.display = mostrar ? "flex" : "none";
    };

    const cargarPagina = (pagina) => {
        let url = `${API_BASE}?pagina=${pagina}&por_pagina=${porPagina}`;
        if (nombreBusqueda) {
            url += `&nombre=${encodeURIComponent(nombreBusqueda)}`;
        }
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const autores = data.autores || [];
                const totalPaginas = data.total_paginas || 1;
                autores.forEach(autor => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${autor.id_autor}</td>
                        <td>${autor.nombre}</td>
                        <td>
                            <button>Editar</button>
                            <button>Eliminar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
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
                console.error("Error al cargar autores:", error);
                tbody.innerHTML = '<tr><td colspan="3">Error al cargar autores.</td></tr>';
            });
    };

    cargarPagina(paginaActual);

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

    // Formularios/agregar/editar/eliminar
    const formAgregarDiv = document.getElementById("formAgregarAutor");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarAutorBtn");
    const formEditarDiv = document.getElementById("formEditarAutor");
    const formEditarForm = formEditarDiv.querySelector("form");
    const btnEditar = document.getElementById("editarAutorBtn");
    const formEliminarDiv = document.getElementById("formEliminarAutor");
    const eliminarAutorForm = document.getElementById("eliminarAutorForm");
    const btnEliminar = document.getElementById("eliminarAutorBtn");
    const buscarInput = document.getElementById("buscarNombreAutor");
    const btnBuscarAutor = document.getElementById("btnBuscarAutor");
    const formBuscarAutorDiv = document.getElementById("busquedaEditarAutor");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarAutorBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarAutorDiv.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarAutorForm.classList.add("hide");
                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'editarAutorBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarAutorForm.classList.add("hide");
                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarAutorDiv.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'eliminarAutorBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarAutorDiv.classList.add("hide");
                formEliminarDiv.classList.remove("hide");
                eliminarAutorForm.classList.remove("hide");
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

    tbody.addEventListener('click', function(event) {
        const btn = event.target;
        if (btn.tagName !== 'BUTTON') return;
        const fila = btn.closest('tr');
        const id_autor = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarAutorForm.classList.add("hide");
            tablaContainer.classList.add("hide");
            togglePaginacion(false);
            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarAutorDiv.classList.add("hide");
            formEditarForm.id_autor.value = id_autor;
            formEditarForm.nombre.value = nombre;
            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar el autor "${nombre}" (ID: ${id_autor})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id_autor}`, { method: "DELETE" })
                .then(data => {
                    alert("Autor eliminado correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar autor: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarAutorDiv.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarAutorForm.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;
            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarAutorForm.reset();
        });
    });

    // AGREGAR AUTOR
    btnAgregar.addEventListener("click", () => {
        formAgregarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnAgregar.disabled = true;
    });
    formAgregarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            nombre: formAgregarForm.nombre.value.trim()
        };
        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Autor agregado correctamente");
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
            alert("Error al agregar autor");
        });
    });

    // EDITAR AUTOR
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });
    btnBuscarAutor.addEventListener("click", () => {
        const nombre = buscarInput.value.trim();
        if (!nombre) {
            alert("Ingresa el nombre del autor a buscar");
            return;
        }
        fetchProtegido(`${API_BASE}/buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(data => {
            formEditarForm.id_autor.value = data.id_autor;
            formEditarForm.nombre.value = data.nombre;
        })
        .catch(err => {
            alert("No se encontró el autor");
            formEditarForm.reset();
        });
    });
    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            id_autor: formEditarForm.id_autor.value,
            nombre: formEditarForm.nombre.value.trim()
        };
        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Autor actualizado correctamente");
            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarAutorDiv.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnEditar.disabled = false;
            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar autor");
        });
    });

    // ELIMINAR AUTOR
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarAutorDiv.classList.add("hide");
        formEliminarDiv.classList.remove("hide");
        eliminarAutorForm.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });
    eliminarAutorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = eliminarAutorForm.eliminarAutorId.value.trim();
        if (!valor) {
            alert("Debes ingresar el ID del autor a eliminar");
            return;
        }
        if (!window.confirm(`¿Estás seguro que deseas eliminar el autor "${valor}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        fetchProtegido(`${API_BASE}${valor}`, { method: "DELETE" })
            .then(data => {
                alert("Autor eliminado correctamente");
                eliminarAutorForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarAutorForm.classList.add("hide");
                tablaContainer.classList.remove("hide");
                togglePaginacion(true);
                btnEliminar.disabled = false;
                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar autor: " + err.message);
            });
    });
});