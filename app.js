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

// Aksel fargepalett for datavisualisering
const COLORS = [
    '#0067C5', // a-blue-500 (primær)
    '#66A3F4', // a-blue-300
    '#005B82', // a-deepblue-500
    '#06893A', // a-green-500
    '#66C786', // a-green-300
    '#A2AD00', // a-limegreen-500
    '#634689', // a-purple-500
    '#A18DBB', // a-purple-300
    '#FF9100', // a-orange-500
    '#368DA8', // a-lightblue-700
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
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('nb-NO');
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Antall arbeidssøkere'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('nb-NO');
                        }
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
    updateAccessibleTable(aggregated);
}

function updateAccessibleTable(aggregated) {
    const container = document.getElementById('data-table-container');
    if (!container) return;
    
    const { labels, groups } = aggregated;
    const groupNames = Object.keys(groups);
    
    let html = `
        <table>
            <caption>Antall arbeidssøkere per yrkesgruppe og år</caption>
            <thead>
                <tr>
                    <th scope="col">Yrkesgruppe</th>
                    ${labels.map(year => `<th scope="col">${year}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${groupNames.map(name => `
                    <tr>
                        <th scope="row">${name}</th>
                        ${groups[name].map(val => `<td>${val.toLocaleString('nb-NO')}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function init() {
    try {
        showLoading(true);
        rawData = await loadData();
        
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
        showLoading(false);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
            loading.textContent = 'Kunne ikke laste data. Vennligst prøv igjen senere.';
            loading.setAttribute('role', 'alert');
        }
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}
