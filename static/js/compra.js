document.addEventListener("DOMContentLoaded", () => {
    // ---- AUTOCOMPLETAR PROVEEDOR ----
    const proveedorInput = document.getElementById("proveedorInput");
    const proveedorSugerencias = document.getElementById("proveedorSugerencias");
    const idProveedorInput = document.getElementById("id_proveedor");
    proveedorInput.addEventListener("input", function() {
        const valor = proveedorInput.value.trim();
        idProveedorInput.value = "";
        if (valor.length < 1) {
            proveedorSugerencias.innerHTML = "";
            return;
        }
        fetch(`/api/proveedores/buscar?q=${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(data => {
                proveedorSugerencias.innerHTML = "";
                (data.proveedores || []).forEach(p => {
                    const div = document.createElement("div");
                    div.textContent = `${p.nombre} (${p.cif || "-"})`;
                    div.onclick = function() {
                        proveedorInput.value = p.nombre;
                        idProveedorInput.value = p.id_proveedor;
                        proveedorSugerencias.innerHTML = "";
                    };
                    proveedorSugerencias.appendChild(div);
                });
            });
    });
    document.addEventListener("click", function(e) {
        if (!proveedorInput.contains(e.target) && !proveedorSugerencias.contains(e.target)) {
            proveedorSugerencias.innerHTML = "";
        }
    });

    // ---- AUTOCOMPLETAR ALMACEN ----
    const almacenInput = document.getElementById("almacenInput");
    const almacenSugerencias = document.getElementById("almacenSugerencias");
    const idAlmacenInput = document.getElementById("id_almacen");
    almacenInput.addEventListener("input", function() {
        const valor = almacenInput.value.trim();
        idAlmacenInput.value = "";
        if (valor.length < 1) {
            almacenSugerencias.innerHTML = "";
            return;
        }
        fetch(`/api/almacenes/buscar?q=${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(data => {
                almacenSugerencias.innerHTML = "";
                (data.almacenes || []).forEach(a => {
                    const div = document.createElement("div");
                    div.textContent = `${a.nombre} (${a.direccion || "-"})`;
                    div.onclick = function() {
                        almacenInput.value = a.nombre;
                        idAlmacenInput.value = a.id_almacen;
                        almacenSugerencias.innerHTML = "";
                    };
                    almacenSugerencias.appendChild(div);
                });
            });
    });
    document.addEventListener("click", function(e) {
        if (!almacenInput.contains(e.target) && !almacenSugerencias.contains(e.target)) {
            almacenSugerencias.innerHTML = "";
        }
    });

    // ---- LÍNEAS DE COMPRA ----
    const tbodyLineas = document.getElementById("tbodyLineasCompra");
    const agregarLineaBtn = document.getElementById("agregarLineaBtn");
    const totalCompraSpan = document.getElementById("totalCompra");

    // Para autocompletar ISBN y título
    function autoCompletarProducto(input, onSelect) {
        let sugerenciasDiv = document.createElement('div');
        sugerenciasDiv.className = "autocomplete-list";
        input.parentNode.appendChild(sugerenciasDiv);

        input.addEventListener("input", function () {
            const valor = input.value.trim();
            sugerenciasDiv.innerHTML = "";
            if (valor.length < 1) return;
            fetch(`/api/productos/buscar?q=${encodeURIComponent(valor)}`)
                .then(r => r.json())
                .then(data => {
                    sugerenciasDiv.innerHTML = "";
                    (data.productos || []).forEach(p => {
                        const div = document.createElement("div");
                        div.textContent = `${p.isbn} - ${p.titulo}`;
                        div.onclick = function () {
                            onSelect(p);
                            sugerenciasDiv.innerHTML = "";
                        };
                        sugerenciasDiv.appendChild(div);
                    });
                });
        });
        document.addEventListener("click", function (e) {
            if (!input.contains(e.target) && !sugerenciasDiv.contains(e.target)) {
                sugerenciasDiv.innerHTML = "";
            }
        });
    }

    function agregarLineaCompra(prodData = null) {
        const tr = document.createElement("tr");

        // ISBN
        const tdIsbn = document.createElement("td");
        const isbnInput = document.createElement("input");
        isbnInput.type = "text";
        isbnInput.className = "input-isbn";
        isbnInput.name = "isbn";
        isbnInput.required = true;
        isbnInput.placeholder = "ISBN";
        isbnInput.autocomplete = "off";
        isbnInput.value = prodData ? prodData.isbn : "";
        tdIsbn.appendChild(isbnInput);

        // Título
        const tdTitulo = document.createElement("td");
        const tituloInput = document.createElement("input");
        tituloInput.type = "text";
        tituloInput.className = "input-titulo";
        tituloInput.name = "titulo";
        tituloInput.required = true;
        tituloInput.placeholder = "Título";
        tituloInput.autocomplete = "off";
        tituloInput.value = prodData ? prodData.titulo : "";
        tdTitulo.appendChild(tituloInput);

        // Cantidad
        const tdCant = document.createElement("td");
        const inputCant = document.createElement("input");
        inputCant.type = "number";
        inputCant.min = 1;
        inputCant.value = 1;
        inputCant.required = true;
        inputCant.className = "input-cantidad";
        tdCant.appendChild(inputCant);

        // Precio unitario
        const tdPrecio = document.createElement("td");
        const inputPrecio = document.createElement("input");
        inputPrecio.type = "number";
        inputPrecio.step = "0.01";
        inputPrecio.min = 0;
        inputPrecio.required = true;
        inputPrecio.className = "input-precio";
        inputPrecio.value = prodData ? prodData.precio : "";
        tdPrecio.appendChild(inputPrecio);

        // Subtotal
        const tdSubtotal = document.createElement("td");
        const spanSubtotal = document.createElement("span");
        spanSubtotal.textContent = "0.00";
        tdSubtotal.appendChild(spanSubtotal);

        // Acción quitar
        const tdAccion = document.createElement("td");
        const btnQuitar = document.createElement("button");
        btnQuitar.type = "button";
        btnQuitar.textContent = "Quitar";
        btnQuitar.className = "crud-buttons quitar-linea";
        btnQuitar.onclick = () => { tr.remove(); calcularTotalCompra(); };
        tdAccion.appendChild(btnQuitar);

        // Eventos para recalcular subtotal
        inputCant.addEventListener("input", calcularSubtotal);
        inputPrecio.addEventListener("input", calcularSubtotal);

        // Autocompletar ISBN: rellena título y precio si encuentra producto
        autoCompletarProducto(isbnInput, (prod) => {
            isbnInput.value = prod.isbn;
            tituloInput.value = prod.titulo;
            if (prod.precio) inputPrecio.value = prod.precio;
            calcularSubtotal();
        });

        // Autocompletar Título: rellena ISBN y precio si encuentra producto
        autoCompletarProducto(tituloInput, (prod) => {
            isbnInput.value = prod.isbn;
            tituloInput.value = prod.titulo;
            if (prod.precio) inputPrecio.value = prod.precio;
            calcularSubtotal();
        });

        function calcularSubtotal() {
            const subtotal = (parseFloat(inputCant.value) || 0) * (parseFloat(inputPrecio.value) || 0);
            spanSubtotal.textContent = subtotal.toFixed(2);
            calcularTotalCompra();
        }

        setTimeout(calcularSubtotal, 150);

        tr.appendChild(tdIsbn);
        tr.appendChild(tdTitulo);
        tr.appendChild(tdCant);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdSubtotal);
        tr.appendChild(tdAccion);

        tbodyLineas.appendChild(tr);
        calcularTotalCompra();
    }

    agregarLineaBtn.addEventListener("click", () => agregarLineaCompra());

    function calcularTotalCompra() {
        let total = 0;
        tbodyLineas.querySelectorAll("tr").forEach(tr => {
            const subtotal = parseFloat(tr.querySelector("td:nth-child(5) span").textContent) || 0;
            total += subtotal;
        });
        totalCompraSpan.textContent = total.toFixed(2);
    }

    // ---- GUARDAR COMPRA ----
    const compraForm = document.getElementById("compraForm");
    compraForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id_proveedor = idProveedorInput.value;
        const id_almacen = idAlmacenInput.value;
        const fecha = document.getElementById("fecha").value;
        const moneda = document.getElementById("moneda").value.trim();
        const lineas = [];
        let valido = true;

        tbodyLineas.querySelectorAll("tr").forEach(tr => {
            const isbn = tr.querySelector('input[name="isbn"]')?.value.trim();
            const titulo = tr.querySelector('input[name="titulo"]')?.value.trim();
            const cantidad = parseInt(tr.querySelector('.input-cantidad')?.value, 10) || 0;
            const precio_unitario = parseFloat(tr.querySelector('.input-precio')?.value) || 0;
            if (!isbn || !titulo || !cantidad || !precio_unitario) {
                valido = false;
            }
            lineas.push({ isbn, titulo, cantidad, precio_unitario });
        });

        if (!valido || lineas.length === 0) {
            alert("Completa todos los datos de los productos.");
            return;
        }
        if (!id_proveedor || !id_almacen) {
            alert("Debes seleccionar proveedor y almacén.");
            return;
        }

        const datos = {
            id_proveedor,
            id_almacen,
            fecha,
            moneda,
            lineas
        };

        fetch("/api/compras/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.id_cabcompra) {
                alert("Compra registrada correctamente");
                window.location.href = `/compras`; // O donde prefieras
            } else {
                alert(data.error || "Error al guardar compra");
            }
        })
        .catch(err => alert("Error al guardar compra: " + err));
    });

    // Añade al menos una línea al principio
    agregarLineaCompra();
});