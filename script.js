// Lista de jugadores
const jugadores = ["Bb", "Agus", "Valen", "Pancho", "Toto", "Villa", "Facu"];

let historial = JSON.parse(localStorage.getItem("historial")) || [];
let ganancias = JSON.parse(localStorage.getItem("ganancias")) || {};

let indiceEditando = null;

// Cargar jugadores en selects
function cargarJugadores() {
    const selects = ["ganador", "segundo", "tercero", "editGanador", "editSegundo", "editTercero"];

    selects.forEach(id => {
        let sel = document.getElementById(id);
        sel.innerHTML = "";

        if (id.includes("tercero")) {
            sel.innerHTML = `<option value="">-</option>`;
        }

        jugadores.forEach(j => {
            let op = document.createElement("option");
            op.value = j;
            op.textContent = j;
            sel.appendChild(op);
        });
    });
}

cargarJugadores();
actualizarTablaHistorial();
actualizarTablaGanancias();
actualizarTablaPuestos();

// Guardar nueva partida
document.getElementById("partidaForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let ganador = document.getElementById("ganador").value;
    let segundo = document.getElementById("segundo").value;
    let tercero = document.getElementById("tercero").value || "-";
    let pozo = parseInt(document.getElementById("pozo").value);
    let fecha = document.getElementById("fecha").value;

    let premioGanador = pozo * 0.75;
    let premioSegundo = pozo * 0.25;

    ganancias[ganador] = (ganancias[ganador] || 0) + premioGanador;
    ganancias[segundo] = (ganancias[segundo] || 0) + premioSegundo;

    historial.push({ fecha, ganador, segundo, tercero, pozo });

    localStorage.setItem("historial", JSON.stringify(historial));
    localStorage.setItem("ganancias", JSON.stringify(ganancias));

    actualizarTablaHistorial();
    actualizarTablaGanancias();
    actualizarTablaPuestos();

    this.reset();
});

// Mostrar historial
function actualizarTablaHistorial() {
    let tbody = document.querySelector("#tablaHistorial tbody");
    tbody.innerHTML = "";

    historial.forEach((p, i) => {
        let row = `
            <tr>
                <td>${p.fecha}</td>
                <td>${p.ganador}</td>
                <td>${p.segundo}</td>
                <td>${p.tercero}</td>
                <td>$${p.pozo.toLocaleString("es-AR")}</td>
                <td>
                    <button class="btn-accion editar" onclick="editarPartida(${i})">Editar</button>
                    <button class="btn-accion eliminar" onclick="eliminarPartida(${i})">Eliminar</button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

// Mostrar ganancias
function actualizarTablaGanancias() {
    let tbody = document.querySelector("#tablaGanancias tbody");
    tbody.innerHTML = "";

    Object.entries(ganancias)
        .sort((a, b) => b[1] - a[1])
        .forEach(([j, total]) => {
            tbody.innerHTML += `
                <tr>
                    <td>${j}</td>
                    <td>$${total.toLocaleString("es-AR")}</td>
                </tr>`;
        });
}

// Ranking puestos
function actualizarTablaPuestos() {
    let puestos = {};

    jugadores.forEach(j => {
        puestos[j] = { primero: 0, segundo: 0, tercero: 0 };
    });

    historial.forEach(p => {
        puestos[p.ganador].primero++;
        puestos[p.segundo].segundo++;
        if (p.tercero !== "-") puestos[p.tercero].tercero++;
    });

    let tbody = document.querySelector("#tablaPuestos tbody");
    tbody.innerHTML = "";

    jugadores.forEach(j => {
        tbody.innerHTML += `
            <tr>
                <td>${j}</td>
                <td>${puestos[j].primero}</td>
                <td>${puestos[j].segundo}</td>
                <td>${puestos[j].tercero}</td>
            </tr>`;
    });
}

// Eliminar partida
function eliminarPartida(i) {
    if (!confirm("¿Eliminar esta partida?")) return;

    historial.splice(i, 1);

    localStorage.setItem("historial", JSON.stringify(historial));

    recalcularGanancias();
    actualizarTablaHistorial();
    actualizarTablaGanancias();
    actualizarTablaPuestos();
}

// Recalcular ganancias
function recalcularGanancias() {
    ganancias = {};
    historial.forEach(p => {
        ganancias[p.ganador] = (ganancias[p.ganador] || 0) + p.pozo * 0.75;
        ganancias[p.segundo] = (ganancias[p.segundo] || 0) + p.pozo * 0.25;
    });
    localStorage.setItem("ganancias", JSON.stringify(ganancias));
}

// EDITAR PARTIDA
function editarPartida(i) {
    indiceEditando = i;
    let p = historial[i];

    document.getElementById("editGanador").value = p.ganador;
    document.getElementById("editSegundo").value = p.segundo;
    document.getElementById("editTercero").value = p.tercero;
    document.getElementById("editPozo").value = p.pozo;
    document.getElementById("editFecha").value = p.fecha;

    document.getElementById("modalEditar").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalEditar").style.display = "none";
}

function guardarEdicion() {
    let p = historial[indiceEditando];

    p.ganador = document.getElementById("editGanador").value;
    p.segundo = document.getElementById("editSegundo").value;
    p.tercero = document.getElementById("editTercero").value;
    p.pozo = parseInt(document.getElementById("editPozo").value);
    p.fecha = document.getElementById("editFecha").value;

    localStorage.setItem("historial", JSON.stringify(historial));

    recalcularGanancias();

    actualizarTablaHistorial();
    actualizarTablaGanancias();
    actualizarTablaPuestos();

    cerrarModal();
}
