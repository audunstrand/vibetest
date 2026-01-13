import { describe, it, expect } from 'vitest';
import { parseRow, aggregateByGroupAndYear, getColor, createChartDatasets, getUniqueGroups, filterByGroup } from './app.js';

describe('parseRow', () => {
    it('konverterer antall_arbeidssokere til tall', () => {
        const result = parseRow({ aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: '100' });
        expect(result.antall_arbeidssokere).toBe(100);
    });

    it('håndterer tomme verdier som 0', () => {
        expect(parseRow({ antall_arbeidssokere: '' }).antall_arbeidssokere).toBe(0);
        expect(parseRow({ antall_arbeidssokere: undefined }).antall_arbeidssokere).toBe(0);
    });

    it('beholder andre felter uendret', () => {
        const result = parseRow({ aar: '2020', yrke_grovgruppe: 'Ledere', yrke: 'Direktør', antall_arbeidssokere: '50' });
        
        expect(result.aar).toBe('2020');
        expect(result.yrke_grovgruppe).toBe('Ledere');
        expect(result.yrke).toBe('Direktør');
    });
});

describe('aggregateByGroupAndYear', () => {
    it('summerer arbeidssøkere per yrkesgruppe og år', () => {
        const input = [
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: 100 },
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: 50 },
            { aar: '2020', yrke_grovgruppe: 'Helse', antall_arbeidssokere: 200 },
            { aar: '2021', yrke_grovgruppe: 'IT', antall_arbeidssokere: 120 }
        ];
        
        const result = aggregateByGroupAndYear(input);
        
        expect(result.labels).toEqual(['2020', '2021']);
        expect(result.groups['IT']).toEqual([150, 120]);
        expect(result.groups['Helse']).toEqual([200, 0]);
    });

    it('sorterer år kronologisk', () => {
        const input = [
            { aar: '2022', yrke_grovgruppe: 'IT', antall_arbeidssokere: 100 },
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: 80 },
            { aar: '2021', yrke_grovgruppe: 'IT', antall_arbeidssokere: 90 }
        ];
        
        const result = aggregateByGroupAndYear(input);
        
        expect(result.labels).toEqual(['2020', '2021', '2022']);
        expect(result.groups['IT']).toEqual([80, 90, 100]);
    });

    it('håndterer tom input', () => {
        const result = aggregateByGroupAndYear([]);
        
        expect(result.labels).toEqual([]);
        expect(result.groups).toEqual({});
    });
});

describe('getColor', () => {
    it('returnerer farge basert på index', () => {
        expect(getColor(0)).toBe('#4e79a7');
        expect(getColor(1)).toBe('#f28e2b');
    });

    it('wrapper rundt når index overstiger antall farger', () => {
        expect(getColor(10)).toBe(getColor(0));
        expect(getColor(11)).toBe(getColor(1));
    });
});

describe('createChartDatasets', () => {
    it('oppretter datasets for Chart.js', () => {
        const aggregated = {
            labels: ['2020', '2021'],
            groups: {
                'IT': [100, 120],
                'Helse': [200, 180]
            }
        };
        
        const datasets = createChartDatasets(aggregated);
        
        expect(datasets).toHaveLength(2);
        expect(datasets[0].label).toBe('IT');
        expect(datasets[0].data).toEqual([100, 120]);
        expect(datasets[0].borderColor).toBeDefined();
    });

    it('setter riktige Chart.js egenskaper', () => {
        const aggregated = {
            labels: ['2020'],
            groups: { 'Test': [50] }
        };
        
        const datasets = createChartDatasets(aggregated);
        
        expect(datasets[0].tension).toBe(0.1);
        expect(datasets[0].fill).toBe(false);
    });
});

describe('getUniqueGroups', () => {
    it('returnerer unike yrkesgrupper sortert alfabetisk', () => {
        const data = [
            { yrke_grovgruppe: 'Helse' },
            { yrke_grovgruppe: 'IT' },
            { yrke_grovgruppe: 'Helse' },
            { yrke_grovgruppe: 'Bygg' }
        ];
        
        const result = getUniqueGroups(data);
        
        expect(result).toEqual(['Bygg', 'Helse', 'IT']);
    });

    it('returnerer tom array for tom input', () => {
        expect(getUniqueGroups([])).toEqual([]);
    });
});

describe('filterByGroup', () => {
    it('returnerer alle data når filter er "all"', () => {
        const data = [
            { yrke_grovgruppe: 'IT' },
            { yrke_grovgruppe: 'Helse' }
        ];
        
        const result = filterByGroup(data, 'all');
        
        expect(result).toEqual(data);
    });

    it('filtrerer data til valgt gruppe', () => {
        const data = [
            { yrke_grovgruppe: 'IT', antall: 100 },
            { yrke_grovgruppe: 'Helse', antall: 200 },
            { yrke_grovgruppe: 'IT', antall: 150 }
        ];
        
        const result = filterByGroup(data, 'IT');
        
        expect(result).toHaveLength(2);
        expect(result.every(r => r.yrke_grovgruppe === 'IT')).toBe(true);
    });
});
