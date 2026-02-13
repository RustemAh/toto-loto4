const SHEET_ID = "ID_DE_TU_PLANILLA_LOTO4";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const contenedor = document.getElementById("resultados");
const selectSorteo = document.getElementById("selectSorteo");
const bannerMonto = document.getElementById("bannerMonto");
let ALL_DATA = [];

fetch(URL)
  .then(r => r.text())
  .then(text => {
    const json = JSON.parse(text.match(/setResponse\(([\s\S]*?)\);?\s*$/)[1]);
    const colMap = {};
    json.table.cols.forEach((c, i) => { if(c.label) colMap[c.label.toLowerCase()] = i; });

    ALL_DATA = json.table.rows.map(row => {
        const get = col => row.c?.[colMap[col]]?.v ?? "";
        return {
            sorteo: get("sorteo").toString(),
            fecha: get("fecha"),
            monto: Number(get("monto")) || 0,
            nums: get("resultado").toString().match(/\d+/g) || []
        };
    }).sort((a, b) => Number(b.sorteo) - Number(a.sorteo));

    cargarSelectores(ALL_DATA);
    if(ALL_DATA.length > 0) {
        selectSorteo.value = ALL_DATA[0].sorteo;
        aplicarFiltros();
    }
  });

function aplicarFiltros() {
    const s = ALL_DATA.find(x => x.sorteo === selectSorteo.value);
    if (!s) return;
    
    // Formateo de monto en millones para el banner
    const millones = s.monto >= 1000000 ? Math.floor(s.monto / 1000000) : s.monto;
    bannerMonto.innerText = `$${millones.toLocaleString("es-CL")}`;
    
    let html = `
        <div class="card loto4-card">
            <div class="card-header">
                <h2>Loto 4 - Sorteo ${s.sorteo}</h2>
                <span class="fecha-label">${s.fecha}</span>
            </div>
            <div class="bolas-container">
                ${s.nums.map(n => `<div class="bola polla">${n}</div>`).join("")}
            </div>
        </div>`;
    
    contenedor.innerHTML = html;
}

function cargarSelectores(data) {
    selectSorteo.innerHTML = data.map(x => `<option value="${x.sorteo}">Sorteo ${x.sorteo}</option>`).join("");
}

selectSorteo.addEventListener("change", aplicarFiltros);
