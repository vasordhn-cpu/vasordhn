
const PRODUCTOS_POR_PAGINA = 24;

let paginaActualCatalogo = 1;

function reiniciarPaginacionCatalogo() {
    paginaActualCatalogo = 1;
}

function obtenerProductosPaginados(productos) {
    const inicio = (paginaActualCatalogo - 1) * PRODUCTOS_POR_PAGINA;
    return productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
}

function crearControlesPaginacion(totalProductos) {
    const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);

    const controles = document.createElement('div');
    controles.className = 'controles-paginacion';

    if (totalPaginas <= 1) return controles;

    const anterior = document.createElement('button');
    anterior.textContent = 'Anterior';
    anterior.disabled = paginaActualCatalogo === 1;
    anterior.onclick = () => cambiarPaginaCatalogo(paginaActualCatalogo - 1);

    const informacion = document.createElement('span');
    informacion.textContent = `Página ${paginaActualCatalogo} de ${totalPaginas} · ${totalProductos} productos`;

    const siguiente = document.createElement('button');
    siguiente.textContent = 'Siguiente';
    siguiente.disabled = paginaActualCatalogo === totalPaginas;
    siguiente.onclick = () => cambiarPaginaCatalogo(paginaActualCatalogo + 1);

    controles.append(anterior, informacion, siguiente);

    return controles;
}


let datosActualesPaginacion = [];

function cambiarPaginaCatalogo(nuevaPagina) {
    const totalPaginas = Math.ceil(
        datosActualesPaginacion.length / PRODUCTOS_POR_PAGINA
    );

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    paginaActualCatalogo = nuevaPagina;
    renderizarPorCategorias(datosActualesPaginacion, true);
}
