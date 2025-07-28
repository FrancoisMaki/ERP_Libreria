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
                        throw new Error(text || "Error al cargar códigos postales");
                    });
                }
                return response.json();
            });
    }

    const API_BASE = "/api/codigos_postales/";

    // Variables y elementos globales
    const tablaContainer = document.getElementById("tablaCodigosPostales");
    const tbody = document.getElementById("tbodyCodigosPostales");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);
    const porPagina = 10;
    let paginaActual = 1;
    let paisidBusqueda = "";
    let prefijoBusqueda = "";
    let restoBusqueda = "";
    let poblacionidBusqueda = "";

    // Inputs de búsqueda y botón
    const buscarPaisidInput = document.getElementById("buscarPaisidCodigoPostalInput");
    const buscarPrefijoInput = document.getElementById("buscarPrefijoCodigoPostalInput");
    const buscarRestoInput = document.getElementById("buscarRestoCodigoPostalInput");
    const buscarPoblacionidInput = document.getElementById("buscarPoblacionidCodigoPostalInput");
    const buscarBtn = document.getElementById("buscarCodigoPostalBtn");

    buscarBtn.addEventListener("click", () => {
        paisidBusqueda = buscarPaisidInput.value.trim().toUpperCase();
        prefijoBusqueda = buscarPrefijoInput.value.trim();
        restoBusqueda = buscarRestoInput.value.trim();
        poblacionidBusqueda = buscarPoblacionidInput.value.trim();
        paginaActual = 1;
        cargarPagina(paginaActual);
    });

    const togglePaginacion = mostrar => {
        paginacionContainer.style.display = mostrar ? "flex" : "none";
    };

    const cargarPagina = (pagina) => {
        let url = `${API_BASE}?pagina=${pagina}&por_pagina=${porPagina}`;
        if (paisidBusqueda) url += `&paisid=${encodeURIComponent(paisidBusqueda)}`;
        if (prefijoBusqueda) url += `&prefijo=${encodeURIComponent(prefijoBusqueda)}`;
        if (restoBusqueda) url += `&resto=${encodeURIComponent(restoBusqueda)}`;
        if (poblacionidBusqueda) url += `&poblacionid=${encodeURIComponent(poblacionidBusqueda)}`;
        fetchProtegido(url)
            .then(data => {
                tbody.innerHTML = '';
                const codigos = data.codigos_postales || [];
                const totalPaginas = data.total_paginas || 1;

                codigos.forEach(codigo => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${codigo.id}</td>
                        <td>${codigo.paisid}</td>
                        <td>${codigo.prefijo}</td>
                        <td>${codigo.resto}</td>
                        <td>${codigo.poblacionid}</td>
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
                console.error("Error al cargar códigos postales:", error);
                tbody.innerHTML = '<tr><td colspan="6">Error al cargar códigos postales.</td></tr>';
            });
    };

    cargarPagina(paginaActual);
    tablaContainer.classList.remove("hide");
    cargarPagina(paginaActual);

    // Formularios y botones
    const formAgregarDiv = document.getElementById("formAgregarCodigoPostal");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarCodigoPostalBtn");

    const formEditarDiv = document.getElementById("formEditarCodigoPostal");
    const formEditarForm = document.getElementById("codigoPostalEditForm");
    const btnEditar = document.getElementById("editarCodigoPostalBtn");

    const formEliminarDiv = document.getElementById("formEliminarCodigoPostal");
    const eliminarCodigoPostalForm = document.getElementById("eliminarCodigoPostalForm");
    const btnEliminar = document.getElementById("eliminarCodigoPostalBtn");

    const buscarPaisidCodigoPostal = document.getElementById("buscarPaisidCodigoPostal");
    const buscarPrefijoCodigoPostal = document.getElementById("buscarPrefijoCodigoPostal");
    const buscarRestoCodigoPostal = document.getElementById("buscarRestoCodigoPostal");
    const buscarPoblacionidCodigoPostal = document.getElementById("buscarPoblacionidCodigoPostal");
    const btnBuscarCodigoPostal = document.getElementById("btnBuscarCodigoPostal");

    const formBuscarDiv = document.getElementById("busquedaEditarCodigoPostal");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarCodigoPostalBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarCodigoPostalForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'editarCodigoPostalBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarCodigoPostalForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarDiv.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
                break;

            case 'eliminarCodigoPostalBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarCodigoPostalForm.classList.remove("hide");

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
        const id = fila.children[0].textContent;
        const paisid = fila.children[1].textContent;
        const prefijo = fila.children[2].textContent;
        const resto = fila.children[3].textContent;
        const poblacionid = fila.children[4].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarCodigoPostalForm.classList.add("hide");

            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarDiv.classList.add("hide");

            formEditarForm.id.value = id;
            formEditarForm.paisid.value = paisid;
            formEditarForm.prefijo.value = prefijo;
            formEditarForm.resto.value = resto;
            formEditarForm.poblacionid.value = poblacionid;

            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }

        // Si es botón Eliminar, pregunta y elimina
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar el código postal ID: ${id}? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetchProtegido(`${API_BASE}${id}`, { method: "DELETE" })
                .then(data => {
                    alert("Código postal eliminado correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar código postal: " + err.message);
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
            eliminarCodigoPostalForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarCodigoPostalForm.reset();
        });
    });

    // AGREGAR CÓDIGO POSTAL
    btnAgregar.addEventListener("click", () => {
        formAgregarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnAgregar.disabled = true;
    });

    formAgregarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            paisid: formAgregarForm.paisid.value.trim().toUpperCase(),
            prefijo: parseInt(formAgregarForm.prefijo.value),
            resto: formAgregarForm.resto.value.trim(),
            poblacionid: parseInt(formAgregarForm.poblacionid.value)
        };

        fetchProtegido(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Código postal agregado correctamente");

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
            alert("Error al agregar código postal");
        });
    });

    // EDITAR CÓDIGO POSTAL
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarCodigoPostal.addEventListener("click", () => {
        const paisid = buscarPaisidCodigoPostal.value.trim().toUpperCase();
        const prefijo = buscarPrefijoCodigoPostal.value.trim();
        const resto = buscarRestoCodigoPostal.value.trim();
        const poblacionid = buscarPoblacionidCodigoPostal.value.trim();
        if (!paisid || !prefijo || !resto || !poblacionid) {
            alert("Completa país, prefijo, resto y población para buscar");
            return;
        }

        fetchProtegido(`${API_BASE}buscar?paisid=${encodeURIComponent(paisid)}&prefijo=${encodeURIComponent(prefijo)}&resto=${encodeURIComponent(resto)}&poblacionid=${encodeURIComponent(poblacionid)}`)
        .then(data => {
            formEditarForm.id.value = data.id;
            formEditarForm.paisid.value = data.paisid;
            formEditarForm.prefijo.value = data.prefijo;
            formEditarForm.resto.value = data.resto;
            formEditarForm.poblacionid.value = data.poblacionid;
        })
        .catch(err => {
            alert("No se encontró el código postal");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            id: parseInt(formEditarForm.id.value),
            paisid: formEditarForm.paisid.value.trim().toUpperCase(),
            prefijo: parseInt(formEditarForm.prefijo.value),
            resto: formEditarForm.resto.value.trim(),
            poblacionid: parseInt(formEditarForm.poblacionid.value)
        };

        fetchProtegido(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(data => {
            alert("Código postal actualizado correctamente");

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
            alert("Error al actualizar código postal");
        });
    });

    // ELIMINAR CÓDIGO POSTAL
    btnEliminar.addEventListener("click", () => {
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarDiv.classList.add("hide");

        formEliminarDiv.classList.remove("hide");
        eliminarCodigoPostalForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarCodigoPostalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = eliminarCodigoPostalForm.eliminarCodigoPostalId.value.trim();

        if (!id) {
            alert("Debes ingresar el ID del código postal a eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro que deseas eliminar el código postal "${id}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        fetchProtegido(`${API_BASE}${id}`, { method: "DELETE" })
            .then(data => {
                alert("Código postal eliminado correctamente");

                eliminarCodigoPostalForm.reset();
                formEliminarDiv.classList.add("hide");
                eliminarCodigoPostalForm.classList.add("hide");

                tablaContainer.classList.remove("hide");
                togglePaginacion(true);

                btnEliminar.disabled = false;

                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar código postal: " + err.message);
            });
    });

});