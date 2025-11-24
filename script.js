
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


async function buscarGasolinera() {
    const idProvincia = selectProvincia.value;
    const idMunicipio = selectMuni.value;
    const tipoCombustible = selectCombustible.value;
    const soloAbiertasG = inputAbiertas.checked;

    if (!idProvincia) {
        alert("Seleccione una Provincia"); return;
    }

    const url = idMunicipio
        ? `${URL_GASOLINERAS_MUNICIPIO}${idMunicipio}`
        : `${URL_GASOLINERAS_PROVINCIA}${idProvincia}`;


    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        console.log(datos);

        const gasolinerasFiltradas = datos.ListaEESSPrecio.filter(gasolinera => {
            const tieneCombustible = tipoCombustible ? gasolinera[`Precio${tipoCombustible}`] !== undefined : true;
            const abierta = soloAbiertasG ? gasolinera.Horario.includes("Abierto") : true;
            return tieneCombustible && abierta;
        });
        mostraResultados(gasolinerasFiltradas, tipoCombustible);


    } catch (error) {
        console.error("Error al buscar gasolineras:", error);
        containerResultados.textContent = "Error al buscar gasolineras. Intente nuevamente.";
    }
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