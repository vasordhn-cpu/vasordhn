
const SPREADSHEET_ID = '1sjLsTiP0hmH1b5mhcw9M6fK3qOdSD-IbLJ6pXWLn0c';

// ==========================================
// CATEGORÍAS CORTAS
// ==========================================

const HOJAS_CORTAS = [
    'Inicio',
    'Arreglos',
    'Escolares',
    'Flores',
    'Servicios',
    'Mobiliario',
    'Eventos'
];

// ==========================================
// CATEGORÍAS LARGAS
// ==========================================

const HOJAS_LARGAS = [
    'Cajas y empaques',
    'Arte en papel y foamy',
    'Proyectos creativos'
];

// ==========================================
// UNIR TODAS LAS CATEGORÍAS
// ==========================================

const HOJAS_DISPONIBLES = [
    ...HOJAS_CORTAS,
    ...HOJAS_LARGAS
];

let hojaActualGlobal = 'Inicio';
