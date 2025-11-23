
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


document.addEventListener("DOMContentLoaded", () => {
    cargarProvincias();
    selectProvincia.addEventListener("change", (e) => {
        cargarMunicipios(e.target.value);
    });
});