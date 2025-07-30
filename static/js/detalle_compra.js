document.addEventListener("DOMContentLoaded", () => {
  const compraId = window.location.pathname.split("/").pop();
  fetch(`/api/compras/${compraId}`)
    .then(r => r.json())
    .then(compra => {
      if (compra.error) {
        document.getElementById("detalleCompra").innerHTML = "<p>No encontrada</p>";
        return;
      }
      let html = `
        <p><b>ID:</b> ${compra.id_cabcompra}</p>
        <p><b>Fecha:</b> ${compra.fecha}</p>
        <p><b>Proveedor:</b> ${compra.proveedor} (${compra.cif || ''})</p>
        <p><b>Email:</b> ${compra.email || ''}</p>
        <p><b>Teléfono:</b> ${compra.telefono || ''}</p>
        <p><b>Total:</b> ${compra.total} ${compra.moneda}</p>
        <h3>Detalle productos</h3>
        <table class="tabla-paises tabla-factura">
          <thead>
            <tr>
              <th>ISBN</th><th>Título</th><th>Cantidad</th><th>Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
      `;
      (compra.lineas || []).forEach(l => {
        html += `<tr>
          <td>${l.isbn}</td>
          <td>${l.titulo}</td>
          <td>${l.cantidad}</td>
          <td>${l.precio_unitario}</td>
        </tr>`;
      });
      html += "</tbody></table>";
      document.getElementById("detalleCompra").innerHTML = html;
    });
});