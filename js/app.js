
function obtenerIdDrive(url) {
    if (!url) return '';
    let rawUrl = String(url).trim();
    let match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    return match && match[1] ? match[1] : '';
}

function construirMenu(hojaActiva) {
    const nav = document.getElementById('nav-categorias');
    nav.innerHTML = '';

    HOJAS_DISPONIBLES.forEach((nombreHoja) => {
        let btn = document.createElement('button');
        btn.className = `nav-btn ${nombreHoja === hojaActiva ? 'active' : ''}`;
        btn.innerText = nombreHoja;
        btn.onclick = () => cambiarHoja(nombreHoja);
        nav.appendChild(btn);
    });
}

function cambiarHoja(nombreHoja) {
    hojaActualGlobal = nombreHoja;
    construirMenu(nombreHoja);

    window.location.hash = nombreHoja;

    if (nombreHoja === 'Inicio') {
        document.getElementById('titulo-seccion').innerText = 'Bienvenidos';
        renderizarInicio();
    } else {
        document.getElementById('titulo-seccion').innerText = `Catálogo - ${nombreHoja}`;
        cargarDatos(nombreHoja);
    }
}

function renderizarInicio() {
    const contenedor = document.getElementById('contenedor-principal');
    contenedor.innerHTML = `
        <div class="inicio-container">
            <div class="inicio-banner-bienvenida">
                <h2>Transformamos tus celebraciones en momentos inolvidables</h2>
                <p>Bienvenidos a nuestra tienda de artículos para cumpleaños, mobiliario, manualidades, decoraciones, papelería, sublimación y más. Brindamos un servicio personalizado para que cada celebración sea especial.</p>
                <div class="inicio-nota">
                    ⚠️ Nota importante: Los precios pueden variar. Recomendamos cotizar antes de realizar un pedido.
                </div>
            </div>

            <div class="inicio-grid-info">
                <div class="inicio-card-info">
                    <h3>📦 Aquí encontrarás</h3>
                    <ul>
                        <li>✨ Artículos para cumpleaños</li>
                        <li>📄 Papelería y manualidades</li>
                        <li>🎈 Decoraciones para eventos</li>
                        <li>🪑 Renta de mobiliario</li>
                        <li>🎨 Sublimaciones y regalos</li>
                        <li>🎁 Arreglos y piñatas</li>
                        <li><em>y mucho más...</em></li>
                    </ul>
                </div>
                <div class="inicio-card-info">
                    <h3>🖨️ Servicios Secretariales</h3>
                    <ul>
                        <li>🖨️ Impresiones color / BN</li>
                        <li>📋 Copias color / BN</li>
                        <li>🖼️ Impresión hoja sublimación A4</li>
                        <li>📸 Impresión de fotografías</li>
                        <li>💳 Tarjetas de presentación</li>
                        <li>💌 Tarjetas de invitación</li>
                        <li><em>y mucho más...</em></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function abrirModalVideo(videoUrl) {
    let videoId = obtenerIdDrive(videoUrl);
    if (!videoId) return;

    let modal = document.getElementById('videoModal');
    let containerBody = document.getElementById('modalContainerBody');

    containerBody.innerHTML = `
        <button class="modal-close" onclick="cerrarModal()">×</button>
        <iframe src="https://drive.google.com/file/d/${videoId}/preview" allow="autoplay" allowfullscreen></iframe>
    `;
    modal.style.display = 'flex';
}

function abrirModalImagen(imageUrl) {
    if (!imageUrl) return;

    let modal = document.getElementById('videoModal');
    let containerBody = document.getElementById('modalContainerBody');

    containerBody.innerHTML = `
        <button class="modal-close" onclick="cerrarModal()">×</button>
        <img src="${imageUrl}" alt="Imagen ampliada">
    `;
    modal.style.display = 'flex';
}

function cerrarModal() {
    let modal = document.getElementById('videoModal');
    let containerBody = document.getElementById('modalContainerBody');

    containerBody.innerHTML = '';
    modal.style.display = 'none';
}

let productoFichaActual = null;

function escaparTextoHTML(texto) {
    return String(texto || '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caracter]);
}

function abrirFichaProducto(prod) {
    productoFichaActual = prod;

    const modal = document.getElementById('videoModal');
    const cuerpo = document.getElementById('modalContainerBody');

    const imagenId = obtenerIdDrive(prod.imagen);
    const imagen = imagenId
        ? `https://lh3.googleusercontent.com/d/${imagenId}`
        : '';

    const videoId = obtenerIdDrive(prod.video);

    const variaciones = (prod.filas || []).map(f => `
        <div style="display:flex; justify-content:space-between; gap:10px; padding:8px; border-bottom:1px solid #eee;">
            <span>${escaparTextoHTML(f.medida || '')}</span>
            <strong style="color:#16834A;">
                ${f.precio ? 'Lps. ' + escaparTextoHTML(f.precio) : ''}
            </strong>
        </div>
    `).join('');

    cuerpo.innerHTML = `
        <button class="modal-close" onclick="cerrarModal()">×</button>

        <div style="padding:20px; max-height:85vh; overflow-y:auto; text-align:center;">

            ${imagen ? `
                <img src="${imagen}"
                     alt="${escaparTextoHTML(prod.descripcion)}"
                     style="width:100%; max-height:300px; object-fit:contain; border-radius:10px;">
            ` : ''}

            <h2 style="margin:15px 0 8px;">
                ${escaparTextoHTML(prod.descripcion)}
            </h2>

            <p><strong>Código:</strong> ${escaparTextoHTML(prod.codigo)}</p>

            ${prod.otros ? `
                <p style="color:#555;">
                    ${escaparTextoHTML(prod.otros)}
                </p>
            ` : ''}

            ${variaciones ? `
                <h3 style="text-align:left;">Medidas y precios</h3>
                ${variaciones}
            ` : ''}

            ${videoId ? `
                <h3>Video del producto</h3>
                <iframe
                    src="https://drive.google.com/file/d/${videoId}/preview"
                    allow="autoplay"
                    allowfullscreen
                    style="width:100%; height:250px; border:0; border-radius:10px;">
                </iframe>
            ` : ''}

            <button onclick="compartirProducto(productoFichaActual)"
                style="margin-top:18px; padding:12px 22px; background:#16834A; color:white; border:0; border-radius:8px; font-weight:bold; cursor:pointer;">
                ↗ Compartir producto
            </button>

        </div>
    `;

    modal.style.display = 'flex';
}

function crearEnlaceProducto(prod) {
    const parametros = new URLSearchParams();

    parametros.set('seccion', hojaActualGlobal);
    parametros.set('codigo', prod.codigo || '');
    parametros.set('descripcion', prod.descripcion || '');

    return `${window.location.origin}${window.location.pathname}?${parametros.toString()}`;
}

// FUNCIÓN ACTUALIZADA PARA COMPARTIR PRODUCTOS
async function compartirProducto(prod) {
    if (!prod) return;

    const enlace = crearEnlaceProducto(prod);

    const variaciones = (prod.filas || [])
        .map(f => {
            const partes = [];
            if (f.medida) partes.push(f.medida);
            if (f.precio) partes.push('Lps. ' + f.precio);
            return partes.join(' - ');
        })
        .filter(Boolean);

    const mensaje = [
        '🛍️ VASORD Creacioness y Más',
        `📦 Producto: ${prod.descripcion || ''}`,
        prod.codigo ? `🔖 Código: ${prod.codigo}` : '',
        prod.otros ? `📝 Descripción: ${prod.otros}` : '',
        variaciones.length
            ? '💰 Medidas y precios:\n' + variaciones.map(v => '• ' + v).join('\n')
            : '',
        `🔗 Ver producto: ${enlace}`
    ].filter(Boolean).join('\n\n');

    // INTENTAR ABRIR EL MENÚ NATIVO PARA COMPARTIR
    if (navigator.share) {
        try {
            await navigator.share({
                title: prod.descripcion || 'Producto VASORD',
                text: mensaje
            });

            return;

        } catch (error) {
            // Si el usuario cierra el menú, no mostramos ningún error.
            if (error.name === 'AbortError') {
                return;
            }
        }
    }

    // ALTERNATIVA: COPIAR EL MENSAJE
    try {
        await navigator.clipboard.writeText(mensaje);
        alert('¡Mensaje copiado! Ya puedes compartirlo.');
    } catch (error) {
        window.prompt('Copia el mensaje para compartirlo:', mensaje);
    }
}

function abrirProductoDesdeEnlace() {
    const parametros = new URLSearchParams(window.location.search);

    const codigo = parametros.get('codigo');
    const descripcion = parametros.get('descripcion');

    if (!codigo && !descripcion) return;

    const indice = datosActualesPaginacion.findIndex(prod =>
        prod.codigo === codigo &&
        prod.descripcion === descripcion
    );

    if (indice === -1) {
        alert('No se encontró el producto solicitado.');
        return;
    }

    paginaActualCatalogo = Math.floor(
        indice / PRODUCTOS_POR_PAGINA
    ) + 1;

    renderizarPorCategorias(datosActualesPaginacion, true);

    abrirFichaProducto(datosActualesPaginacion[indice]);
}

const parametrosIniciales = new URLSearchParams(window.location.search);

const seccionCompartida = parametrosIniciales.get('seccion');

let hashRuta = window.location.hash.replace('#', '').trim();

let seccionInicial = seccionCompartida || decodeURIComponent(hashRuta);

let matchPestana = HOJAS_DISPONIBLES.find(
    h => h.toLowerCase() === seccionInicial.toLowerCase()
);

if (matchPestana) {
    cambiarHoja(matchPestana);
} else {
    cambiarHoja('Inicio');
}


