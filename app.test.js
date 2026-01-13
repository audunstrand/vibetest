import { describe, it, expect } from 'vitest';
import { parseRows, aggregateByGroupAndYear } from './app.js';

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
