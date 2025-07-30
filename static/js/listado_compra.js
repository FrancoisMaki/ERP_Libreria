document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/compras/")
    .then(r => r.json())
    .then(data => {
      let html = "";
      (data.compras || []).forEach(c => {
        html += `<tr>
          <td>${c.id_cabcompra}</td>
          <td>${c.fecha}</td>
          <td>${c.proveedor}</td>
          <td>${c.total}</td>
          <td>${c.moneda}</td>
          <td><a href="/compras/${c.id_cabcompra}" class="crud-buttons">Ver</a></td>
        </tr>`;
      });
      document.getElementById("tbodyCompras").innerHTML = html;
    });
});