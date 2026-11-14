
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


// ==========================================
// COMPARTIR PRODUCTO CON FOTOGRAFÍA
// ==========================================

async function compartirProducto(prod) {
    if (!prod) return;

    const enlace = crearEnlaceProducto(prod);

    // OBTENER FOTOGRAFÍA DEL PRODUCTO
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
            ? '💰 Medidas y precios:\n' + variaciones.map(v => '• ' + v).join('\n')
            : '',
        imagenUrl ? `🖼️ Foto del producto: ${imagenUrl}` : '',
        `🔗 Ver producto: ${enlace}`
    ].filter(Boolean).join('\n\n');

    // INTENTAR COMPARTIR FOTO Y DATOS DESDE EL CELULAR
    if (imagenUrl && navigator.share && navigator.canShare) {
        try {
            const respuesta = await fetch(imagenUrl);

            if (!respuesta.ok) {
                throw new Error('No se pudo obtener la fotografía.');
            }

            const blob = await respuesta.blob();

            const nombreArchivo = (prod.codigo || 'producto')
                .toString()
                .replace(/[^a-zA-Z0-9_-]/g, '_');

            const archivo = new File(
                [blob],
                `VASORD_${nombreArchivo}.jpg`,
                { type: blob.type || 'image/jpeg' }
            );

            const datosCompartir = {
                title: prod.descripcion || 'Producto VASORD',
                text: mensaje,
                files: [archivo]
            };

            if (navigator.canShare({ files: [archivo] })) {
                await navigator.share(datosCompartir);
                return;
            }

        } catch (error) {
            if (error.name === 'AbortError') return;

            console.warn(
                'No fue posible compartir la fotografía directamente:',
                error
            );
        }
    }

    // ALTERNATIVA PARA EQUIPOS Y APLICACIONES NO COMPATIBLES
    if (navigator.share) {
        try {
            await navigator.share({
                title: prod.descripcion || 'Producto VASORD',
                text: mensaje
            });
            return;
        } catch (error) {
            if (error.name === 'AbortError') return;
        }
    }

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

        alert('¡Fotografía descargada! Ya puedes adjuntarla en WhatsApp.');

    } catch (error) {
        console.error('Error al descargar la fotografía:', error);

        window.open(imagenUrl, '_blank', 'noopener');

        alert('Abre la fotografía y guárdala en tu dispositivo.');
    }
}


// ==========================================
// MENÚ DE COMPARTIR
// ==========================================

function mostrarMenuCompartir(mensaje, enlace, imagenUrl, codigo) {
    const anterior = document.getElementById('menuCompartirVASORD');
    if (anterior) anterior.remove();

    const fondo = document.createElement('div');
    fondo.id = 'menuCompartirVASORD';

    fondo.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.65);
        z-index:100000;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:15px;
    `;

    const caja = document.createElement('div');

    caja.style.cssText = `
        background:white;
        width:100%;
        max-width:340px;
        padding:25px;
        border-radius:15px;
        text-align:center;
        box-shadow:0 5px 25px rgba(0,0,0,0.3);
    `;

    const titulo = document.createElement('h3');
    titulo.textContent = 'Compartir producto';
    titulo.style.margin = '0 0 20px';
    caja.appendChild(titulo);

    function crearBoton(texto, color, accion) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = texto;

        boton.style.cssText = `
            display:block;
            width:100%;
            padding:13px;
            margin:10px 0;
            border:0;
            border-radius:8px;
            background:${color};
            color:white;
            font-size:15px;
            font-weight:bold;
            cursor:pointer;
        `;

        boton.onclick = accion;
        caja.appendChild(boton);
    }

    crearBoton('🟢 WhatsApp', '#25D366', () => {
        window.open(
            'https://api.whatsapp.com/send?text=' + encodeURIComponent(mensaje),
            '_blank',
            'noopener'
        );
    });

    crearBoton('🔵 Facebook', '#1877F2', () => {
        window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(enlace),
            '_blank',
            'noopener'
        );
    });

    if (imagenUrl) {
        crearBoton('📸 Descargar foto del producto', '#64A9D9', () => {
            descargarImagenProducto(imagenUrl, codigo);
        });
    }

    crearBoton('📋 Copiar enlace', '#16834A', async () => {
        try {
            await navigator.clipboard.writeText(enlace);
            alert('¡Enlace copiado correctamente!');
        } catch (error) {
            window.prompt('Copia este enlace:', enlace);
        }
    });

    crearBoton('✖ Cerrar', '#666666', () => fondo.remove());

    fondo.onclick = (evento) => {
        if (evento.target === fondo) fondo.remove();
    };

    fondo.appendChild(caja);
    document.body.appendChild(fondo);
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


