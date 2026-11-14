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
                }
            } catch (error) {
                contenedor.innerHTML = '<p style="text-align:center; color: red;">Error al cargar los datos de esta área.</p>';
            }
        }
