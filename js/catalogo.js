
async function cargarDatos(nombreHoja) {
    const contenedor = document.getElementById('contenedor-principal');

    contenedor.innerHTML = '<p style="text-align:center; color: #666; padding: 40px 0;">Cargando datos de ' + nombreHoja + '...</p>';

    try {
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(nombreHoja)}`;

        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        let productos = rows.map(r => ({
            codigo: r.c[0] ? String(r.c[0].v) : '',
            descripcion: r.c[1] ? String(r.c[1].v) : '',
            otros: r.c[2] ? String(r.c[2].v) : '',
            tipo: r.c[3] ? String(r.c[3].v).trim() : 'General',
            medida: r.c[4] ? String(r.c[4].v) : '',
            precio: r.c[5] ? String(r.c[5].v) : '',
            imagen: r.c[6] ? String(r.c[6].v) : '',
            video: r.c[7] && r.c[7].v ? String(r.c[7].v).trim() : ''
        }));

        if (nombreHoja.toLowerCase() === 'servicios') {
            renderizarComoListaServiciosAgrupados(productos);
        } else {
            renderizarPorCategorias(productos);
            abrirProductoDesdeEnlace();
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);

        contenedor.innerHTML = '<p style="text-align:center; color: red;">Error al cargar los datos de esta área.</p>';
    }
}


function renderizarComoListaServiciosAgrupados(items) {
    const contenedorPrincipal = document.getElementById('contenedor-principal');

    contenedorPrincipal.innerHTML = '';

    let serviciosValidos = items.filter(item => item.codigo || item.descripcion);

    if (serviciosValidos.length === 0) {
        contenedorPrincipal.innerHTML = '<p style="text-align:center; color: #888; padding: 40px 0;">No hay servicios registrados en esta sección.</p>';
        return;
    }

    let gruposTipos = {};

    serviciosValidos.forEach(item => {
        let tipo = item.tipo && item.tipo !== '' ? item.tipo : 'General';

        if (!gruposTipos[tipo]) {
            gruposTipos[tipo] = [];
        }

        gruposTipos[tipo].push(item);
    });

    let tiposOrdenados = Object.keys(gruposTipos).sort((a, b) => a.localeCompare(b));

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


function renderizarPorCategorias(items, yaAgrupados = false) {
    const contenedorPrincipal = document.getElementById('contenedor-principal');

    contenedorPrincipal.innerHTML = '';

    let listaProductos = [];

    if (yaAgrupados) {
        listaProductos = items;

    } else {
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

            productosGlobales[key].filas.push(item);
        });

        listaProductos = Object.values(productosGlobales);

        datosActualesPaginacion = listaProductos;

        reiniciarPaginacionCatalogo();
    }

    const productosPagina = obtenerProductosPaginados(listaProductos);

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

        productosCat.forEach(prod => {
            let card = document.createElement('div');
            card.className = 'card-producto';

            card.dataset.codigo = String(prod.codigo || '');
            card.dataset.descripcion = String(prod.descripcion || '');

            // COMPROBAR VIDEO
            let videoUrl = prod.video ? String(prod.video).trim() : '';
            let videoId = obtenerIdDrive(videoUrl);

            let tieneVideoReal = videoUrl !== '' && videoId !== '';

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
                variacionesHTML = `<div class="variaciones-container">`;

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
            const botonCompartir = document.createElement('button');

            botonCompartir.type = 'button';
            botonCompartir.textContent = '↗ Compartir producto';

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

            botonCompartir.onclick = () => compartirProducto(prod);

            console.log('Producto seleccionado:', prod);

            card.querySelector('.compartir-container').appendChild(botonCompartir);

            gridDiv.appendChild(card);
        });

        seccionDiv.appendChild(gridDiv);
        contenedorPrincipal.appendChild(seccionDiv);
    });

    // CONTROLES DE PAGINACIÓN
    contenedorPrincipal.appendChild(
        crearControlesPaginacion(listaProductos.length)
    );
}


