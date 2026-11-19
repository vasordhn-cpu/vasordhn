

// ==========================================
// CACHÉ DE DATOS DE GOOGLE SHEETS
// ==========================================

const cacheDatosHojas = new Map();

// CACHÉ DE PRODUCTOS YA AGRUPADOS
const cacheProductosAgrupados = new Map();


// ==========================================
// CARGAR DATOS DE UNA HOJA
// ==========================================

let solicitudCatalogo = 0;

function esVisibleCatalogo(valor) {
    return String(valor ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() === 'si';
}

async function cargarDatos(nombreHoja) {
    const contenedor = document.getElementById('contenedor-principal');
    const claveHoja = String(nombreHoja).trim();

    const solicitud = ++solicitudCatalogo;

    const sigueActiva = () =>
        solicitud === solicitudCatalogo &&
        String(hojaActualGlobal).trim() === claveHoja;

    const parametros = new URLSearchParams(window.location.search);

    const esEnlace =
        (parametros.has('codigo') || parametros.has('descripcion')) &&
        String(parametros.get('seccion') || '')
            .trim()
            .toLowerCase() === claveHoja.toLowerCase();

    try {
        let productos;

        let desdeCache =
            !esEnlace && cacheDatosHojas.has(claveHoja);

        if (desdeCache) {
            productos = cacheDatosHojas.get(claveHoja);
        } else {
            contenedor.innerHTML =
                '<p style="text-align:center; color: #666; padding: 40px 0;">Cargando datos de ' +
                nombreHoja + '...</p>';

            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(nombreHoja)}`;

            const response = await fetch(
                url,
                esEnlace ? { cache: 'no-store' } : {}
            );

            if (!response.ok) {
                throw new Error('No se pudieron cargar los datos de Google Sheets.');
            }

            const text = await response.text();

            const inicio = text.indexOf('{');
            const fin = text.lastIndexOf('}');

            const json = JSON.parse(
                text.slice(inicio, fin + 1)
            );

            if (
                json.status === 'error' ||
                !Array.isArray(json.table?.rows)
            ) {
                throw new Error('Respuesta inválida de Google Sheets.');
            }

            const leer = (r, i) =>
                String(r.c?.[i]?.v ?? '');

            // FILTRAR PRODUCTOS SEGÚN COLUMNA MOSTRAR
            productos = json.table.rows
                .filter(r => esVisibleCatalogo(leer(r, 8)))
                .map(r => ({
                    codigo: leer(r, 0),
                    descripcion: leer(r, 1),
                    otros: leer(r, 2),
                    tipo: leer(r, 3).trim() || 'General',
                    medida: leer(r, 4),
                    precio: leer(r, 5),
                    imagen: leer(r, 6),
                    video: leer(r, 7).trim(),
                    mostrar: leer(r, 8)
                }));

            // EVITAR RESPUESTAS DE ÁREAS ANTERIORES
            if (!sigueActiva()) return;

            // GUARDAR DATOS VISIBLES EN MEMORIA
            cacheDatosHojas.set(claveHoja, productos);

            cacheProductosAgrupados.delete(claveHoja);
        }

        if (!sigueActiva()) return;

        if (claveHoja.toLowerCase() === 'servicios') {

            datosActualesPaginacion = [];

            reiniciarPaginacionCatalogo();

            renderizarComoListaServiciosAgrupados(productos);

        } else {

            const agrupados =
                cacheProductosAgrupados.get(claveHoja);

            if (agrupados) {

                reiniciarPaginacionCatalogo();

                renderizarPorCategorias(agrupados, true);

            } else {

                renderizarPorCategorias(productos);

            }

            if (esEnlace) {
                abrirProductoDesdeEnlace();
            }
        }

    } catch (error) {

        if (!sigueActiva()) return;

        console.error('Error al cargar los datos:', error);

        datosActualesPaginacion = [];

        contenedor.innerHTML =
            '<p style="text-align:center; color: red;">Error al cargar los datos de esta área.</p>';
    }
}


// ==========================================
// RENDERIZAR SERVICIOS AGRUPADOS
// ==========================================

function renderizarComoListaServiciosAgrupados(items) {
    const contenedorPrincipal =
        document.getElementById('contenedor-principal');

    contenedorPrincipal.innerHTML = '';

    let serviciosValidos = items.filter(
        item => item.codigo || item.descripcion
    );

    if (serviciosValidos.length === 0) {
        contenedorPrincipal.innerHTML =
            '<p style="text-align:center; color: #888; padding: 40px 0;">No hay servicios registrados en esta sección.</p>';

        return;
    }

    let gruposTipos = {};

    serviciosValidos.forEach(item => {
        let tipo =
            item.tipo && item.tipo !== ''
                ? item.tipo
                : 'General';

        if (!gruposTipos[tipo]) {
            gruposTipos[tipo] = [];
        }

        gruposTipos[tipo].push(item);
    });

    let tiposOrdenados =
        Object.keys(gruposTipos).sort(
            (a, b) => a.localeCompare(b)
        );

    tiposOrdenados.forEach(tipo => {
        let wrapper = document.createElement('div');

        wrapper.className = 'categoria-section';

        let tituloDiv = document.createElement('div');

        tituloDiv.className = 'categoria-titulo';

        tituloDiv.innerText = tipo;

        wrapper.appendChild(tituloDiv);

        let listaDiv = document.createElement('div');

        listaDiv.className = 'servicios-container';

        let headerRow = document.createElement('div');

        headerRow.className = 'servicios-header-row';

        headerRow.innerHTML = `
            <div class="servicios-header-col-desc">Descripción</div>
            <div class="servicios-header-col-medida">Medida</div>
            <div class="servicios-header-col-precio">Precio</div>
        `;

        listaDiv.appendChild(headerRow);

        let listaServiciosTipo = gruposTipos[tipo].sort((a, b) => {
            let descA = (a.descripcion || '').toLowerCase();
            let descB = (b.descripcion || '').toLowerCase();

            return descA.localeCompare(descB);
        });

        listaServiciosTipo.forEach(item => {
            let row = document.createElement('div');

            row.className = 'servicio-row';

            let infoExtra = item.otros
                ? `<div class="servicio-descripcion-extra">${item.otros}</div>`
                : '';

            let medidaText = item.medida
                ? `<span class="servicio-medida">${item.medida}</span>`
                : '<span class="servicio-medida">-</span>';

            let precioText = item.precio
                ? `<span class="servicio-precio">Lps. ${item.precio}</span>`
                : '<span class="servicio-precio">-</span>';

            row.innerHTML = `
                <div class="servicio-info-principal">
                    <div class="servicio-codigo-nombre">${item.codigo ? item.codigo + ': ' : ''}${item.descripcion}</div>
                    ${infoExtra}
                </div>

                <div class="servicio-detalles-precio">
                    ${medidaText}
                    ${precioText}
                </div>
            `;

            listaDiv.appendChild(row);
        });

        wrapper.appendChild(listaDiv);

        contenedorPrincipal.appendChild(wrapper);
    });
}


// ==========================================
// AGRUPAR PRODUCTOS
// ==========================================

function agruparProductos(items) {
    let productosGlobales = {};

    items.forEach(item => {

        if (!item.codigo && !item.descripcion) return;

        let key = `${item.codigo}_${item.descripcion}`;

        if (!productosGlobales[key]) {

            productosGlobales[key] = {
                codigo: item.codigo,
                descripcion: item.descripcion,
                otros: item.otros,
                tipo: item.tipo || 'General',
                imagen: item.imagen,
                video: item.video,
                filas: []
            };
        }

        // COMPLETAR MULTIMEDIA EXCLUSIVAMENTE
        // CON VARIACIONES VISIBLES DEL PRODUCTO

        const grupo = productosGlobales[key];

        if (
            !obtenerIdDrive(grupo.imagen) &&
            obtenerIdDrive(item.imagen)
        ) {
            grupo.imagen = item.imagen;
        }

        if (
            !obtenerIdDrive(grupo.video) &&
            obtenerIdDrive(item.video)
        ) {
            grupo.video = item.video;
        }

        grupo.filas.push(item);
    });

    return Object.values(productosGlobales);
}


// ==========================================
// RENDERIZAR PRODUCTOS POR CATEGORÍAS
// ==========================================

function renderizarPorCategorias(items, yaAgrupados = false) {

    const contenedorPrincipal =
        document.getElementById('contenedor-principal');

    contenedorPrincipal.innerHTML = '';

    let listaProductos = [];

    if (yaAgrupados) {

        listaProductos = items;

    } else {

        // AGRUPAR PRODUCTOS
        listaProductos = agruparProductos(items);

        // GUARDAR LOS PRODUCTOS AGRUPADOS EN CACHÉ
        if (hojaActualGlobal) {

            cacheProductosAgrupados.set(
                String(hojaActualGlobal).trim(),
                listaProductos
            );

        }

        reiniciarPaginacionCatalogo();
    }

    // MANTENER ACTUALIZADOS LOS DATOS DE PAGINACIÓN
    datosActualesPaginacion = listaProductos;

    // OBTENER SOLAMENTE LOS PRODUCTOS DE LA PÁGINA ACTUAL
    const productosPagina =
        obtenerProductosPaginados(listaProductos);

    let categoriasMap = {};

    productosPagina.forEach(prod => {

        let cat = prod.tipo || 'General';

        if (!categoriasMap[cat]) {

            categoriasMap[cat] = [];

        }

        categoriasMap[cat].push(prod);
    });

    if (productosPagina.length === 0) {

        contenedorPrincipal.innerHTML =
            '<p style="text-align:center; color: #888; padding: 40px 0;">No hay productos registrados en esta sección.</p>';

        return;
    }

    let esSeccionEventos =
        hojaActualGlobal.toLowerCase().trim() === 'eventos';

    // FRAGMENTO PARA AGRUPAR LAS CATEGORÍAS
    const fragmentoPrincipal =
        document.createDocumentFragment();

    Object.keys(categoriasMap).forEach(categoria => {

        let productosCat = categoriasMap[categoria];

        let seccionDiv = document.createElement('div');

        seccionDiv.className = 'categoria-section';

        let tituloDiv = document.createElement('div');

        tituloDiv.className = 'categoria-titulo';

        tituloDiv.innerText = categoria;

        seccionDiv.appendChild(tituloDiv);

        let gridDiv = document.createElement('div');

        gridDiv.className = 'grid-productos';

        // FRAGMENTO PARA LAS TARJETAS
        const fragmentoTarjetas =
            document.createDocumentFragment();

        productosCat.forEach(prod => {

            let card = document.createElement('div');

            card.className = 'card-producto';

            card.dataset.codigo =
                String(prod.codigo || '');

            card.dataset.descripcion =
                String(prod.descripcion || '');

            // COMPROBAR VIDEO
            let videoUrl = prod.video
                ? String(prod.video).trim()
                : '';

            let videoId = obtenerIdDrive(videoUrl);

            let tieneVideoReal =
                videoUrl !== '' && videoId !== '';

            // OBTENER IMAGEN
            let imagenId = obtenerIdDrive(prod.imagen);

            let portadaSrc = imagenId
                ? `https://lh3.googleusercontent.com/d/${imagenId}`
                : '';

            // BOTONES DE IMAGEN Y VIDEO CON COLORES PASTEL
            let botonesHTML = '';

            if (portadaSrc) {

                botonesHTML += `
                    <button type="button"
                        class="boton-ver-media boton-ver-fotos"
                        style="
                            display: block;
                            width: 100%;
                            padding: 6px 5px;
                            font-size: 12px;
                            background: #90CAF9;
                            color: #23456B;
                            border: 1px solid #BBDEFB;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                        "
                        onclick='abrirModalImagen(${JSON.stringify(portadaSrc)})'>
                        🖼 Ver imagen
                    </button>
                `;
            }

            if (tieneVideoReal) {

                botonesHTML += `
                    <button type="button"
                        class="boton-ver-media boton-ver-video"
                        style="
                            display: block;
                            width: 100%;
                            padding: 6px 5px;
                            font-size: 12px;
                            background: #BBDEFB;
                            color: #23456B;
                            border: 1px solid #D6EAF8;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                        "
                        onclick='abrirModalVideo(${JSON.stringify(videoUrl)})'>
                        ▶ Ver video
                    </button>
                `;
            }

            // CONTENEDOR DE IMAGEN
            // CARGA PROGRESIVA PARA MEJORAR EL RENDIMIENTO
            let mediaHTML = `
                <div class="media-container">
                    ${portadaSrc
                        ? `<img src="${portadaSrc}" alt="${prod.descripcion}" loading="lazy" decoding="async">`
                        : '<div style="color:#aaa;">Sin portada</div>'}
                </div>
            `;

            let outrosHTML = prod.otros
                ? `<div class="card-otros">${prod.otros}</div>`
                : '';

            let variacionesHTML = '';

            if (!esSeccionEventos) {

                variacionesHTML =
                    `<div class="variaciones-container">`;

                (prod.filas || []).forEach(f => {

                    let medidaHTML = f.medida
                        ? `<span class="variacion-medida">${f.medida}</span>`
                        : '';

                    let precioHTML = f.precio
                        ? `<span class="variacion-precio">Lps. ${f.precio}</span>`
                        : '';

                    if (medidaHTML || precioHTML) {

                        variacionesHTML += `
                            <div class="variacion-row-final">
                                ${medidaHTML}
                                ${precioHTML}
                            </div>
                        `;
                    }

                });

                variacionesHTML += `</div>`;
            }

            // ESTRUCTURA DE LA TARJETA
            card.innerHTML = `
                ${mediaHTML}

                <div class="acciones-producto"
                    style="
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        gap: 6px;
                        padding: 0 10px 8px;
                    ">

                    ${botonesHTML
                        ? `<div class="botones-media"
                            style="
                                position: static !important;
                                inset: auto !important;
                                display: grid !important;
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                                gap: 6px;
                                width: 100%;
                                padding-top: 8px;
                            ">${botonesHTML}</div>`
                        : ''}

                    <div class="compartir-container" style="width:100%;"></div>
                </div>

                <div class="card-info">
                    <div>
                        <div class="card-title">${prod.codigo}: ${prod.descripcion}</div>
                        ${outrosHTML}
                    </div>

                    ${variacionesHTML}
                </div>
            `;

            // BOTÓN PARA COMPARTIR PRODUCTO
            const botonCompartir =
                document.createElement('button');

            botonCompartir.type = 'button';

            botonCompartir.textContent =
                '↗ Compartir producto';

            botonCompartir.style.cssText = `
                display: block;
                width: 100%;
                margin-top: 0;
                padding: 7px;
                font-size: 12px;
                background: #81AEEB;
                color: #23456B;
                border: 1px solid #C5DDF5;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            `;

            botonCompartir.onclick = () =>
                compartirProducto(prod);

            // AGREGAR BOTÓN DE COMPARTIR
            card.querySelector('.compartir-container')
                .appendChild(botonCompartir);

            // AGREGAR TARJETA AL FRAGMENTO
            fragmentoTarjetas.appendChild(card);

        });

        // INSERTAR TARJETAS EN SU CONTENEDOR
        gridDiv.appendChild(fragmentoTarjetas);

        seccionDiv.appendChild(gridDiv);

        // AGREGAR CATEGORÍA AL FRAGMENTO PRINCIPAL
        fragmentoPrincipal.appendChild(seccionDiv);

    });

    // INSERTAR TODAS LAS CATEGORÍAS
    contenedorPrincipal.appendChild(fragmentoPrincipal);

    // CONTROLES DE PAGINACIÓN
    contenedorPrincipal.appendChild(
        crearControlesPaginacion(listaProductos.length)
    );
}
