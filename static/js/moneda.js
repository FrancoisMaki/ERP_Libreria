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
                        throw new Error(text || "Error al cargar monedas");
                    });
                }
                return response.json();
            });
    }
    const API_BASE = "/api/monedas/";
    const tablaContainer = document.getElementById("tablaMonedas");
    const tbody = document.getElementById("tbodyMonedas");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";
    let codigoBusqueda = "";

    const buscarNombreInput = document.getElementById("buscarNombreInput");
    const buscarCodigoInput = document.getElementById("buscarCodigoInput");
    const buscarNombreBtn = document.getElementById("buscarNombreBtn");

    buscarNombreBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
        codigoBusqueda = buscarCodigoInput.value.trim().toUpperCase();
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
        if (codigoBusqueda) {
            url += `&codigo=${encodeURIComponent(codigoBusqueda)}`;
        }
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const monedas = data.monedas || [];
                const totalPaginas = data.total_paginas || 1;
                monedas.forEach(moneda => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${moneda.codigo}</td>
                        <td>${moneda.nombre}</td>
                        <td>${moneda.simbolo || ''}</td>
                        <td>${moneda.decimales}</td>
                        <td>${moneda.activo ? 'Sí' : 'No'}</td>
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
                console.error("Error al cargar monedas:", error);
                tbody.innerHTML = '<tr><td colspan="6">Error al cargar monedas.</td></tr>';
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
    const formAgregarDiv = document.getElementById("formAgregarMoneda");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarMonedaBtn");
    const formEditarDiv = document.getElementById("formEditarMoneda");
    const formEditarForm = formEditarDiv.querySelector("form");
    const btnEditar = document.getElementById("editarMonedaBtn");
    const formEliminarDiv = document.getElementById("formEliminarMoneda");
    const eliminarMonedaForm = document.getElementById("eliminarMonedaForm");
    const btnEliminar = document.getElementById("eliminarMonedaBtn");
    const buscarInput = document.getElementById("buscarCodigoMoneda");
    const btnBuscarMoneda = document.getElementById("btnBuscarMoneda");
    const formBuscarMonedaDiv = document.getElementById("busquedaEditarMoneda");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarMonedaBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarMonedaDiv.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarMonedaForm.classList.add("hide");
                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'editarMonedaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarMonedaForm.classList.add("hide");
                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarMonedaDiv.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'eliminarMonedaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarMonedaDiv.classList.add("hide");
                formEliminarDiv.classList.remove("hide");
                eliminarMonedaForm.classList.remove("hide");
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
        const codigo = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const simbolo = fila.children[2].textContent;
        const decimales = fila.children[3].textContent;
        const activo = fila.children[4].textContent === 'Sí';
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarMonedaForm.classList.add("hide");
            tablaContainer.classList.add("hide");
            togglePaginacion(false);
            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarMonedaDiv.classList.add("hide");
            formEditarForm.codigo.value = codigo;
            formEditarForm.nombre.value = nombre;
            formEditarForm.simbolo.value = simbolo;
            formEditarForm.decimales.value = decimales;
            formEditarForm.activo.checked = activo;
            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar la moneda "${nombre}" (Código: ${codigo})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${codigo}`, { method: "DELETE" })
                .then(data => {
                    alert("Moneda eliminada correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar moneda: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarMonedaDiv.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarMonedaForm.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;
            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarMonedaForm.reset();
        });
    });

    // AGREGAR MONEDA
    btnAgregar.addEventListener("click", () => {
        formAgregarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnAgregar.disabled = true;
    });
    formAgregarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            codigo: formAgregarForm.codigo.value.trim().toUpperCase(),
            nombre: formAgregarForm.nombre.value.trim(),
            simbolo: formAgregarForm.simbolo.value.trim(),
            decimales: formAgregarForm.decimales.value ? parseInt(formAgregarForm.decimales.value) : 2,
            activo: formAgregarForm.activo.checked
        };
        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Moneda agregada correctamente");
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
            alert("Error al agregar moneda");
        });
    });

    // EDITAR MONEDA
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });
    btnBuscarMoneda.addEventListener("click", () => {
        const codigo = buscarInput.value.trim().toUpperCase();
        if (!codigo) {
            alert("Ingresa el código de la moneda a buscar");
            return;
        }
        fetchProtegido(`${API_BASE}/buscar?codigo=${encodeURIComponent(codigo)}`)
        .then(data => {
            formEditarForm.codigo.value = data.codigo;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.simbolo.value = data.simbolo || "";
            formEditarForm.decimales.value = data.decimales;
            formEditarForm.activo.checked = !!data.activo;
        })
        .catch(err => {
            alert("No se encontró la moneda");
            formEditarForm.reset();
        });
    });
    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            codigo: formEditarForm.codigo.value.trim().toUpperCase(),
            nombre: formEditarForm.nombre.value.trim(),
            simbolo: formEditarForm.simbolo.value.trim(),
            decimales: formEditarForm.decimales.value ? parseInt(formEditarForm.decimales.value) : 2,
            activo: formEditarForm.activo.checked
        };
        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Moneda actualizada correctamente");
            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarMonedaDiv.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnEditar.disabled = false;
            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar moneda");
        });
    });

    // ELIMINAR MONEDA
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarMonedaDiv.classList.add("hide");
        formEliminarDiv.classList.remove("hide");
        eliminarMonedaForm.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });
    eliminarMonedaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const codigo = eliminarMonedaForm.eliminarMonedaCodigo.value.trim().toUpperCase();
        if (!codigo) {
            alert("Debes ingresar el código de la moneda a eliminar");
            return;
        }
        if (!window.confirm(`¿Estás seguro que deseas eliminar la moneda "${codigo}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        fetchProtegido(`${API_BASE}${codigo}`, { method: "DELETE" })
            .then(data => {
                alert("Moneda eliminada correctamente");
                eliminarMonedaForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarMonedaForm.classList.add("hide");
                tablaContainer.classList.remove("hide");
                togglePaginacion(true);
                btnEliminar.disabled = false;
                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar moneda: " + err.message);
            });
    });
});