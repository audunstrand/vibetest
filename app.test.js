import { describe, it, expect } from 'vitest';
import { parseRows, aggregateByGroupAndYear, getColor, createChartDatasets } from './app.js';

describe('parseRows', () => {
    it('konverterer antall_arbeidssokere til tall', () => {
        const input = [
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: '100' },
            { aar: '2021', yrke_grovgruppe: 'IT', antall_arbeidssokere: '150' }
        ];
        
        const result = parseRows(input);
        
        expect(result[0].antall_arbeidssokere).toBe(100);
        expect(result[1].antall_arbeidssokere).toBe(150);
    });

    it('håndterer tomme verdier som 0', () => {
        const input = [
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: '' },
            { aar: '2020', yrke_grovgruppe: 'IT', antall_arbeidssokere: undefined }
        ];
        
        const result = parseRows(input);
        
        expect(result[0].antall_arbeidssokere).toBe(0);
        expect(result[1].antall_arbeidssokere).toBe(0);
    });

    it('beholder andre felter uendret', () => {
        const input = [
            { aar: '2020', yrke_grovgruppe: 'Ledere', yrke: 'Direktør', antall_arbeidssokere: '50' }
        ];
        
        const result = parseRows(input);
        
        expect(result[0].aar).toBe('2020');
        expect(result[0].yrke_grovgruppe).toBe('Ledere');
        expect(result[0].yrke).toBe('Direktør');
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
