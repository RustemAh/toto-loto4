const SHEET_ID = "TU_NUEVO_SHEET_ID_AQUI"; // Reemplaza con el ID de la hoja de Toto3/Loto4
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Configuración de Identidad
const PARAMS = new URLSearchParams(window.location.search);
const JUEGO_ACTUAL = PARAMS.get('juego') || 'toto3'; // Por defecto Toto 3

const CONFIG = {
    toto3: { nombre: "Toto 3", badge: "Lotería", clase: "toto3", unidad: "Mil" },
    loto4: { nombre: "Loto 4", badge: "Polla", clase: "loto4", unidad: "Millones" }
};

const contenedor = document.getElementById("resultados");
const selectSorteo = document.getElementById("selectSorteo");
const selectFecha = document.getElementById("selectFecha");
const bannerMonto = document.getElementById("bannerMonto");
const badgeJuego = document.getElementById("badgeJuego");
const bodyJuego = document.getElementById("bodyJuego");

let ALL_DATA = [];

// Aplicar identidad visual al cargar
bodyJuego.classList.add(CONFIG[JUEGO_ACTUAL].clase);
badgeJuego.innerText = CONFIG[JUEGO_ACTUAL].badge;
document.getElementById("unidadMonto").innerText = CONFIG[JUEGO_ACTUAL].unidad;

fetch(URL)
  .then(r => r.text())
  .then(text => {
    const json = parseGviz(text);
    const colMap = {};
    json.table.cols.forEach((c, i) => { if(c.label) colMap[c.label.toLowerCase().trim()] = i; });

    ALL_DATA = json.table.rows.map(row => {
        const get = col => row.c?.[colMap[col]]?.v ?? "";
        return {
            sorteo: get("sorteo").toString(),
            fecha: formatearFecha(get("fecha")),
            monto: get("monto") || 0,
            // Soporta múltiples sorteos en Toto 3 (Día/Tarde/Noche)
            resultados: [
                { nombre: JUEGO_ACTUAL === 'toto3' ? "Sorteo Día" : "Números", nums: parseNums(get("r1")) },
                { nombre: "Sorteo Tarde", nums: parseNums(get("r2")) },
                { nombre: "Sorteo Noche", nums: parseNums(get("r3")) }
            ].filter(r => r.nums.length > 0)
        };
    }).sort((a, b) => Number(b.sorteo) - Number(a.sorteo));

    cargarSelectores(ALL_DATA);
    
    // Si viene sorteo por URL o embed
    const sParam = PARAMS.get("sorteo");
    if(sParam) {
        selectSorteo.value = sParam;
        aplicarFiltros();
    }
  });

function aplicarFiltros() {
    const item = ALL_DATA.find(x => x.sorteo === selectSorteo.value);
    if (item) {
        renderCard(item);
        bannerMonto.innerText = `$${item.monto.toLocaleString("es-CL")}`;
        actualizarEmbed(item.sorteo);
    }
}

function renderCard(s) {
    let html = `<div class="card"><h2>${CONFIG[JUEGO_ACTUAL].nombre} - Sorteo ${s.sorteo}</h2><small>${s.fecha}</small>`;
    s.resultados.forEach(res => {
        html += `<h3>${res.nombre}</h3><div class="bolas">`;
        res.nums.forEach(n => html += `<div class="bola">${n}</div>`);
        html += `</div>`;
    });
    html += `</div>`;
    contenedor.innerHTML = html;
}

// Reutiliza tus funciones de parseGviz, parseNums, formatearFecha y actualizarEmbed del código original...
function parseGviz(t){const m=t.match(/setResponse\(([\s\S]*?)\);?\s*$/); return JSON.parse(m[1]);}
function parseNums(v){return v ? v.toString().match(/\d+/g).map(Number) : [];}
function formatearFecha(f){ return f.toString().includes("Date") ? "Hoy" : f; } // Simplificado para el ejemplo

function cargarSelectores(data) {
    selectSorteo.innerHTML = `<option value="">Sorteo</option>` + data.map(x => `<option value="${x.sorteo}">${x.sorteo}</option>`).join("");
}

selectSorteo.addEventListener("change", aplicarFiltros);
