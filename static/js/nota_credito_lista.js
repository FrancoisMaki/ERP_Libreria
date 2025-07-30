let notasCreditoAll = [];
let notaCreditoSeleccionada = null;

function formatFecha(fechaStr) {
    if (!fechaStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;
    const d = new Date(fechaStr);
    if (isNaN(d)) return fechaStr;
    return d.toISOString().slice(0, 10);
}

function renderNotasCreditoLista(filtrarNIF) {
    const ul = document.getElementById("listaNotasCredito");
    ul.innerHTML = "";
    let mostrar = notasCreditoAll;
    if (filtrarNIF && filtrarNIF.trim() !== "") {
        mostrar = notasCreditoAll.filter(nc => nc.cliente_nif && nc.cliente_nif.toLowerCase().includes(filtrarNIF.toLowerCase()));
    }
    if (mostrar.length === 0) {
        ul.innerHTML = "<li style='color:#999;'>No hay notas de crédito...</li>";
        return;
    }
    mostrar.forEach(nc => {
        const li = document.createElement("li");
        li.className = (notaCreditoSeleccionada && nc.id_nota_credito === notaCreditoSeleccionada) ? "selected" : "";
        li.innerHTML = `
            <span class="factura-lista-main">#${nc.id_nota_credito} ${nc.cliente_nombre} <span style="color:#777;">(${nc.cliente_nif})</span></span>
            <span class="factura-lista-fecha">${formatFecha(nc.fecha)}</span>
            <span class="factura-lista-sec">Factura origen: #${nc.id_cabfac}</span>
        `;
        li.onclick = () => {
            notaCreditoSeleccionada = nc.id_nota_credito;
            renderNotasCreditoLista(document.getElementById("filtroNIF").value);
            cargarDetalleNotaCredito(nc.id_nota_credito);
        };
        ul.appendChild(li);
    });
}

function cargarNotasCredito() {
    fetch("/api/notas_credito/?por_pagina=1000")
        .then(r => r.json())
        .then(data => {
            notasCreditoAll = (data.notas_credito || []);
            renderNotasCreditoLista("");
        });
}

function cargarDetalleNotaCredito(id_nota_credito) {
    const panel = document.getElementById("detalleNotaCreditoPanel");
    panel.innerHTML = "<div style='text-align:center;color:#888;margin-top:40px;'>Cargando...</div>";
    fetch(`/api/notas_credito/${id_nota_credito}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                panel.innerHTML = `<div style="color:red;">${data.error}</div>`;
                return;
            }
            const cab = data.cabecera;
            let html = `
                <div class="factura-cabecera-imprimir">
                    <h2 style="margin-bottom: 0; font-size: 1.5em;">Visualizar Nota de Crédito</h2>
                    <span id="notaCreditoId" style="display:none">${cab.id_nota_credito}</span>
                    <div id="cabeceraNotaCredito" style="margin-bottom: 20px;">
                        <p><b>Cliente:</b> <span id="clienteNombre">${cab.cliente_nombre}</span></p>
                        <p><b>Factura original:</b> #${cab.id_cabfac}</p>
                        <p><b>Fecha:</b> <span id="fecha">${formatFecha(cab.fecha)}</span></p>
                        <p><b>Moneda:</b> <span id="moneda">${cab.moneda}</span></p>
                        <p><b>Total:</b> <span id="total">${parseFloat(cab.total).toFixed(2)}</span></p>
                        <p><b>Motivo:</b> <span id="motivo">${cab.motivo || ""}</span></p>
                    </div>
                </div>
                <h3>Líneas de la nota de crédito</h3>
                <table class="tabla-paises tabla-factura">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody id="lineasNotaCredito"></tbody>
                </table>
                <button id="imprimirNotaCreditoBtn" class="crud-buttons guardar-btn" style="margin-top:8px;">Imprimir nota de crédito</button>
            `;
            panel.innerHTML = html;

            // Cargar líneas
            const lineasTbody = panel.querySelector("#lineasNotaCredito");
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

            // Imprimir
            panel.querySelector("#imprimirNotaCreditoBtn").addEventListener("click", () => {
                imprimirNotaCredito(panel, cab);
            });
        });
}

// Impresión profesional de Nota de Crédito
function imprimirNotaCredito(panel, cabecera) {
    const logoUrl = window.location.origin + "/static/img/entre_lineas_logo_normal_v2.webp";
    const empresaNombre = "Entre Líneas";
    const empresaDireccion = "Calle de la Lectura 123, Ciudad, País";
    const empresaTelefono = "+34 600 123 456";
    const empresaEmail = "info@entrelineas.com";

    const cliente = cabecera.cliente_nombre || "";
    const clienteNif = cabecera.cliente_nif || "";
    const fecha = formatFecha(cabecera.fecha);
    const numNota = cabecera.id_nota_credito;
    const numFactura = cabecera.id_cabfac;
    const moneda = cabecera.moneda;
    const total = parseFloat(cabecera.total).toFixed(2);
    const motivo = cabecera.motivo || "";

    // Tablas HTML
    const lineasHtml = panel.querySelector(".tabla-factura").outerHTML;

    // HTML formal
    const contenido = `
        <div style="margin-bottom:32px;display:flex;align-items:center;gap:26px;">
            <div>
                <img src="${logoUrl}" style="max-height:80px;max-width:230px;">
            </div>
            <div style="font-size:1.09em;">
                <b>${empresaNombre}</b><br>
                <span>${empresaDireccion}</span><br>
                <span>Tel: ${empresaTelefono}</span><br>
                <span>${empresaEmail}</span>
            </div>
            <div style="flex:1"></div>
            <div style="text-align:right;">
                <div style="font-size:1.45em;font-weight:bold;letter-spacing:2px;">NOTA DE CRÉDITO</div>
                <div><b>Número:</b> #${numNota}</div>
                <div><b>Fecha:</b> ${fecha}</div>
                <div><b>Factura origen:</b> #${numFactura}</div>
            </div>
        </div>
        <div style="margin-bottom:16px;font-size:1.12em;">
            <b>Cliente:</b> ${cliente} ${clienteNif ? `(${clienteNif})` : ""}<br>
            <b>Moneda:</b> ${moneda}<br>
            <b>Total:</b> ${total} ${moneda}
        </div>
        <h3 style="margin-top:28px;">Líneas de la nota de crédito</h3>
        ${lineasHtml}
        <div style="margin:26px 0 0 0;">
            <b>Motivo:</b> ${motivo}
        </div>
        <div style="margin-top:40px;font-size:0.99em;color:#444;text-align:right;">Gracias por su confianza.</div>
    `;

    const ventana = window.open('', '', 'height=900,width=900');
    ventana.document.write('<html><head><title>Nota de crédito</title>');
    ventana.document.write(`
        <style>
            body { font-family:Arial,sans-serif; margin: 35px; background: #fff; color:#222;}
            table { width:100%; border-collapse:collapse; margin-bottom: 20px;}
            th, td { border:1px solid #bbb; padding:8px; text-align:left; }
            th { background: #f5f5fa; }
            h3 { margin-top:28px; margin-bottom:10px;}
            img { max-width:230px; }
            #imprimirNotaCreditoBtn, .crud-buttons.agregar-btn, form, hr { display:none !important; }
            @page { margin: 35px; }
        </style>
    `);
    ventana.document.write('</head><body>');
    ventana.document.write(contenido);
    ventana.document.write('</body></html>');
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 500);
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("filtroNIF").addEventListener("input", function() {
        renderNotasCreditoLista(this.value);
    });
    cargarNotasCredito();
});