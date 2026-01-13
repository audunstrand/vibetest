// NAV Arbeidssøkere Visualisering

const DATA_URL = 'https://raw.githubusercontent.com/datahotellet/dataset-archive/main/datasets/nav/arbeidssokere-yrke/dataset.csv';

let rawData = [];
let chart = null;

// Task 2: Last og parse CSV-data
async function loadData() {
    const response = await fetch(DATA_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map(row => ({
                    ...row,
                    antall_arbeidssokere: parseInt(row.antall_arbeidssokere, 10) || 0
                }));
                resolve(data);
            },
            error: (error) => reject(error)
        });
    });
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
}

async function init() {
    try {
        showLoading(true);
        rawData = await loadData();
        console.log(`Lastet ${rawData.length} rader`);
        console.log('Første rad:', rawData[0]);
        console.log('Siste rad:', rawData[rawData.length - 1]);
        showLoading(false);
    } catch (error) {
        console.error('Feil ved lasting av data:', error);
        document.getElementById('loading').textContent = 'Feil ved lasting av data';
    }
}

document.addEventListener('DOMContentLoaded', init);
