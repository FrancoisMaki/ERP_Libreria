document.addEventListener("DOMContentLoaded", () => {
    // --- Configuración ---
    const API_FACTURAS = "/api/facturas/";
    const API_CLIENTES_BUSCAR = "/api/clientes/buscar";
    const API_PRODUCTOS = "/api/productos/?por_pagina=1000";
    const API_MONEDAS = "/api/monedas/";

    // --- Autocompletado de cliente por NIF ---
    const clienteInput = document.getElementById("cliente_nif");
    const clienteSugerencias = document.getElementById("clienteSugerencias");
    const idClienteInput = document.getElementById("id_cliente");

    clienteInput.addEventListener("input", function() {
        const valor = clienteInput.value.trim();
        idClienteInput.value = ""; // Limpiar id_cliente si cambia NIF
        if (valor.length < 2) {
            clienteSugerencias.innerHTML = "";
            return;
        }
        fetch(`${API_CLIENTES_BUSCAR}?nif=${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(data => {
                clienteSugerencias.innerHTML = "";
                (data.clientes || []).forEach(cli => {
                    const div = document.createElement("div");
                    div.textContent = `${cli.nombre} (${cli.nif})`;
                    div.onclick = function() {
                        clienteInput.value = cli.nif;
                        idClienteInput.value = cli.id_cliente;
                        clienteSugerencias.innerHTML = "";
                    };
                    clienteSugerencias.appendChild(div);
                });
            });
    });
    document.addEventListener("click", function(e) {
        if (!clienteInput.contains(e.target) && !clienteSugerencias.contains(e.target)) {
            clienteSugerencias.innerHTML = "";
        }
    });

    // --- Cargar monedas ---
    const monedaSelect = document.getElementById("moneda");
    fetch(API_MONEDAS).then(r => r.json()).then(data => {
        (data.monedas || []).forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.codigo;
            opt.textContent = m.codigo;
            monedaSelect.appendChild(opt);
        });
    });

    // --- Productos y líneas dinámicas ---
    let productos = [];
    let productosCargados = false;
    const productoCache = {};
    fetch(API_PRODUCTOS).then(r => r.json()).then(data => {
        productos = data.productos || [];
        productos.forEach(p => {
            productoCache[p.isbn] = p;
        });
        productosCargados = true;
        nuevaLinea();
    });

    const tablaLineas = document.getElementById("tablaLineas");
    const tbodyLineas = document.getElementById("tbodyLineas");
    const agregarLineaBtn = document.getElementById("agregarLineaBtn");
    const totalFacturaSpan = document.getElementById("totalFactura");

    function nuevaLinea() {
        if (!productosCargados || productos.length === 0) {
            alert("Todavía no se han cargado los productos. Espera unos segundos.");
            return;
        }

        const tr = document.createElement("tr");

        // Producto
        const tdProd = document.createElement("td");
        const prodSel = document.createElement("select");
        prodSel.required = true;
        productos.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.isbn;
            opt.textContent = `${p.titulo} (${p.isbn})`;
            prodSel.appendChild(opt);
        });
        tdProd.appendChild(prodSel);

        // Cantidad
        const tdCant = document.createElement("td");
        const inputCant = document.createElement("input");
        inputCant.type = "number";
        inputCant.min = 1;
        inputCant.value = 1;
        inputCant.required = true;
        tdCant.appendChild(inputCant);

        // Precio unitario
        const tdPrecio = document.createElement("td");
        const inputPrecio = document.createElement("input");
        inputPrecio.type = "number";
        inputPrecio.step = "0.01";
        inputPrecio.min = 0;
        inputPrecio.required = true;
        tdPrecio.appendChild(inputPrecio);

        // Subtotal
        const tdSubtotal = document.createElement("td");
        const spanSubtotal = document.createElement("span");
        spanSubtotal.textContent = "0.00";
        tdSubtotal.appendChild(spanSubtotal);

        // Quitar línea
        const tdAccion = document.createElement("td");
        const btnQuitar = document.createElement("button");
        btnQuitar.type = "button";
        btnQuitar.textContent = "Quitar";
        btnQuitar.onclick = () => {
            tr.remove();
            calcularTotal();
        };
        tdAccion.appendChild(btnQuitar);

        // Recalcular subtotal y total
        inputCant.addEventListener("input", calcularSubtotal);
        inputPrecio.addEventListener("input", calcularSubtotal);

        // Autocompleta precio desde producto
        prodSel.addEventListener("change", () => {
            const prod = productoCache[prodSel.value];
            if (prod) inputPrecio.value = prod.precio || prod.precio_venta || 0;
            calcularSubtotal();
        });

        function calcularSubtotal() {
            const subtotal = (parseFloat(inputCant.value) || 0) * (parseFloat(inputPrecio.value) || 0);
            spanSubtotal.textContent = subtotal.toFixed(2);
            calcularTotal();
        }

        setTimeout(() => {
            prodSel.dispatchEvent(new Event("change"));
        }, 100);

        tr.appendChild(tdProd);
        tr.appendChild(tdCant);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdSubtotal);
        tr.appendChild(tdAccion);

        tbodyLineas.appendChild(tr);
    }

    agregarLineaBtn.addEventListener("click", nuevaLinea);

    function calcularTotal() {
        let total = 0;
        tbodyLineas.querySelectorAll("tr").forEach(tr => {
            const subtotal = parseFloat(tr.querySelector("td:nth-child(4) span").textContent) || 0;
            total += subtotal;
        });
        totalFacturaSpan.textContent = total.toFixed(2);
    }

    // --- NUEVO: Pago inicial en el formulario ---
    // Agrega campos al form en tu HTML:
    // <h3>Registrar pago inicial (opcional)</h3>
    // <div class="row-flex">
    //   <div class="form-group">
    //     <label for="pago_cantidad">Monto pagado:</label>
    //     <input type="number" step="0.01" id="pago_cantidad" name="pago_cantidad" placeholder="Ej: 49.99" min="0">
    //   </div>
    //   <div class="form-group">
    //     <label for="pago_metodo">Método de pago:</label>
    //     <select id="pago_metodo" name="pago_metodo">
    //       <option value="">Selecciona...</option>
    //       <option value="Contado">Contado</option>
    //       <option value="Tarjeta">Tarjeta</option>
    //       <option value="Transferencia">Transferencia</option>
    //       <option value="Otro">Otro</option>
    //     </select>
    //   </div>
    //   <div class="form-group">
    //     <label for="pago_fecha">Fecha de pago:</label>
    //     <input type="date" id="pago_fecha" name="pago_fecha">
    //   </div>
    // </div>

    // Guardar factura
    const facturaForm = document.getElementById("facturaForm");
    facturaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const lineas = [];
        let valido = true;
        tbodyLineas.querySelectorAll("tr").forEach(tr => {
            const id_producto = tr.querySelector("select").value;
            const cantidad = parseInt(tr.querySelector("td:nth-child(2) input").value);
            const precio_unitario = parseFloat(tr.querySelector("td:nth-child(3) input").value);
            if (!id_producto || !cantidad || !precio_unitario) {
                valido = false;
            }
            lineas.push({ id_producto, cantidad, precio_unitario });
        });
        if (!valido || lineas.length === 0) {
            alert("Completa todas las líneas de la factura.");
            return;
        }

        const id_cliente = idClienteInput.value;
        if (!id_cliente) {
            alert("Selecciona un cliente válido para la factura.");
            return;
        }

        // Tomar datos de pago inicial
        const pago_cantidad = parseFloat(document.getElementById("pago_cantidad")?.value || "");
        const pago_metodo = document.getElementById("pago_metodo")?.value || "";
        const pago_fecha = document.getElementById("pago_fecha")?.value || "";

        const datos = {
            id_cliente: id_cliente,
            fecha: document.getElementById("fecha").value,
            moneda: monedaSelect.value,
            lineas: lineas
        };

        // Si hay datos de pago, agregar al JSON
        if (pago_cantidad && pago_metodo && pago_fecha) {
            datos.pago_inicial = {
                cantidad: pago_cantidad,
                metodo_pago: pago_metodo,
                fecha_pago: pago_fecha
            };
        }

        fetch(API_FACTURAS, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.id_cabfac) {
                alert("Factura guardada correctamente");
                window.location.href = `/factura_detalle/${data.id_cabfac}`;
            } else {
                alert(data.error || "Error al guardar factura");
            }
        })
        .catch(err => alert("Error al guardar factura: " + err));
    });
});