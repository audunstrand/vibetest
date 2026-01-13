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

// Task 3: Aggreger data per yrkesgruppe og år
export function aggregateByGroupAndYear(data) {
    if (data.length === 0) {
        return { labels: [], groups: {} };
    }

    // Finn unike år og grupper
    const years = [...new Set(data.map(d => d.aar))].sort();
    const groupNames = [...new Set(data.map(d => d.yrke_grovgruppe))];

    // Summer per gruppe og år
    const groups = {};
    for (const group of groupNames) {
        groups[group] = years.map(year => {
            return data
                .filter(d => d.yrke_grovgruppe === group && d.aar === year)
                .reduce((sum, d) => sum + d.antall_arbeidssokere, 0);
        });
    }

    return { labels: years, groups };
}

// Task 4: Generer farger for grafen
const COLORS = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'
];

export function getColor(index) {
    return COLORS[index % COLORS.length];
}

// Task 4: Opprett Chart.js datasets
export function createChartDatasets(aggregated) {
    const groupNames = Object.keys(aggregated.groups);
    return groupNames.map((name, index) => ({
        label: name,
        data: aggregated.groups[name],
        borderColor: getColor(index),
        backgroundColor: getColor(index),
        tension: 0.1,
        fill: false
    }));
}

// Task 4: Rendre linjediagram
export function renderChart(ctx, aggregated) {
    const datasets = createChartDatasets(aggregated);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: aggregated.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const meta = ci.getDatasetMeta(index);
                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                        ci.update();
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Antall arbeidssøkere'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'År'
                    }
                }
            }
        }
    });
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
        
        const aggregated = aggregateByGroupAndYear(rawData);
        const ctx = document.getElementById('chart').getContext('2d');
        chart = renderChart(ctx, aggregated);
        
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
