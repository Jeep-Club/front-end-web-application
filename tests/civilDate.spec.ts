import { parseCivilDate, maskCivilDate } from '@/utils/masks/civilDate';

describe('datas civis', () => {
    it('mascara a entrada numérica', () => expect(maskCivilDate('30102026')).toBe('30/10/2026'));
    it('valida anos bissextos sem depender de fuso', () => {
        expect(parseCivilDate('29/02/2028')).toBe('2028-02-29');
        expect(parseCivilDate('29/02/2026')).toBeNull();
        expect(parseCivilDate('31/02/2026')).toBeNull();
    });
});
