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
                        throw new Error(text || "Error al cargar proveedores");
                    });
                }
                return response.json();
            });
    }

    const API_BASE = "/api/proveedores/";

    // Variables y elementos globales
    const tablaContainer = document.getElementById("tablaProveedores");
    const tbody = document.getElementById("tbodyProveedores");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";

    // Inputs de búsqueda y botón
    const buscarNombreInput = document.getElementById("buscarNombreProveedorInput");
    const buscarNombreBtn = document.getElementById("buscarNombreProveedorBtn");

    buscarNombreBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
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
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const proveedores = data.proveedores || [];
                const totalPaginas = data.total_paginas || 1;

                proveedores.forEach(proveedor => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${proveedor.id_proveedor}</td>
                        <td>${proveedor.nombre}</td>
                        <td>${proveedor.cif || ''}</td>
                        <td>${proveedor.direccion || ''}</td>
                        <td>${proveedor.poblacionid || ''}</td>
                        <td>${proveedor.email || ''}</td>
                        <td>${proveedor.telefono || ''}</td>
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
                console.error("Error al cargar proveedores:", error);
                tbody.innerHTML = '<tr><td colspan="8">Error al cargar proveedores.</td></tr>';
            });
    };

    cargarPagina(paginaActual);
    tablaContainer.classList.remove("hide");
    cargarPagina(paginaActual);

    // Formularios y botones
    const formAgregarDiv = document.getElementById("formAgregarProveedor");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarProveedorBtn");

    const formEditarDiv = document.getElementById("formEditarProveedor");
    const formEditarForm = document.getElementById("proveedorEditForm");
    const btnEditar = document.getElementById("editarProveedorBtn");

    const formEliminarDiv = document.getElementById("formEliminarProveedor");
    const eliminarProveedorForm = document.getElementById("eliminarProveedorForm");
    const btnEliminar = document.getElementById("eliminarProveedorBtn");

    const buscarNombreProveedorInput = document.getElementById("buscarNombreProveedor");
    const btnBuscarProveedor = document.getElementById("btnBuscarProveedor");

    const formBuscarDiv = document.getElementById("busquedaEditarProveedor");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarProveedorBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarProveedorForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'editarProveedorBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarProveedorForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarDiv.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'eliminarProveedorBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarProveedorForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEliminar.disabled = true;
                btnAgregar.disabled = false;
                btnEditar.disabled = false;
                break;
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
        const id_proveedor = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const cif = fila.children[2].textContent;
        const direccion = fila.children[3].textContent;
        const poblacionid = fila.children[4].textContent;
        const email = fila.children[5].textContent;
        const telefono = fila.children[6].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarProveedorForm.classList.add("hide");

            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarDiv.classList.add("hide");

            formEditarForm.id_proveedor.value = id_proveedor;
            formEditarForm.nombre.value = nombre;
            formEditarForm.cif.value = cif;
            formEditarForm.direccion.value = direccion;
            formEditarForm.poblacionid.value = poblacionid;
            formEditarForm.email.value = email;
            formEditarForm.telefono.value = telefono;

            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }

        // Si es botón Eliminar, pregunta y elimina
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar el proveedor "${nombre}" (ID: ${id_proveedor})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id_proveedor}`, { method: "DELETE" })
                .then(data => {
                    alert("Proveedor eliminado correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar proveedor: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarDiv.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarProveedorForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarProveedorForm.reset();
        });
    });

    // AGREGAR PROVEEDOR
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
            email: formAgregarForm.email.value.trim(),
            telefono: formAgregarForm.telefono.value.trim()
        };

        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Proveedor agregado correctamente");

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
            alert("Error al agregar proveedor");
        });
    });

    // EDITAR PROVEEDOR
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarProveedor.addEventListener("click", () => {
        const nombre = buscarNombreProveedorInput.value.trim();
        if (!nombre) {
            alert("Ingresa el nombre del proveedor a buscar");
            return;
        }

        fetchProtegido(`${API_BASE}buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(data => {
            formEditarForm.id_proveedor.value = data.id_proveedor;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.cif.value = data.cif || "";
            formEditarForm.direccion.value = data.direccion || "";
            formEditarForm.poblacionid.value = data.poblacionid || "";
            formEditarForm.email.value = data.email || "";
            formEditarForm.telefono.value = data.telefono || "";
        })
        .catch(err => {
            alert("No se encontró el proveedor");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            id_proveedor: parseInt(formEditarForm.id_proveedor.value),
            nombre: formEditarForm.nombre.value.trim(),
            cif: formEditarForm.cif.value.trim(),
            direccion: formEditarForm.direccion.value.trim(),
            poblacionid: formEditarForm.poblacionid.value ? parseInt(formEditarForm.poblacionid.value) : null,
            email: formEditarForm.email.value.trim(),
            telefono: formEditarForm.telefono.value.trim()
        };

        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Proveedor actualizado correctamente");

            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarDiv.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnEditar.disabled = false;

            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar proveedor");
        });
    });

    // ELIMINAR PROVEEDOR
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarDiv.classList.add("hide");

        formEliminarDiv.classList.remove("hide");
        eliminarProveedorForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarProveedorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id_proveedor = eliminarProveedorForm.eliminarProveedorId.value.trim();

        if (!id_proveedor) {
            alert("Debes ingresar el ID del proveedor a eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar el proveedor "${id_proveedor}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        fetchProtegido(`${API_BASE}${id_proveedor}`, { method: "DELETE" })
            .then(data => {
                alert("Proveedor eliminado correctamente");

                eliminarProveedorForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarProveedorForm.classList.add("hide");

                tablaContainer.classList.remove("hide");
                togglePaginacion(true);

                btnEliminar.disabled = false;

                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar proveedor: " + err.message);
            });
    });

});