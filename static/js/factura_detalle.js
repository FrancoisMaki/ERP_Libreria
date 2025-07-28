document.addEventListener("DOMContentLoaded", () => {
    // Obtén el id de factura desde la URL
    const id_cabfac = window.location.pathname.split("/").pop();

    // Cargar cabecera y líneas
    fetch(`/api/facturas/${id_cabfac}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            const cab = data.cabecera;
            document.getElementById("facturaId").textContent = cab.id_cabfac;
            document.getElementById("clienteNombre").textContent = `${cab.cliente_nombre} (#${cab.id_cliente})`;
            document.getElementById("fecha").textContent = cab.fecha;
            document.getElementById("moneda").textContent = cab.moneda;
            document.getElementById("total").textContent = cab.total.toFixed(2);

            // Líneas
            const lineasTbody = document.getElementById("lineasFactura");
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
        });

    // Cargar pagos
    fetch(`/api/facturas/${id_cabfac}/pagos`)
        .then(r => r.json())
        .then(data => {
            const pagosTbody = document.getElementById("pagosFactura");
            let totalPagado = 0;
            if (data.pagos) {
                data.pagos.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${p.fecha_pago}</td>
                        <td>${p.metodo_pago}</td>
                        <td>${parseFloat(p.cantidad).toFixed(2)}</td>
                    `;
                    totalPagado += parseFloat(p.cantidad);
                    pagosTbody.appendChild(tr);
                });
            }
            document.getElementById("totalPagado").textContent = totalPagado.toFixed(2);

            // Obtener total de la factura para pendiente
            fetch(`/api/facturas/${id_cabfac}`)
                .then(r => r.json())
                .then(data2 => {
                    const totalFactura = data2.cabecera.total;
                    document.getElementById("pendiente").textContent = (totalFactura - totalPagado).toFixed(2);
                });
        });

    // Descargar PDF
    document.getElementById("descargarPdfBtn").addEventListener("click", () => {
        window.open(`/api/facturas/${id_cabfac}/pdf`, "_blank");
    });

    function cargarPagos(id_cabfac) {
        fetch(`/api/facturas/${id_cabfac}/pagos`)
            .then(r => r.json())
            .then(data => {
                const pagosTbody = document.getElementById("pagosFactura");
                let totalPagado = 0;
                pagosTbody.innerHTML = "";
                if (data.pagos) {
                    data.pagos.forEach(p => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${p.fecha_pago}</td>
                            <td>${p.metodo_pago}</td>
                            <td>${parseFloat(p.cantidad).toFixed(2)}</td>
                        `;
                        totalPagado += parseFloat(p.cantidad);
                        pagosTbody.appendChild(tr);
                    });
                }
                document.getElementById("totalPagado").textContent = totalPagado.toFixed(2);

                // Obtener total de la factura para pendiente
                fetch(`/api/facturas/${id_cabfac}`)
                    .then(r => r.json())
                    .then(data2 => {
                        const totalFactura = data2.cabecera.total;
                        document.getElementById("pendiente").textContent = (totalFactura - totalPagado).toFixed(2);
                    });
            });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const id_cabfac = window.location.pathname.split("/").pop();

        // ...código anterior para cargar factura...

        cargarPagos(id_cabfac);

        // Formulario de pago
        document.getElementById("formAgregarPago").addEventListener("submit", function(e) {
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
                if(resp.error){
                    document.getElementById("pagoMensaje").style.color = "red";
                    document.getElementById("pagoMensaje").textContent = resp.error;
                }else{
                    document.getElementById("pagoMensaje").style.color = "green";
                    document.getElementById("pagoMensaje").textContent = "Pago agregado correctamente";
                    form.reset();
                    cargarPagos(id_cabfac);
                }
            });
        });
    });

});