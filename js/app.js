
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


// ==========================================
// ESCAPAR TEXTO HTML
// ==========================================

function escaparTextoHTML(texto) {
    return String(texto || '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caracter]);
}


// ==========================================
// ABRIR FICHA DEL PRODUCTO
// ==========================================

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


// ==========================================
// CREAR ENLACE DEL PRODUCTO
// ==========================================

function crearEnlaceProducto(prod) {
    const parametros = new URLSearchParams();

    parametros.set('seccion', hojaActualGlobal);
    parametros.set('codigo', prod.codigo || '');
    parametros.set('descripcion', prod.descripcion || '');

    return `${window.location.origin}${window.location.pathname}?${parametros.toString()}`;
}


// ==========================================
// COMPARTIR PRODUCTO
// ==========================================

function compartirProducto(prod) {
    if (!prod) return;

    const enlace = crearEnlaceProducto(prod);

    const imagenId = obtenerIdDrive(prod.imagen);

    const imagenUrl = imagenId
        ? `https://lh3.googleusercontent.com/d/${imagenId}`
        : '';

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
            ? '💰 Medidas y precios: ' + variaciones.join(' | ')
            : '',
        `🔗 Ver producto: ${enlace}`
    ].filter(Boolean).join('\n');

    mostrarMenuCompartir(mensaje, enlace, imagenUrl, prod.codigo);
}


// ==========================================
// DESCARGAR FOTOGRAFÍA DEL PRODUCTO
// ==========================================

async function descargarImagenProducto(imagenUrl, codigo) {
    if (!imagenUrl) return;

    try {
        const respuesta = await fetch(imagenUrl);

        if (!respuesta.ok) {
            throw new Error('No se pudo descargar la imagen.');
        }

        const blob = await respuesta.blob();
        const urlTemporal = URL.createObjectURL(blob);

        const enlaceDescarga = document.createElement('a');

        enlaceDescarga.href = urlTemporal;
        enlaceDescarga.download = `VASORD_${codigo || 'producto'}.jpg`;

        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();
        enlaceDescarga.remove();

        setTimeout(() => URL.revokeObjectURL(urlTemporal), 1500);

    } catch (error) {
        console.error('Error al descargar la fotografía:', error);

        window.open(imagenUrl, '_blank', 'noopener');

        alert('No se pudo descargar directamente. Abre la fotografía y guárdala en tu dispositivo.');
    }
}


// ==========================================
// MENÚ DE COMPARTIR
// ==========================================

function mostrarMenuCompartir(mensaje, enlace, imagenUrl, codigo) {

    // Detectar celulares y tabletas
    const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // ==========================================
    // CELULAR: MENÚ NATIVO DE APLICACIONES
    // ==========================================

    if (esCelular && navigator.share) {

        navigator.share({
            title: 'VASORD Creacioness y Más',
            text: mensaje
        }).catch(error => {

            if (error.name === 'AbortError') return;

            console.error('Error al compartir:', error);

            mostrarMenuCompartirWeb(mensaje, enlace, imagenUrl, codigo);
        });

        return;
    }

    // ==========================================
    // COMPUTADORA: MENÚ BLANCO DE VASORD
    // ==========================================

    mostrarMenuCompartirWeb(mensaje, enlace, imagenUrl, codigo);
}


// ==========================================
// MENÚ PERSONALIZADO PARA COMPUTADORA
// ==========================================

function mostrarMenuCompartirWeb(mensaje, enlace, imagenUrl, codigo) {

    const anterior = document.getElementById('menuCompartirVASORD');

    if (anterior) {
        anterior.remove();
    }

    const fondo = document.createElement('div');
    fondo.id = 'menuCompartirVASORD';

    fondo.style.cssText = `
        position:fixed !important;
        inset:0 !important;
        background:rgba(0,0,0,0.65) !important;
        z-index:2147483647 !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:15px !important;
        box-sizing:border-box !important;
        opacity:1 !important;
        visibility:visible !important;
    `;

    const caja = document.createElement('div');

    caja.style.cssText = `
        background:white !important;
        color:#222 !important;
        width:100% !important;
        max-width:340px !important;
        padding:25px !important;
        border-radius:15px !important;
        text-align:center !important;
        box-shadow:0 5px 25px rgba(0,0,0,0.3) !important;
        box-sizing:border-box !important;
        position:relative !important;
        z-index:2147483647 !important;
        opacity:1 !important;
        visibility:visible !important;
    `;

    const titulo = document.createElement('h3');
    titulo.textContent = 'Compartir producto';

    titulo.style.cssText = `
        color:#222;
        margin:0 0 20px;
        font-size:20px;
    `;

    caja.appendChild(titulo);

    function crearBoton(texto, color, accion) {
        const boton = document.createElement('button');

        boton.type = 'button';
        boton.textContent = texto;

        boton.style.cssText = `
            display:block !important;
            width:100% !important;
            padding:13px !important;
            margin:10px 0 !important;
            border:0 !important;
            border-radius:8px !important;
            background:${color} !important;
            color:white !important;
            font-size:15px !important;
            font-weight:bold !important;
            cursor:pointer !important;
            opacity:1 !important;
            visibility:visible !important;
        `;

        boton.addEventListener('click', function(evento) {
            evento.preventDefault();
            evento.stopPropagation();
            accion();
        });

        caja.appendChild(boton);
    }

    // WHATSAPP
    crearBoton('🟢 WhatsApp', '#25D366', () => {

        const urlWhatsApp =
            'https://wa.me/?text=' + encodeURIComponent(mensaje);

        window.open(urlWhatsApp, '_blank');

        fondo.remove();
    });

    // FACEBOOK
    crearBoton('🔵 Facebook', '#1877F2', () => {

        const urlFacebook =
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(enlace);

        window.open(urlFacebook, '_blank', 'noopener');

    });

    // DESCARGAR FOTO
    if (imagenUrl) {
        crearBoton('📸 Descargar foto del producto', '#64A9D9', () => {
            descargarImagenProducto(imagenUrl, codigo);
        });
    }

    // COPIAR ENLACE
    crearBoton('📋 Copiar enlace', '#16834A', async () => {
        try {
            await navigator.clipboard.writeText(enlace);
            alert('¡Enlace copiado correctamente!');
        } catch (error) {
            window.prompt('Copia este enlace:', enlace);
        }
    });

    // CERRAR
    crearBoton('✖ Cerrar', '#666666', () => {
        fondo.remove();
    });

    caja.addEventListener('click', function(evento) {
        evento.stopPropagation();
    });

    fondo.addEventListener('click', function(evento) {
        evento.stopPropagation();

        if (evento.target === fondo) {
            fondo.remove();
        }
    });

    fondo.appendChild(caja);
    document.body.appendChild(fondo);

    fondo.style.display = 'flex';
}


// ==========================================
// ABRIR PRODUCTO DESDE ENLACE COMPARTIDO
// ==========================================

function abrirProductoDesdeEnlace() {
    const parametros = new URLSearchParams(window.location.search);

    const codigo = parametros.get('codigo');
    const descripcion = parametros.get('descripcion');

    if (!codigo && !descripcion) return;

    const indice = datosActualesPaginacion.findIndex(prod =>
        String(prod.codigo || '') === String(codigo || '') &&
        String(prod.descripcion || '') === String(descripcion || '')
    );

    if (indice === -1) {
        alert('No se encontró el producto solicitado.');
        return;
    }

    paginaActualCatalogo = Math.floor(
        indice / PRODUCTOS_POR_PAGINA
    ) + 1;

    renderizarPorCategorias(datosActualesPaginacion, true);

    const tarjetas = document.querySelectorAll('.card-producto');

    const tarjeta = Array.from(tarjetas).find(card =>
        card.dataset.codigo === String(codigo || '') &&
        card.dataset.descripcion === String(descripcion || '')
    );

    if (tarjeta) {
        tarjeta.style.outline = '4px solid #16834A';
        tarjeta.style.boxShadow = '0 0 20px rgba(22,131,74,0.55)';
        tarjeta.style.borderRadius = '12px';

        tarjeta.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.hash
    );
}


// ==========================================
// INICIAR CATÁLOGO
// ==========================================

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


