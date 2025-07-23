document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "/cliente/api/paises/";

    const tablaContainer = document.getElementById("tablaPaises");
    const tbody = document.getElementById("tbodyPaises");
    const paginacionContainer = document.createElement("div");
    paginacionContainer.classList.add("paginacion");
    tablaContainer.after(paginacionContainer);

    const togglePaginacion = mostrar => {
        paginacionContainer.style.display = mostrar ? "flex" : "none";
    };

    let paginaActual = 1;
    const porPagina = 10;

    const cargarPagina = (pagina) => {
        fetch(`${API_BASE}?pagina=${pagina}&por_pagina=${porPagina}`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar países");
                return res.json();
            })
            .then(data => {
                tbody.innerHTML = ''; // Limpiar la tabla
                const paises = data.paises || [];
                const totalPaginas = data.total_paginas || 1;

                paises.forEach(pais => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${pais.paisid}</td>
                        <td>${pais.nombre}</td>
                        <td>${pais.codigo_numerico}</td>
                        <td>${pais.prefijo_telefono || ''}</td>
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
                console.error("Error al cargar países:", error);
            });
    };

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
    const formAgregarDiv = document.getElementById("formAgregarPais");
    const formAgregarForm = formAgregarDiv.querySelector("form");
    const btnAgregar = document.getElementById("agregarPaisBtn");

    const formEditarDiv = document.getElementById("formEditarPais");
    const formEditarForm = formEditarDiv.querySelector("form");
    const btnEditar = document.getElementById("editarPaisBtn");

    const formEliminarDiv = document.getElementById("formEliminarPais");
    const eliminarPaisForm = document.getElementById("eliminarPaisForm");
    const btnEliminar = document.getElementById("eliminarPaisBtn");

    const btnCancelar = document.getElementById("cancelarBtn");
    
    const buscarInput = document.getElementById("buscarNombrePais");
    const btnBuscarPais = document.getElementById("btnBuscarPais");

    const formBuscarPaisDiv = document.getElementById("busquedaEditarPais");

    function manejarAccion(event) {
        switch (event.target.id) {
            case 'agregarPaisBtn':
                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarPaisDiv.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarPaisForm.classList.add("hide");

                formAgregarDiv.classList.remove("hide");
                formAgregarForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);
                
                btnAgregar.disabled = true;
                btnEditar.disabled = false;
                btnEliminar.disabled = false;

                break;

            case 'editarPaisBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEliminarDiv.classList.add("hide");
                eliminarPaisForm.classList.add("hide");

                formEditarDiv.classList.remove("hide");
                formEditarForm.classList.remove("hide");
                formBuscarPaisDiv.classList.remove("hide");
                
                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEditar.disabled = true;
                btnAgregar.disabled = false;
                btnEliminar.disabled = false;
            
                break;

            case 'eliminarPaisBtn':
                formAgregarDiv.classList.add("hide");
                formAgregarForm.classList.add("hide");

                formEditarDiv.classList.add("hide");
                formEditarForm.classList.add("hide");
                formBuscarPaisDiv.classList.add("hide");

                formEliminarDiv.classList.remove("hide");
                eliminarPaisForm.classList.remove("hide");

                tablaContainer.classList.add("hide");
                togglePaginacion(false);

                btnEliminar.disabled = true;
                btnAgregar.disabled = false;
                btnEditar.disabled = false;

            default:
                console.log('Acción desconocida');
        }
    }

    
    // Asígnalo a los dos botones principales
    btnAgregar.addEventListener("click", manejarAccion);
    btnEditar.addEventListener("click", manejarAccion);
    btnEliminar.addEventListener("click", manejarAccion);

        // Delegación de eventos en la tabla para editar y eliminar
    tbody.addEventListener('click', function(event) {
        const btn = event.target;
        if (btn.tagName !== 'BUTTON') return;
        const fila = btn.closest('tr');
        const paisid = fila.children[0].textContent;
        const nombre = fila.children[1].textContent;
        const codigo_numerico = fila.children[2].textContent;
        const prefijo_telefono = fila.children[3].textContent;

        // Si es botón Editar, muestra el form de editar y rellena los datos
        if (btn.textContent === 'Editar') {
            // Oculta todo y muestra solo el editar
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");
            formEliminarDiv.classList.add("hide");
            eliminarPaisForm.classList.add("hide");
            tablaContainer.classList.add("hide");
            togglePaginacion(false);

            formEditarDiv.classList.remove("hide");
            formEditarForm.classList.remove("hide");
            formBuscarPaisDiv.classList.add("hide"); // Si quieres ocultar buscador aquí

            // Rellena el form de editar
            formEditarForm.paisid.value = paisid;
            formEditarForm.nombre.value = nombre;
            formEditarForm.codigo_numerico.value = codigo_numerico;
            formEditarForm.prefijo_telefono.value = prefijo_telefono;

            btnEditar.disabled = true;
            btnAgregar.disabled = false;
            btnEliminar.disabled = false;
        }

        // Si es botón Eliminar, pregunta y elimina
        if (btn.textContent === 'Eliminar') {
            if (!window.confirm(`¿Estás seguro que deseas eliminar el país "${nombre}" (ID: ${paisid})? Esta acción no se puede deshacer.`)) {
                return;
            }
            fetch(`${API_BASE}${paisid}`, { method: "DELETE" })
                .then(res => {
                    if (!res.ok) throw new Error("No se encontró el país o no se pudo eliminar");
                    alert("País eliminado correctamente");
                    cargarPagina(paginaActual);
                })
                .catch(err => {
                    alert("Error al eliminar país: " + err.message);
                });
        }
    });

    document.querySelectorAll('.cancelarBtn').forEach(btn => {
        btn.addEventListener("click", () => {
            formAgregarDiv.classList.add("hide");
            formAgregarForm.classList.add("hide");

            formEditarDiv.classList.add("hide");
            formEditarForm.classList.add("hide");
            formBuscarPaisDiv.classList.add("hide");

            formEliminarDiv.classList.add("hide");
            eliminarPaisForm.classList.add("hide");

            tablaContainer.classList.remove("hide");
            togglePaginacion(true);

            btnAgregar.disabled = false;
            btnEditar.disabled = false;
            btnEliminar.disabled = false;

            formAgregarForm.reset();
            formEditarForm.reset();
            eliminarPaisForm.reset();
        });
    });

    // AGREGAR PAÍS
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
            nombre: formAgregarForm.nombre.value.trim(),
            codigo_numerico: formAgregarForm.codigo_numerico.value ? parseInt(formAgregarForm.codigo_numerico.value) : null,
            prefijo_telefono: formAgregarForm.prefijo_telefono.value.trim()
        };

        fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al guardar país");
            return res.json();
        })
        .then(data => {
            alert("País agregado correctamente");
            formAgregarForm.reset();
            formAgregarDiv.classList.add("hide");
            btnAgregar.disabled = false;
            togglePaginacion(true);
            cargarPagina(1);
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error al agregar país");
        });
    });

    // EDITAR PAÍS
    btnEditar.addEventListener("click", () => {
        formEditarDiv.classList.remove("hide");
        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEditar.disabled = true;
    });

    btnBuscarPais.addEventListener("click", () => {
        const nombre = buscarInput.value.trim();
        if (!nombre) {
            alert("Ingresa el nombre del país a buscar");
            return;
        }

        fetch(`${API_BASE}/buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(res => {
            if (!res.ok) throw new Error("País no encontrado");
            return res.json();
        })
        .then(data => {
            formEditarForm.paisid.value = data.paisid;
            formEditarForm.nombre.value = data.nombre;
            formEditarForm.codigo_numerico.value = data.codigo_numerico || "";
            formEditarForm.prefijo_telefono.value = data.prefijo_telefono || "";
        })
        .catch(err => {
            alert("No se encontró el país");
            formEditarForm.reset();
        });
    });

    formEditarForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const datos = {
            paisid: formEditarForm.paisid.value.trim().toUpperCase(),
            nombre: formEditarForm.nombre.value.trim(),
            codigo_numerico: formEditarForm.codigo_numerico.value ? parseInt(formEditarForm.codigo_numerico.value) : null,
            prefijo_telefono: formEditarForm.prefijo_telefono.value.trim()
        };

        fetch(API_BASE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al actualizar país");
            return res.json();
        })
        .then(data => {
            alert("País actualizado correctamente");
            formEditarForm.reset();
            formEditarDiv.classList.add("hide");
            tablaContainer.classList.remove("hide");
            togglePaginacion(true);
            btnEditar.disabled = false;
            cargarPagina(1);
        })
        .catch(err => {
            alert("Error al actualizar país");
        });
    });

    // ELIMINAR PAÍS
        // Mostrar el formulario de eliminar
    btnEliminar.addEventListener("click", () => {
        // Oculta los demás formularios
        formAgregarDiv.classList.add("hide");
        formAgregarForm.classList.add("hide");
        formEditarDiv.classList.add("hide");
        formEditarForm.classList.add("hide");
        formBuscarPaisDiv.classList.add("hide");

        // Muestra el form eliminar
        formEliminarDiv.classList.remove("hide");
        eliminarPaisForm.classList.remove("hide");

        tablaContainer.classList.add("hide");
        togglePaginacion(false);
        btnEliminar.disabled = true;
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
    });

    eliminarPaisForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = eliminarPaisForm.eliminarPaisId.value.trim();

        if (!valor) {
            alert("Debes ingresar el ID o nombre del país a eliminar");
            return;
        }

        // <--- Aquí agregamos la confirmación
        if (!window.confirm(`¿Estás seguro que deseas eliminar el país "${valor}"? Esta acción no se puede deshacer.`)) {
            return; // Si el usuario cancela, no hace nada
        }

        fetch(`${API_BASE}${valor}`, { method: "DELETE" })
            .then(res => {
                if (!res.ok) throw new Error("No se encontró el país o no se pudo eliminar");
                alert("País eliminado correctamente");
                eliminarPaisForm.reset();
                formEliminarDiv.classList.add("hide");
                tablaContainer.classList.remove("hide");
                togglePaginacion(true);
                btnEliminar.disabled = false;
                cargarPagina(1);
            })
            .catch(err => {
                alert("Error al eliminar país: " + err.message);
            });
    });

});