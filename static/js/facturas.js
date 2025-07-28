document.addEventListener("DOMContentLoaded", () => {
    // --- Configuración ---
    const API_FACTURAS = "/api/facturas/";
    const API_CLIENTES = "/api/clientes/?por_pagina=1000";
    const API_PRODUCTOS = "/api/productos/?por_pagina=1000";
    const API_MONEDAS = "/api/monedas/";

    // --- Cargar selectores (clientes, productos, monedas) ---
    const clienteSelect = document.getElementById("id_cliente");
    const monedaSelect = document.getElementById("moneda");
    const productoCache = {};

    // Clientes
    fetch(API_CLIENTES).then(r => r.json()).then(data => {
        (data.clientes || []).forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id_cliente;
            opt.textContent = `${c.nombre} (${c.nif})`;
            clienteSelect.appendChild(opt);
        });
    });

    // Monedas
    fetch(API_MONEDAS).then(r => r.json()).then(data => {
        (data.monedas || []).forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.codigo;
            opt.textContent = m.codigo;
            monedaSelect.appendChild(opt);
        });
    });

    // Productos
    let productos = [];
    let productosCargados = false;
    fetch(API_PRODUCTOS).then(r => r.json()).then(data => {
        productos = data.productos || [];
        productos.forEach(p => {
            productoCache[p.isbn] = p;
        });
        productosCargados = true;
        // Crear la primera línea solo después de cargar productos
        nuevaLinea();
    });

    // --- Lógica de líneas dinámicas ---
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

        // Eventos para recalcular
        inputCant.addEventListener("input", calcularSubtotal);
        inputPrecio.addEventListener("input", calcularSubtotal);

        // Autocompleta precio desde producto
        prodSel.addEventListener("change", () => {
            const prod = productoCache[prodSel.value];
            // Usa 'precio' o 'precio_venta' según tu backend
            if (prod) inputPrecio.value = prod.precio || prod.precio_venta || 0;
            calcularSubtotal();
        });

        function calcularSubtotal() {
            const subtotal = (parseFloat(inputCant.value) || 0) * (parseFloat(inputPrecio.value) || 0);
            spanSubtotal.textContent = subtotal.toFixed(2);
            calcularTotal();
        }

        // Inicializa el precio y subtotal al cargar
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

    // --- Guardar factura ---
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

        const datos = {
            id_cliente: clienteSelect.value,
            fecha: document.getElementById("fecha").value,
            moneda: monedaSelect.value,
            lineas: lineas
        };

        fetch(API_FACTURAS, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.id_cabfac) {
                alert("Factura guardada correctamente");
                window.location.href = `/facturas/${data.id_cabfac}`;
            } else {
                alert("Error al guardar factura");
            }
        })
        .catch(err => alert("Error al guardar factura: " + err));
    });
});