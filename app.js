// NAV Arbeidssøkere Visualisering

export const DATA_URL = 'https://raw.githubusercontent.com/datahotellet/dataset-archive/main/datasets/nav/arbeidssokere-yrke/dataset.csv';

let rawData = [];
let chart = null;
let currentChartType = 'line';
let cachedYears = [];

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

export function getUniqueYears(data) {
    return [...new Set(data.map(d => d.aar))].sort();
}

export function filterByGroup(data, group) {
    if (group === 'all') return data;
    return data.filter(d => d.yrke_grovgruppe === group);
}

export function aggregateByGroupForYear(data, year) {
    const filtered = data.filter(d => d.aar === year);
    const groupSums = {};
    
    for (const row of filtered) {
        const { yrke_grovgruppe, antall_arbeidssokere } = row;
        groupSums[yrke_grovgruppe] = (groupSums[yrke_grovgruppe] || 0) + antall_arbeidssokere;
    }
    
    return {
        labels: Object.keys(groupSums).sort(),
        data: Object.keys(groupSums).sort().map(key => groupSums[key])
    };
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

export function renderChart(ctx, aggregated, chartType = 'line') {
    const datasets = createChartDatasets(aggregated);
    
    let chartConfig = {
        type: chartType === 'horizontalBar' ? 'bar' : chartType === 'stackedArea' ? 'line' : chartType,
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
    };
    
    // Customize based on chart type
    if (chartType === 'stackedArea') {
        chartConfig.data.datasets = chartConfig.data.datasets.map(ds => {
            // Convert hex color to rgba with transparency
            const hex = ds.borderColor;
            let rgba;
            if (hex.startsWith('#')) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                rgba = `rgba(${r}, ${g}, ${b}, 0.5)`;
            } else {
                rgba = hex; // fallback to original color if not hex
            }
            return {
                ...ds,
                fill: true,
                backgroundColor: rgba
            };
        });
        chartConfig.options.scales.y.stacked = true;
    } else if (chartType === 'horizontalBar') {
        chartConfig.options.indexAxis = 'y';
        chartConfig.options.scales.x.title.text = 'Antall arbeidssøkere';
        chartConfig.options.scales.y.title.text = 'År';
    } else if (chartType === 'bar') {
        // Bar chart specific settings
        chartConfig.data.datasets = chartConfig.data.datasets.map(ds => ({
            ...ds,
            backgroundColor: ds.borderColor
        }));
    }
    
    return new Chart(ctx, chartConfig);
}

export function renderPieChart(ctx, yearData) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: yearData.labels,
            datasets: [{
                data: yearData.data,
                backgroundColor: yearData.labels.map((_, i) => getColor(i))
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString('nb-NO')} (${percentage}%)`;
                        }
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

function populateYearDropdown(years) {
    const select = document.getElementById('year-filter');
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });
    
    // Select the latest year by default
    if (years.length > 0) {
        select.value = years[years.length - 1];
    }
}

function toggleYearFilter(show) {
    const yearFilterGroup = document.getElementById('year-filter-group');
    if (yearFilterGroup) {
        yearFilterGroup.style.display = show ? 'flex' : 'none';
    }
}

function toggleGroupFilter(show) {
    const groupFilter = document.getElementById('group-filter');
    const groupFilterLabel = groupFilter?.previousElementSibling;
    if (groupFilter && groupFilter.parentElement) {
        groupFilter.parentElement.style.display = show ? 'flex' : 'none';
    }
}

function updateChart(data, chartType = 'line', selectedYear = null) {
    const ctx = document.getElementById('chart').getContext('2d');
    const canvas = document.getElementById('chart');
    
    if (chart) {
        chart.destroy();
    }
    
    // Update aria-label based on chart type
    const chartTypeLabels = {
        'line': 'Linjediagram som viser antall arbeidssøkere per yrkesgruppe over tid',
        'bar': 'Søylediagram som viser antall arbeidssøkere per yrkesgruppe over tid',
        'stackedArea': 'Stablede områder som viser antall arbeidssøkere per yrkesgruppe over tid',
        'horizontalBar': 'Horisontalt søylediagram som viser antall arbeidssøkere per yrkesgruppe over tid',
        'pie': 'Sektordiagram som viser fordeling av arbeidssøkere per yrkesgruppe'
    };
    if (canvas) {
        canvas.setAttribute('aria-label', chartTypeLabels[chartType] || chartTypeLabels['line']);
    }
    
    if (chartType === 'pie') {
        if (!selectedYear && cachedYears.length > 0) {
            selectedYear = cachedYears[cachedYears.length - 1]; // Default to latest year
        }
        const yearData = aggregateByGroupForYear(data, selectedYear);
        chart = renderPieChart(ctx, yearData);
        updateAccessibleTableForPie(yearData, selectedYear);
    } else {
        const aggregated = aggregateByGroupAndYear(data);
        chart = renderChart(ctx, aggregated, chartType);
        updateAccessibleTable(aggregated);
    }
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

function updateAccessibleTableForPie(yearData, year) {
    const container = document.getElementById('data-table-container');
    if (!container) return;
    
    const total = yearData.data.reduce((a, b) => a + b, 0);
    
    let html = `
        <table>
            <caption>Antall arbeidssøkere per yrkesgruppe for ${year}</caption>
            <thead>
                <tr>
                    <th scope="col">Yrkesgruppe</th>
                    <th scope="col">Antall</th>
                    <th scope="col">Prosent</th>
                </tr>
            </thead>
            <tbody>
                ${yearData.labels.map((name, i) => {
                    const value = yearData.data[i];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `
                        <tr>
                            <th scope="row">${name}</th>
                            <td>${value.toLocaleString('nb-NO')}</td>
                            <td>${percentage}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function init() {
    try {
        showLoading(true);
        rawData = await loadData();
        console.log(`Lastet ${rawData.length} rader`);
        
        const groups = getUniqueGroups(rawData);
        cachedYears = getUniqueYears(rawData);
        
        populateDropdown(groups);
        populateYearDropdown(cachedYears);
        
        updateChart(rawData, currentChartType);
        
        // Chart type selector
        const chartTypeSelect = document.getElementById('chart-type');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', (e) => {
                currentChartType = e.target.value;
                const isPieChart = currentChartType === 'pie';
                
                toggleYearFilter(isPieChart);
                toggleGroupFilter(!isPieChart);
                
                if (isPieChart) {
                    const yearSelect = document.getElementById('year-filter');
                    const selectedYear = yearSelect?.value;
                    updateChart(rawData, currentChartType, selectedYear);
                } else {
                    const groupSelect = document.getElementById('group-filter');
                    const filtered = filterByGroup(rawData, groupSelect?.value || 'all');
                    updateChart(filtered, currentChartType);
                }
            });
        }
        
        // Group filter
        const groupSelect = document.getElementById('group-filter');
        if (groupSelect) {
            groupSelect.addEventListener('change', (e) => {
                const filtered = filterByGroup(rawData, e.target.value);
                updateChart(filtered, currentChartType);
            });
        }
        
        // Year filter (for pie chart)
        const yearSelect = document.getElementById('year-filter');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                if (currentChartType === 'pie') {
                    updateChart(rawData, currentChartType, e.target.value);
                }
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
