let facturasAll = [];
let facturaSeleccionada = null;

function formatFecha(fechaStr) {
    if (!fechaStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;
    const d = new Date(fechaStr);
    if (isNaN(d)) return fechaStr;
    return d.toISOString().slice(0, 10);
}

function renderFacturasLista(filtrarNIF) {
    const ul = document.getElementById("listaFacturas");
    ul.innerHTML = "";
    let mostrar = facturasAll;
    if (filtrarNIF && filtrarNIF.trim() !== "") {
        mostrar = facturasAll.filter(f => f.cliente_nif && f.cliente_nif.toLowerCase().includes(filtrarNIF.toLowerCase()));
    }
    if (mostrar.length === 0) {
        ul.innerHTML = "<li style='color:#999;'>No hay facturas...</li>";
        return;
    }
    mostrar.forEach(fac => {
        const li = document.createElement("li");
        li.className = (facturaSeleccionada && fac.id_cabfac === facturaSeleccionada) ? "selected" : "";
        li.innerHTML = `
            <span class="factura-lista-main">#${fac.id_cabfac} ${fac.cliente_nombre} <span style="color:#777;">(${fac.cliente_nif})</span></span>
            <span class="factura-lista-fecha">${formatFecha(fac.fecha)}</span>
        `;
        li.onclick = () => {
            facturaSeleccionada = fac.id_cabfac;
            renderFacturasLista(document.getElementById("filtroNIF").value);
            cargarDetalleFactura(fac.id_cabfac);
        };
        ul.appendChild(li);
    });
}

function cargarFacturas() {
    fetch("/api/facturas/?por_pagina=1000")
        .then(r => r.json())
        .then(data => {
            facturasAll = (data.facturas || []);
            renderFacturasLista("");
        });
}

function cargarDetalleFactura(id_cabfac) {
    const panel = document.getElementById("detalleFacturaPanel");
    panel.innerHTML = "<div style='text-align:center;color:#888;margin-top:40px;'>Cargando...</div>";
    fetch(`/api/facturas/${id_cabfac}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                panel.innerHTML = `<div style="color:red;">${data.error}</div>`;
                return;
            }
            const cab = data.cabecera;
            let html = `
                <h2 style="margin-bottom: 0; font-size: 1.5em;">Visualizar factura</h2>
                <span id="facturaId" style="display:none">${cab.id_cabfac}</span>
                <div id="cabeceraFactura" style="margin-bottom: 20px;">
                    <p><b>Cliente:</b> <span id="clienteNombre">${cab.cliente_nombre}</span></p>
                    <p><b>Fecha:</b> <span id="fecha">${formatFecha(cab.fecha)}</span></p>
                    <p><b>Moneda:</b> <span id="moneda">${cab.moneda}</span></p>
                    <p><b>Total:</b> <span id="total">${parseFloat(cab.total).toFixed(2)}</span></p>
                </div>
                <h3>Líneas de la factura</h3>
                <table class="tabla-paises tabla-factura">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody id="lineasFactura"></tbody>
                </table>
                <h3>Pagos</h3>
                <table class="tabla-paises tabla-factura">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Método</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody id="pagosFactura"></tbody>
                </table>
                <p style="font-weight: 500;"><b>Total pagado:</b> <span id="totalPagado"></span></p>
                <p style="font-weight: 500;"><b>Pendiente:</b> <span id="pendiente"></span></p>
                <button id="descargarPdfBtn" class="crud-buttons guardar-btn" style="margin-top:8px;">Descargar PDF</button>
                <hr>
                <h3>Registrar nuevo pago</h3>
                <form id="formAgregarPago" style="display: flex; gap:8px; flex-wrap:wrap; align-items: flex-end;">
                    <label>Monto:<br> <input type="number" step="0.01" name="cantidad" required style="width:120px"></label>
                    <label>Método de pago:<br>
                        <select name="metodo_pago" required style="width:150px">
                            <option value="">Selecciona...</option>
                            <option value="Contado">Contado</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </label>
                    <label>Fecha:<br> <input type="date" name="fecha_pago" required style="width:140px"></label>
                    <button type="submit" class="crud-buttons agregar-btn" style="width:140px;">Agregar pago</button>
                </form>
                <p id="pagoMensaje" style="color: green;"></p>
            `;
            panel.innerHTML = html;

            // Cargar líneas
            const lineasTbody = panel.querySelector("#lineasFactura");
            lineasTbody.innerHTML = "";
            data.lineas.forEach(l => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${l.titulo} (${l.id_producto})</td>
                    <td>${l.cantidad}</td>
                    <td>${parseFloat(l.precio_unitario).toFixed(2)}</td>
                    <td>${(l.cantidad * l.precio_unitario).toFixed(2)}</td>
                `;
                lineasTbody.appendChild(tr);
            });

            // Cargar pagos y calcular totales
            cargarPagos(id_cabfac, parseFloat(cab.total), panel);

            // Descargar PDF
            panel.querySelector("#descargarPdfBtn").addEventListener("click", () => {
                window.open(`/api/facturas/${id_cabfac}/pdf`, "_blank");
            });

            // Formulario de pago
            panel.querySelector("#formAgregarPago").addEventListener("submit", function(e) {
                e.preventDefault();
                const form = e.target;
                const datos = {
                    cantidad: form.cantidad.value,
                    metodo_pago: form.metodo_pago.value,
                    fecha_pago: form.fecha_pago.value
                };
                fetch(`/api/facturas/${id_cabfac}/pagos`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(datos)
                })
                .then(r => r.json())
                .then(resp => {
                    const pagoMsg = panel.querySelector("#pagoMensaje");
                    if(resp.error){
                        pagoMsg.style.color = "red";
                        pagoMsg.textContent = resp.error;
                    }else{
                        pagoMsg.style.color = "green";
                        pagoMsg.textContent = "Pago agregado correctamente";
                        form.reset();
                        // Vuelve a cargar cabecera y pagos
                        fetch(`/api/facturas/${id_cabfac}`)
                            .then(r => r.json())
                            .then(data => {
                                if (data.cabecera) {
                                    cargarPagos(id_cabfac, parseFloat(data.cabecera.total), panel);
                                }
                            });
                    }
                });
            });
        });
}

function cargarPagos(id_cabfac, totalFactura, panel) {
    fetch(`/api/facturas/${id_cabfac}/pagos`)
        .then(r => r.json())
        .then(data => {
            const pagosTbody = panel.querySelector("#pagosFactura");
            let totalPagado = 0;
            pagosTbody.innerHTML = "";
            if (data.pagos) {
                data.pagos.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${formatFecha(p.fecha_pago)}</td>
                        <td>${p.metodo_pago}</td>
                        <td>${parseFloat(p.cantidad).toFixed(2)}</td>
                    `;
                    totalPagado += parseFloat(p.cantidad);
                    pagosTbody.appendChild(tr);
                });
            }
            panel.querySelector("#totalPagado").textContent = totalPagado.toFixed(2);
            panel.querySelector("#pendiente").textContent = (totalFactura - totalPagado).toFixed(2);
        });
}

// --- Filtro ---
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("filtroNIF").addEventListener("input", function() {
        renderFacturasLista(this.value);
    });
    cargarFacturas();
});