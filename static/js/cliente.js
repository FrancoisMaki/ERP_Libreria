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
                        throw new Error(text || "Error al cargar clientes");
                    });
                }
                return response.json();
            });
    }

    const API_BASE = "/api/clientes/";

    // Variables y elementos globales
    const tablaContainer = document.getElementById("tablaClientes");
    const tbody = document.getElementById("tbodyClientes");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let nombreBusqueda = "";
    let nifBusqueda = "";

    // Inputs de búsqueda y botón para la tabla
    const buscarNombreInput = document.getElementById("buscarNombreClienteInput");
    const buscarNifInput = document.getElementById("buscarNifClienteInput");
    const buscarClienteBtn = document.getElementById("buscarClienteBtn");

    buscarClienteBtn.addEventListener("click", () => {
        nombreBusqueda = buscarNombreInput.value.trim();
        nifBusqueda = buscarNifInput.value.trim();
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
        if (nifBusqueda) url += `&nif=${encodeURIComponent(nifBusqueda)}`;
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const clientes = data.clientes || [];
                const totalPaginas = data.total_paginas || 1;

                clientes.forEach(cliente => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${cliente.id_cliente}</td>
                        <td>${cliente.nombre}</td>
                        <td>${cliente.nif || ''}</td>
                        <td>${cliente.direccion || ''}</td>
                        <td>${cliente.poblacionid || ''}</td>
                        <td>${cliente.email || ''}</td>
                        <td>${cliente.telefono || ''}</td>
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
                console.error("Error al cargar clientes:", error);
                tbody.innerHTML = '<tr><td colspan="8">Error al cargar clientes.</td></tr>';
            });
    };

    cargarPagina(paginaActual);
    tablaContainer.classList.remove("hide");
    cargarPagina(paginaActual);

    // Formularios y botones
    const formAgregarDiv = document.getElementById("formAgregarCliente");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarClienteBtn");

    const formEditarDiv = document.getElementById("formEditarCliente");
    const formEditarForm = document.getElementById("clienteEditForm");
    const btnEditar = document.getElementById("editarClienteBtn");

    const formEliminarDiv = document.getElementById("formEliminarCliente");
    const eliminarClienteForm = document.getElementById("eliminarClienteForm");
    const btnEliminar = document.getElementById("eliminarClienteBtn");

    // Búsqueda para editar por NIF
    const buscarNifClienteEditar = document.getElementById("buscarNifClienteEditar");
    const btnBuscarCliente = document.getElementById("btnBuscarCliente");

    const formBuscarDiv = document.getElementById("busquedaEditarCliente");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarClienteBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarClienteForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'editarClienteBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarClienteForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarDiv.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'eliminarClienteBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarClienteForm.classList.remove("hide");

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
        const id_cliente = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const nif = fila.children[2].textContent;
        const direccion = fila.children[3].textContent;
        const poblacionid = fila.children[4].textContent;
        const email = fila.children[5].textContent;
        const telefono = fila.children[6].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarClienteForm.classList.add("hide");

            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarDiv.classList.add("hide");

            formEditarForm.id_cliente.value = id_cliente;
            formEditarForm.nombre.value = nombre;
            formEditarForm.nif.value = nif;
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
            if (!window.confirm(`¿Estás seguro que deseas eliminar el cliente "${nombre}" (ID: ${id_cliente})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id_cliente}`, { method: "DELETE" })
                .then(data => {
                    alert("Cliente eliminado correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar cliente: " + err.message);
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
            eliminarClienteForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarClienteForm.reset();
        });
    });

    // AGREGAR CLIENTE
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
            nif: formAgregarForm.nif.value.trim(),
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
            alert("Cliente agregado correctamente");

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
            alert("Error al agregar cliente");
        });
    });

    // EDITAR CLIENTE
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarCliente.addEventListener("click", () => {
        const nif = buscarNifClienteEditar.value.trim();
        if (!nif) {
            alert("Ingresa el NIF del cliente a buscar");
            return;
        }

        fetchProtegido(`${API_BASE}buscar?nif=${encodeURIComponent(nif)}`)
        .then(data => {
            formEditarForm.id_cliente.value = data.id_cliente;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.nif.value = data.nif || "";
            formEditarForm.direccion.value = data.direccion || "";
            formEditarForm.poblacionid.value = data.poblacionid || "";
            formEditarForm.email.value = data.email || "";
            formEditarForm.telefono.value = data.telefono || "";
        })
        .catch(err => {
            alert("No se encontró el cliente");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            id_cliente: parseInt(formEditarForm.id_cliente.value),
            nombre: formEditarForm.nombre.value.trim(),
            nif: formEditarForm.nif.value.trim(),
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
            alert("Cliente actualizado correctamente");

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
            alert("Error al actualizar cliente");
        });
    });

    // ELIMINAR CLIENTE
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarDiv.classList.add("hide");

        formEliminarDiv.classList.remove("hide");
        eliminarClienteForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarClienteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id_cliente = eliminarClienteForm.eliminarClienteId.value.trim();

        if (!id_cliente) {
            alert("Debes ingresar el ID del cliente a eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar el cliente "${id_cliente}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        fetchProtegido(`${API_BASE}${id_cliente}`, { method: "DELETE" })
            .then(data => {
                alert("Cliente eliminado correctamente");

                eliminarClienteForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarClienteForm.classList.add("hide");

                tablaContainer.classList.remove("hide");
                togglePaginacion(true);

                btnEliminar.disabled = false;

                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar cliente: " + err.message);
            });
    });

});