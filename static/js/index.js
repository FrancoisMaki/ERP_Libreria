document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        sidebar.classList.toggle('contraido');
    });

     // Valores demo
  document.getElementById('compras-valor').textContent = '1.096';
  document.getElementById('ventas-valor').textContent = '2.258';

  // Pendiente para Compras (con eje X de meses)
  new Chart(document.getElementById('compras-grafico'), {
    type: 'line',
    data: {
      labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
      datasets: [{
        data: [4, 6, 5, 7, 5, 6, 5],
        borderColor: '#1aa2e3',
        backgroundColor: 'rgba(26,162,227,0.13)',
        tension: 0.45,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        y: { display: false, min: 0 },
        x: {
          display: true,
          grid: { display: false },
          ticks: { color: "#b0b0b0", font: { size: 13 } }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Pendiente para Ventas (con eje X de meses)
  new Chart(document.getElementById('ventas-grafico'), {
    type: 'line',
    data: {
      labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
      datasets: [{
        data: [7, 9, 5, 11, 6, 8, 10],
        borderColor: '#1aa2e3',
        backgroundColor: 'rgba(26,162,227,0.13)',
        tension: 0.45,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        y: { display: false, min: 0 },
        x: {
          display: true,
          grid: { display: false },
          ticks: { color: "#b0b0b0", font: { size: 13 } }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Barras: Facturas vs Notas de crédito (últimos 4 meses)
  const meses = ['Abril', 'Mayo', 'Junio', 'Julio'];
  const facturas = [12, 10, 16, 13];
  const notas = [2, 1, 3, 1];
  new Chart(document.getElementById('facturas-grafico'), {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { label: "Facturas", data: facturas, backgroundColor: '#4a90e2', borderRadius: 4, barThickness: 38 },
        { label: "Notas de Crédito", data: notas, backgroundColor: '#f5b041', borderRadius: 4, barThickness: 18 }
      ]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          grid: { display: false, drawBorder: false },
          ticks: { color: "#757575", font: { size: 15 } }
        },
        y: {
          stacked: false,
          grid: { color: "#e7e7e7", drawBorder: false },
          ticks: { display: false },
          beginAtZero: true
        }
      }
    }
  });

  // Leyenda personalizada
  const totalFacturas = facturas.reduce((a,b)=>a+b,0);
  const totalNotas = notas.reduce((a,b)=>a+b,0);
  document.getElementById('bar-chart-legend').innerHTML =
    `<div><span class="legend-box legend-facturas"></span> Facturas: <b>${totalFacturas}</b></div>
     <div><span class="legend-box legend-notas"></span> Notas de crédito: <b>${totalNotas}</b></div>`;

  // Rueda (doughnut) géneros
  new Chart(document.getElementById('stock-grafico'), {
    type: 'doughnut',
    data: {
      labels: ['Novela', 'Poesía', 'Infantil', 'Ciencia Ficción'],
      datasets: [{
        data: [45, 18, 10, 23],
        backgroundColor: ['#1abc9c','#9b59b6','#f1c40f','#e67e22']
      }]
    },
    options: {
      plugins: {legend: {position: 'bottom'}},
      responsive: true,
      maintainAspectRatio: false
    }
  });
});