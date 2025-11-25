
const URL_PROVINCIAS = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/";
const URL_MUNICIPIOS = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/";
const URL_GASOLINERAS_PROVINCIA = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/";
const URL_GASOLINERAS_MUNICIPIO = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/";



const selectProvincia = document.getElementById("provincia");
const selectMuni = document.getElementById("municipio");
const selectCombustible = document.getElementById("combustible");
const inputAbiertas = document.getElementById("soloAbiertas");
const btnBuscar = document.getElementById("buscar");
const containerResultados = document.getElementById("resultados");


const MAPA_COMBUSTIBLE = {
    GasoleoA: "Precio Gasoleo A",
    Gasolina95E5: "Precio Gasolina 95 E5",
    Gasolina98E5: "Precio Gasolina 98 E5"
};


// Cargar provincias al iniciar
async function cargarProvincias() {
    try {
        const respuesta = await fetch(URL_PROVINCIAS);
        const datos = await respuesta.json();
        console.log(datos);


        datos.forEach(provincia => {
            const opcion = document.createElement("option");
            opcion.value = provincia.IDPovincia;
            opcion.textContent = provincia.Provincia;
            selectProvincia.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al cargar provincias:", error);
    }
}


async function cargarMunicipios(idProvincia) {
    selectMuni.innerHTML = '<option value="">Seleccione Municipio</option>';
    selectMuni.disabled = true;
    if (!idProvincia) return;
    try {
        const respuesta = await fetch(`${URL_MUNICIPIOS}${idProvincia}`);
        const datos = await respuesta.json();
        console.log(datos);

        datos.forEach(municipio => {
            const opcion = document.createElement("option");
            opcion.value = municipio.IDMunicipio;
            opcion.textContent = municipio.Municipio;
            selectMuni.appendChild(opcion);
        });
        selectMuni.disabled = false;
    } catch (error) {
        console.error("Error al cargar municipios:", error);
    }
}


async function buscarGasolinera() {
    const idProvincia = selectProvincia.value;
    const idMunicipio = selectMuni.value;
    const tipoCombustible = selectCombustible.value;
    const soloAbiertasG = inputAbiertas.checked;

    if (!idProvincia) {
        alert("Seleccione una Provincia");
        return;
    }

    const url = idMunicipio
        ? `${URL_GASOLINERAS_MUNICIPIO}${idMunicipio}`
        : `${URL_GASOLINERAS_PROVINCIA}${idProvincia}`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();


        const gasolinerasFiltradas = datos.ListaEESSPrecio.filter(gasolinera => {
            if (!soloAbiertasG) return true; // aceptamos todas
            const horario = (gasolinera.Horario || "").toLowerCase();
            // Consideramos abiertas si contienen "24h" o "abierto"
            return horario.includes("24h") || horario.includes("abierto");
        });
        mostrarResultados(gasolinerasFiltradas, tipoCombustible);

    } catch (error) {
        console.error("Error al buscar gasolineras:", error);
        containerResultados.textContent = "Error al buscar gasolineras. Intente nuevamente.";
    }
}

function mostrarResultados(lista, tipoCombustible) {
    containerResultados.innerHTML = "";

    if (lista.length === 0) {
        containerResultados.textContent = "No se encontraron gasolineras con esos filtros.";
        return;
    }

    lista.forEach(gasolinera => {
        const divResultados = document.createElement("div");
        divResultados.className = "gasolinera";

        // Obtenemos el precio ya formateado
        const precioCombustible = obtenerPrecio(gasolinera, tipoCombustible);

        divResultados.innerHTML = `
            <h3>${gasolinera["Rótulo"]}</h3>
            <p><strong>Dirección:</strong> ${gasolinera["Dirección"]}</p>
            <p><strong>Localidad:</strong> ${gasolinera.Localidad}</p>
            <p><strong>Provincia:</strong> ${gasolinera.Provincia}</p>
            <p><strong>Horario:</strong> ${gasolinera.Horario}</p>
            ${tipoCombustible ? `<p class="precio"><strong>Precio ${tipoCombustible}:</strong> ${precioCombustible}</p>` : ""}
        `;

        containerResultados.appendChild(divResultados);
    });
}


/**
 * Devuelve el precio formateado de un tipo de combustible para una gasolinera.
 * 
 * - Si no se selecciona combustible, devuelve "N/D".
 * - Busca el campo correcto en el objeto de la gasolinera usando MAPA_COMBUSTIBLE.
 * - Valida que el valor no sea vacío, "0" ni "N/D".
 * - Convierte el valor a número (acepta comas decimales), lo formatea con dos decimales
 *   y añade el sufijo "€/L".
 * - Si no hay valor válido, devuelve "N/D".
 */
function obtenerPrecio(gasolinera, tipoCombustible) {
    if (!tipoCombustible) return "N/D";

    const campo = MAPA_COMBUSTIBLE[tipoCombustible];
    const valor = gasolinera[campo];

    if (valor && valor !== "0" && valor !== "N/D") {
        const numero = parseFloat(valor.replace(",", "."));
        if (!isNaN(numero)) {
            return numero.toFixed(2) + " €/L";
        }
    }
    return "N/D";
}



document.addEventListener("DOMContentLoaded", () => {
    cargarProvincias();
    selectProvincia.addEventListener("change", (e) => {
        cargarMunicipios(e.target.value);
    });
    btnBuscar.addEventListener("click", () => {
        buscarGasolinera();
    });
});