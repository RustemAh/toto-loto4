const SHEET_ID = "ID_DE_TU_PLANILLA_TOTO3";
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
            monto: get("monto") || 0,
            juegos: [
                { nombre: "Sorteo Día", nums: parseNums(get("dia")) },
                { nombre: "Sorteo Tarde", nums: parseNums(get("tarde")) },
                { nombre: "Sorteo Noche", nums: parseNums(get("noche")) }
            ].filter(j => j.nums.length > 0)
        };
    }).sort((a, b) => Number(b.sorteo) - Number(a.sorteo));

    cargarSelectores(ALL_DATA);
    if(ALL_DATA.length > 0) {
        selectSorteo.value = ALL_DATA[0].sorteo;
        aplicarFiltros();
    }
  });

function parseNums(v) { return v ? v.toString().match(/\d+/g) : []; }

function aplicarFiltros() {
    const s = ALL_DATA.find(x => x.sorteo === selectSorteo.value);
    if (!s) return;
    bannerMonto.innerText = `$${s.monto.toLocaleString("es-CL")}`;
    let html = `<div class="card"><h2>Toto 3 - Sorteo ${s.sorteo}</h2><small>${s.fecha}</small>`;
    s.juegos.forEach(j => {
        html += `<h3>${j.nombre}</h3><div class="bolas">`;
        j.nums.forEach(n => html += `<div class="bola">${n}</div>`);
        html += `</div>`;
    });
    contenedor.innerHTML = html + `</div>`;
}

function cargarSelectores(data) {
    selectSorteo.innerHTML = data.map(x => `<option value="${x.sorteo}">Sorteo ${x.sorteo}</option>`).join("");
}

selectSorteo.addEventListener("change", aplicarFiltros);
