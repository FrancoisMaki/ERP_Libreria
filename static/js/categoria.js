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
                        throw new Error(text || "Error al cargar categorías");
                    });
                }
                return response.json();
            });
    }
    const API_BASE = "/api/categorias/";
    const tablaContainer = document.getElementById("tablaCategorias");
    const tbody = document.getElementById("tbodyCategorias");
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
                const categorias = data.categorias || [];
                const totalPaginas = data.total_paginas || 1;
                categorias.forEach(categoria => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${categoria.id_categoria}</td>
                        <td>${categoria.nombre}</td>
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
                console.error("Error al cargar categorías:", error);
                tbody.innerHTML = '<tr><td colspan="3">Error al cargar categorías.</td></tr>';
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
    const formAgregarDiv = document.getElementById("formAgregarCategoria");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarCategoriaBtn");
    const formEditarDiv = document.getElementById("formEditarCategoria");
    const formEditarForm = formEditarDiv.querySelector("form");
    const btnEditar = document.getElementById("editarCategoriaBtn");
    const formEliminarDiv = document.getElementById("formEliminarCategoria");
    const eliminarCategoriaForm = document.getElementById("eliminarCategoriaForm");
    const btnEliminar = document.getElementById("eliminarCategoriaBtn");
    const buscarInput = document.getElementById("buscarNombreCategoria");
    const btnBuscarCategoria = document.getElementById("btnBuscarCategoria");
    const formBuscarCategoriaDiv = document.getElementById("busquedaEditarCategoria");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarCategoriaBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarCategoriaDiv.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarCategoriaForm.classList.add("hide");
                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'editarCategoriaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarCategoriaForm.classList.add("hide");
                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarCategoriaDiv.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'eliminarCategoriaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarCategoriaDiv.classList.add("hide");
                formEliminarDiv.classList.remove("hide");
                eliminarCategoriaForm.classList.remove("hide");
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
        const id_categoria = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarCategoriaForm.classList.add("hide");
            tablaContainer.classList.add("hide");
            togglePaginacion(false);
            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarCategoriaDiv.classList.add("hide");
            formEditarForm.id_categoria.value = id_categoria;
            formEditarForm.nombre.value = nombre;
            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar la categoría "${nombre}" (ID: ${id_categoria})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id_categoria}`, { method: "DELETE" })
                .then(data => {
                    alert("Categoría eliminada correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar categoría: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarCategoriaDiv.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarCategoriaForm.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;
            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarCategoriaForm.reset();
        });
    });

    // AGREGAR CATEGORIA
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
            alert("Categoría agregada correctamente");
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
            alert("Error al agregar categoría");
        });
    });

    // EDITAR CATEGORIA
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });
    btnBuscarCategoria.addEventListener("click", () => {
        const nombre = buscarInput.value.trim();
        if (!nombre) {
            alert("Ingresa el nombre de la categoría a buscar");
            return;
        }
        fetchProtegido(`${API_BASE}/buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(data => {
            formEditarForm.id_categoria.value = data.id_categoria;
            formEditarForm.nombre.value = data.nombre;
        })
        .catch(err => {
            alert("No se encontró la categoría");
            formEditarForm.reset();
        });
    });
    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            id_categoria: formEditarForm.id_categoria.value,
            nombre: formEditarForm.nombre.value.trim()
        };
        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Categoría actualizada correctamente");
            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarCategoriaDiv.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnEditar.disabled = false;
            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar categoría");
        });
    });

    // ELIMINAR CATEGORIA
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarCategoriaDiv.classList.add("hide");
        formEliminarDiv.classList.remove("hide");
        eliminarCategoriaForm.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });
    eliminarCategoriaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = eliminarCategoriaForm.eliminarCategoriaId.value.trim();
        if (!valor) {
            alert("Debes ingresar el ID de la categoría a eliminar");
            return;
        }
        if (!window.confirm(`¿Estás seguro que deseas eliminar la categoría "${valor}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        fetchProtegido(`${API_BASE}${valor}`, { method: "DELETE" })
            .then(data => {
                alert("Categoría eliminada correctamente");
                eliminarCategoriaForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarCategoriaForm.classList.add("hide");
                tablaContainer.classList.remove("hide");
                togglePaginacion(true);
                btnEliminar.disabled = false;
                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar categoría: " + err.message);
            });
    });
});