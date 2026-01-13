// NAV Arbeidssøkere Visualisering

export const DATA_URL = 'https://raw.githubusercontent.com/datahotellet/dataset-archive/main/datasets/nav/arbeidssokere-yrke/dataset.csv';

let rawData = [];
let chart = null;

export function parseRow(row) {
    return {
        ...row,
        antall_arbeidssokere: parseInt(row.antall_arbeidssokere, 10) || 0
    };
}

export async function loadData(fetchFn = fetch, parseFn = Papa.parse) {
    const response = await fetchFn(DATA_URL);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
        parseFn(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map(parseRow);
                resolve(data);
            },
            error: (error) => reject(error)
        });
    });
}

// Aggreger data per yrkesgruppe og år
export function aggregateByGroupAndYear(data) {
    if (data.length === 0) {
        return { labels: [], groups: {} };
    }

    const yearSet = new Set();
    const groupYearSums = {};

    for (const row of data) {
        const { aar, yrke_grovgruppe, antall_arbeidssokere } = row;
        yearSet.add(aar);
        
        if (!groupYearSums[yrke_grovgruppe]) {
            groupYearSums[yrke_grovgruppe] = {};
        }
        groupYearSums[yrke_grovgruppe][aar] = (groupYearSums[yrke_grovgruppe][aar] || 0) + antall_arbeidssokere;
    }

    const years = [...yearSet].sort();
    const groups = {};
    
    for (const group of Object.keys(groupYearSums)) {
        groups[group] = years.map(year => groupYearSums[group][year] || 0);
    }

    return { labels: years, groups };
}

const COLORS = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'
];

export function getColor(index) {
    return COLORS[index % COLORS.length];
}

export function getUniqueGroups(data) {
    return [...new Set(data.map(d => d.yrke_grovgruppe))].sort();
}

export function filterByGroup(data, group) {
    if (group === 'all') return data;
    return data.filter(d => d.yrke_grovgruppe === group);
}

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

function populateDropdown(groups) {
    const select = document.getElementById('group-filter');
    if (!select) return;
    
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        select.appendChild(option);
    });
}

function updateChart(data) {
    const aggregated = aggregateByGroupAndYear(data);
    const ctx = document.getElementById('chart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    chart = renderChart(ctx, aggregated);
}

async function init() {
    try {
        showLoading(true);
        rawData = await loadData();
        console.log(`Lastet ${rawData.length} rader`);
        
        const groups = getUniqueGroups(rawData);
        populateDropdown(groups);
        
        updateChart(rawData);
        
        const select = document.getElementById('group-filter');
        if (select) {
            select.addEventListener('change', (e) => {
                const filtered = filterByGroup(rawData, e.target.value);
                updateChart(filtered);
            });
        }
        
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
