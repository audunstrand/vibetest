// NAV Arbeidssøkere Visualisering
// App entry point

const DATA_URL = 'https://raw.githubusercontent.com/datahotellet/dataset-archive/main/datasets/nav/arbeidssokere-yrke/dataset.csv';

let rawData = [];
let chart = null;

async function init() {
    console.log('App initialized');
    console.log('Chart.js version:', Chart.version);
    console.log('PapaParse available:', typeof Papa !== 'undefined');
}

document.addEventListener('DOMContentLoaded', init);
