function fetchAlmacenes() {
  fetch('/api/almacen/')
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('#tablaAlmacenes tbody');
      tbody.innerHTML = '';
      data.almacenes.forEach(a => {
        let row = `<tr>
          <td>${a.id_almacen}</td>
          <td>${a.nombre}</td>
          <td>${a.direccion || ''}</td>
          <td>${a.poblacion || ''}</td>
          <td>
            <button onclick="editarAlmacen(${a.id_almacen}, '${a.nombre}', '${a.direccion || ''}', '${a.poblacion || ''}')">Editar</button>
            <button onclick="borrarAlmacen(${a.id_almacen})">Borrar</button>
          </td>
        </tr>`;
        tbody.innerHTML += row;
      });
    });
}

function editarAlmacen(id, nombre, direccion, poblacion) {
  document.getElementById('almacenId').value = id;
  document.getElementById('nombreAlmacen').value = nombre;
  document.getElementById('direccionAlmacen').value = direccion;
  document.getElementById('poblacionAlmacen').value = poblacion;
  document.getElementById('almacenFormTitle').textContent = 'Editar Almacén';
  document.getElementById('cancelarAlmacen').style.display = '';
}

function borrarAlmacen(id) {
  if (!confirm('¿Seguro que deseas borrar este almacén?')) return;
  fetch('/api/almacen/' + id, { method: 'DELETE' })
    .then(r => r.json())
    .then(() => fetchAlmacenes());
}

document.getElementById('almacenForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const id = document.getElementById('almacenId').value;
  const nombre = document.getElementById('nombreAlmacen').value;
  const direccion = document.getElementById('direccionAlmacen').value;
  const poblacion = document.getElementById('poblacionAlmacen').value;
  const body = JSON.stringify({ nombre, direccion, poblacionid: null });
  let url = '/api/almacen/';
  let method = 'POST';
  if (id) {
    url += id;
    method = 'PUT';
  }
  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: body
  })
    .then(r => r.json())
    .then(() => {
      fetchAlmacenes();
      this.reset();
      document.getElementById('almacenId').value = '';
      document.getElementById('almacenFormTitle').textContent = 'Nuevo Almacén';
      document.getElementById('cancelarAlmacen').style.display = 'none';
    });
});
document.getElementById('cancelarAlmacen').addEventListener('click', function() {
  document.getElementById('almacenForm').reset();
  document.getElementById('almacenId').value = '';
  document.getElementById('almacenFormTitle').textContent = 'Nuevo Almacén';
  this.style.display = 'none';
});

function fetchMovimientos() {
  fetch('/api/almacen/movimientos')
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('#tablaMovimientos tbody');
      tbody.innerHTML = '';
      data.movimientos.forEach(m => {
        let row = `<tr>
          <td>${m.id_movimiento}</td>
          <td>${m.fecha}</td>
          <td>${m.tipo}</td>
          <td>${m.cantidad}</td>
          <td>${m.producto} (${m.id_producto})</td>
          <td>${m.almacen}</td>
        </tr>`;
        tbody.innerHTML += row;
      });
    });
}

document.getElementById('movimientoForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const id_producto = document.getElementById('movimientoProducto').value;
  const id_almacen = document.getElementById('movimientoAlmacen').value;
  const cantidad = document.getElementById('movimientoCantidad').value;
  const tipo = document.getElementById('movimientoTipo').value;
  const fecha = document.getElementById('movimientoFecha').value;
  fetch('/api/almacen/movimientos', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_producto, id_almacen, cantidad, tipo, fecha })
  })
    .then(r => r.json())
    .then(() => {
      fetchMovimientos();
      fetchStock();
      this.reset();
    });
});

function fetchStock() {
  fetch('/api/almacen/stock')
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('#tablaStock tbody');
      tbody.innerHTML = '';
      data.stock.forEach(s => {
        let row = `<tr>
          <td>${s.titulo}</td>
          <td>${s.id_producto}</td>
          <td>${s.almacen}</td>
          <td>${s.stock}</td>
        </tr>`;
        tbody.innerHTML += row;
      });
    });
}
document.getElementById('refreshStock').addEventListener('click', fetchStock);

document.addEventListener('DOMContentLoaded', function() {
  fetchAlmacenes();
  fetchMovimientos();
  fetchStock();
});

function toggleSeccion(id) {
  const secciones = [
    'almacenFormSection',
    'tablaAlmacenesSection',
    'movimientoFormSection',
    'tablaMovimientosSection',
    'tablaStockSection'
  ];
  secciones.forEach(s => {
    document.getElementById(s).style.display = (s === id && document.getElementById(s).style.display === 'none') ? '' : 'none';
  });
}
// Opcional: muestra la lista de almacenes al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  toggleSeccion('tablaAlmacenesSection');
});