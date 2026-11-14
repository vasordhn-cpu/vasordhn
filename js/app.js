   

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

        let hashRuta = window.location.hash.replace('#', '').trim();
        let matchPestana = HOJAS_DISPONIBLES.find(h => h.toLowerCase() === decodeURIComponent(hashRuta).toLowerCase());

        if (matchPestana) {
            cambiarHoja(matchPestana);
        } else {
            cambiarHoja('Inicio');
        }
