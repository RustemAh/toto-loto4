const SHEET_ID = "TU_ID_DE_GOOGLE_SHEETS";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const contenedor = document.getElementById("resultados");
const selectSorteo = document.getElementById("selectSorteo");
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

function parseNums(v) { 
    if(!v) return [];
    // Acepta números seguidos (812) o separados (8-1-2)
    return v.toString().replace(/-/g, "").split(""); 
}

function aplicarFiltros() {
    const s = ALL_DATA.find(x => x.sorteo === selectSorteo.value);
    if (!s) return;
    
    let html = `
        <div class="card toto3-card">
            <div class="card-header">
                <h2>Sorteo N° ${s.sorteo}</h2>
                <span class="fecha-label">${s.fecha}</span>
            </div>`;
    
    s.juegos.forEach(j => {
        html += `
            <div class="sorteo-bloque">
                <h3>${j.nombre}</h3>
                <div class="bolas">
                    ${j.nums.map(n => `<div class="bola">${n}</div>`).join("")}
                </div>
            </div>`;
    });
    
    contenedor.innerHTML = html + `</div>`;
}

function cargarSelectores(data) {
    selectSorteo.innerHTML = data.map(x => `<option value="${x.sorteo}">Sorteo ${x.sorteo}</option>`).join("");
}

selectSorteo.addEventListener("change", aplicarFiltros);
