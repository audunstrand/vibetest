// NAV Arbeidssøkere Visualisering

export const DATA_URL = 'https://raw.githubusercontent.com/datahotellet/dataset-archive/main/datasets/nav/arbeidssokere-yrke/dataset.csv';

let rawData = [];
let chart = null;

// Task 2: Last og parse CSV-data
export async function loadData(fetchFn = fetch, parseFn = Papa.parse) {
    const response = await fetchFn(DATA_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
        parseFn(csvText, {
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

export function parseRows(rows) {
    return rows.map(row => ({
        ...row,
        antall_arbeidssokere: parseInt(row.antall_arbeidssokere, 10) || 0
    }));
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.toggle('hidden', !show);
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
        const loading = document.getElementById('loading');
        if (loading) loading.textContent = 'Feil ved lasting av data';
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}
