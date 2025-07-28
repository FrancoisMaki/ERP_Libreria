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
                        throw new Error(text || "Error al cargar empresas");
                    });
                }
                return response.json();
            });
    }
    const API_BASE = "/api/empresas/";
    const tablaContainer = document.getElementById("tablaEmpresas");
    const tbody = document.getElementById("tbodyEmpresas");
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
                const empresas = data.empresas || [];
                const totalPaginas = data.total_paginas || 1;
                empresas.forEach(empresa => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${empresa.id_empresa}</td>
                        <td>${empresa.nombre}</td>
                        <td>${empresa.cif}</td>
                        <td>${empresa.direccion || ''}</td>
                        <td>${empresa.poblacionid || ''}</td>
                        <td>${empresa.moneda || ''}</td>
                        <td>${empresa.iva_general}</td>
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
                console.error("Error al cargar empresas:", error);
                tbody.innerHTML = '<tr><td colspan="8">Error al cargar empresas.</td></tr>';
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

    // Formularios/agregar/editar/eliminar
    const formAgregarDiv = document.getElementById("formAgregarEmpresa");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarEmpresaBtn");
    const formEditarDiv = document.getElementById("formEditarEmpresa");
    const formEditarForm = formEditarDiv.querySelector("form");
    const btnEditar = document.getElementById("editarEmpresaBtn");
    const formEliminarDiv = document.getElementById("formEliminarEmpresa");
    const eliminarEmpresaForm = document.getElementById("eliminarEmpresaForm");
    const btnEliminar = document.getElementById("eliminarEmpresaBtn");
    const buscarInput = document.getElementById("buscarNombreEmpresa");
    const btnBuscarEmpresa = document.getElementById("btnBuscarEmpresa");
    const formBuscarEmpresaDiv = document.getElementById("busquedaEditarEmpresa");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarEmpresaBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarEmpresaDiv.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarEmpresaForm.classList.add("hide");
                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'editarEmpresaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEliminarDiv.classList.add("hide");
                eliminarEmpresaForm.classList.add("hide");
                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarEmpresaDiv.classList.remove("hide");
                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;
            case 'eliminarEmpresaBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarEmpresaDiv.classList.add("hide");
                formEliminarDiv.classList.remove("hide");
                eliminarEmpresaForm.classList.remove("hide");
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
        const id_empresa = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const cif = fila.children[2].textContent;
        const direccion = fila.children[3].textContent;
        const poblacionid = fila.children[4].textContent;
        const moneda = fila.children[5].textContent;
        const iva_general = fila.children[6].textContent;
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarEmpresaForm.classList.add("hide");
            tablaContainer.classList.add("hide");
            togglePaginacion(false);
            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarEmpresaDiv.classList.add("hide");
            formEditarForm.id_empresa.value = id_empresa;
            formEditarForm.nombre.value = nombre;
            formEditarForm.cif.value = cif;
            formEditarForm.direccion.value = direccion;
            formEditarForm.poblacionid.value = poblacionid;
            formEditarForm.moneda.value = moneda;
            formEditarForm.iva_general.value = iva_general;
            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar la empresa "${nombre}" (ID: ${id_empresa})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id_empresa}`, { method: "DELETE" })
                .then(data => {
                    alert("Empresa eliminada correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar empresa: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarEmpresaDiv.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarEmpresaForm.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;
            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarEmpresaForm.reset();
        });
    });

    // AGREGAR EMPRESA
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
            cif: formAgregarForm.cif.value.trim(),
            direccion: formAgregarForm.direccion.value.trim(),
            poblacionid: formAgregarForm.poblacionid.value ? parseInt(formAgregarForm.poblacionid.value) : null,
            moneda: formAgregarForm.moneda.value.trim().toUpperCase(),
            iva_general: formAgregarForm.iva_general.value ? parseFloat(formAgregarForm.iva_general.value) : 4.00
        };
        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Empresa agregada correctamente");
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
            alert("Error al agregar empresa");
        });
    });

    // EDITAR EMPRESA
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });
    btnBuscarEmpresa.addEventListener("click", () => {
        const nombre = buscarInput.value.trim();
        if (!nombre) {
            alert("Ingresa el nombre de la empresa a buscar");
            return;
        }
        fetchProtegido(`${API_BASE}/buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(data => {
            formEditarForm.id_empresa.value = data.id_empresa;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.cif.value = data.cif;
            formEditarForm.direccion.value = data.direccion || "";
            formEditarForm.poblacionid.value = data.poblacionid || "";
            formEditarForm.moneda.value = data.moneda || "";
            formEditarForm.iva_general.value = data.iva_general;
        })
        .catch(err => {
            alert("No se encontró la empresa");
            formEditarForm.reset();
        });
    });
    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const datos = {
            id_empresa: formEditarForm.id_empresa.value,
            nombre: formEditarForm.nombre.value.trim(),
            cif: formEditarForm.cif.value.trim(),
            direccion: formEditarForm.direccion.value.trim(),
            poblacionid: formEditarForm.poblacionid.value ? parseInt(formEditarForm.poblacionid.value) : null,
            moneda: formEditarForm.moneda.value.trim().toUpperCase(),
            iva_general: formEditarForm.iva_general.value ? parseFloat(formEditarForm.iva_general.value) : 4.00
        };
        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Empresa actualizada correctamente");
            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarEmpresaDiv.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnEditar.disabled = false;
            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar empresa");
        });
    });

    // ELIMINAR EMPRESA
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarEmpresaDiv.classList.add("hide");
        formEliminarDiv.classList.remove("hide");
        eliminarEmpresaForm.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });
    eliminarEmpresaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = eliminarEmpresaForm.eliminarEmpresaId.value.trim();
        if (!valor) {
            alert("Debes ingresar el ID de la empresa a eliminar");
            return;
        }
        if (!window.confirm(`¿Estás seguro que deseas eliminar la empresa "${valor}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        fetchProtegido(`${API_BASE}${valor}`, { method: "DELETE" })
            .then(data => {
                alert("Empresa eliminada correctamente");
                eliminarEmpresaForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarEmpresaForm.classList.add("hide");
                tablaContainer.classList.remove("hide");
                togglePaginacion(true);
                btnEliminar.disabled = false;
                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar empresa: " + err.message);
            });
    });
});