document.addEventListener("DOMContentLoaded", () => {
    // Declaración de variables DOM al principio
    const facturaInput = document.getElementById("factura_asociada");
    const facturaSugerencias = document.getElementById("facturaSugerencias");
    const idCabfacInput = document.getElementById("id_cabfac");
    const tablaLineas = document.getElementById("tablaLineasNC");
    const tbodyLineas = document.getElementById("tbodyLineasNC");
    const agregarLineaBtn = document.getElementById("agregarLineaNCBtn");
    const totalNCSpan = document.getElementById("totalNotaCredito");
    const notaCreditoForm = document.getElementById("notaCreditoForm");

    // Productos
    let productos = [];
    let productoCache = {};
    fetch("/api/productos/?por_pagina=1000").then(r => r.json()).then(data => {
        productos = data.productos || [];
        productos.forEach(p => {
            productoCache[p.isbn] = p;
        });
    });

    // Autocompletar búsqueda de factura asociada
    facturaInput.addEventListener("input", function() {
        const valor = facturaInput.value.trim();
        idCabfacInput.value = "";
        if (valor.length < 1) {
            facturaSugerencias.innerHTML = "";
            return;
        }
        fetch(`/api/facturas/buscar?q=${encodeURIComponent(valor)}`)
            .then(r => r.json())
            .then(data => {
                facturaSugerencias.innerHTML = "";
                (data.facturas || []).forEach(fac => {
                    const div = document.createElement("div");
                    div.textContent = `#${fac.id_cabfac} - ${fac.cliente_nombre} (${fac.cliente_nif}) - ${fac.fecha}`;
                    div.onclick = function() {
                        facturaInput.value = `#${fac.id_cabfac} - ${fac.cliente_nombre} (${fac.cliente_nif})`;
                        idCabfacInput.value = fac.id_cabfac;
                        facturaSugerencias.innerHTML = "";
                        facturaInput.dispatchEvent(new Event("facturaSeleccionada"));
                    };
                    facturaSugerencias.appendChild(div);
                });
            });
    });

    document.addEventListener("click", function(e) {
        if (!facturaInput.contains(e.target) && !facturaSugerencias.contains(e.target)) {
            facturaSugerencias.innerHTML = "";
        }
    });

    // Cuando el usuario selecciona una factura, carga sus líneas
    facturaInput.addEventListener("facturaSeleccionada", function() {
        limpiarLineas();
        const id_cabfac = idCabfacInput.value;
        if (!id_cabfac) return;
        fetch(`/api/facturas/${id_cabfac}`)
            .then(r => r.json())
            .then(data => {
                const lineas = data.lineas || [];
                lineas.forEach(l => agregarLineaNC(l.id_producto, l.cantidad, l.precio_unitario, l.titulo));
                calcularTotalNC();
            });
    });

    function limpiarLineas() {
        tbodyLineas.innerHTML = "";
    }

    function agregarLineaNC(id_producto, cantidad, precio_unitario, titulo = "") {
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
        if (id_producto) prodSel.value = id_producto;
        tdProd.appendChild(prodSel);

        // Cantidad
        const tdCant = document.createElement("td");
        const inputCant = document.createElement("input");
        inputCant.type = "number";
        inputCant.min = 1;
        inputCant.value = cantidad || 1;
        inputCant.required = true;
        tdCant.appendChild(inputCant);

        // Precio unitario
        const tdPrecio = document.createElement("td");
        const inputPrecio = document.createElement("input");
        inputPrecio.type = "number";
        inputPrecio.step = "0.01";
        inputPrecio.min = 0;
        inputPrecio.required = true;
        inputPrecio.value = precio_unitario || "";
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
            calcularTotalNC();
        };
        tdAccion.appendChild(btnQuitar);

        inputCant.addEventListener("input", calcularSubtotal);
        inputPrecio.addEventListener("input", calcularSubtotal);

        prodSel.addEventListener("change", function() {
            const prod = productoCache[prodSel.value];
            if (prod && !precio_unitario) inputPrecio.value = prod.precio || prod.precio_venta || 0;
            calcularSubtotal();
        });

        function calcularSubtotal() {
            const subtotal = (parseFloat(inputCant.value) || 0) * (parseFloat(inputPrecio.value) || 0);
            spanSubtotal.textContent = (subtotal).toFixed(2);
            calcularTotalNC();
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
        calcularTotalNC();
    }

    agregarLineaBtn.addEventListener("click", () => agregarLineaNC());

    function calcularTotalNC() {
        let total = 0;
        tbodyLineas.querySelectorAll("tr").forEach(tr => {
            const subtotal = parseFloat(tr.querySelector("td:nth-child(4) span").textContent) || 0;
            total -= subtotal; // Nota de crédito suma valores negativos
        });
        totalNCSpan.textContent = total.toFixed(2);
    }

    // Guardar nota de crédito
    notaCreditoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id_cabfac = idCabfacInput.value;
        if (!id_cabfac) {
            alert("Selecciona una factura a rectificar.");
            return;
        }
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
            alert("Completa todas las líneas de la nota de crédito.");
            return;
        }
        const motivo = document.getElementById("motivo").value.trim();
        if (!motivo) {
            alert("Debes indicar el motivo.");
            return;
        }
        const datos = {
            id_cabfac: id_cabfac,
            fecha: document.getElementById("fecha").value,
            motivo: motivo,
            lineas: lineas
        };
        fetch("/api/notas_credito/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.id_nota_credito) {
                alert("Nota de crédito guardada correctamente");
                window.location.href = `/notas_credito`;
            } else {
                alert(data.error || "Error al guardar nota de crédito");
            }
        })
        .catch(err => alert("Error al guardar nota de crédito: " + err));
    });
});