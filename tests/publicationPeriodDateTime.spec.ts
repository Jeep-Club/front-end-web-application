import {
    localPeriodValueToUtcInstant,
    publicationDateTimeToInstant,
    publicationInstantToDateTime,
    utcInstantToLocalPeriodValue,
} from '@/utils/publications/periodDateTime';

describe('conversão de períodos do feed', () => {
    it('converte instantes UTC para a data e hora de São Paulo', () => {
        expect(utcInstantToLocalPeriodValue('2026-11-15T17:30:00Z')).toBe('2026-11-15T14:30:00');
        expect(publicationInstantToDateTime('2026-11-15T17:30:00Z')).toMatchObject({
            date: '2026-11-15', time: '14:30', seconds: '00', original: '2026-11-15T17:30:00Z',
        });
    });

    it('preserva a grafia e a precisão original se o valor local exibido não mudou', () => {
        const original = '2026-11-15T17:30:45.123456789Z';
        const local = utcInstantToLocalPeriodValue(original)!;
        expect(local).toBe('2026-11-15T14:30:45.123456789');
        expect(localPeriodValueToUtcInstant(local, { original })).toBe(original);
        // Mesmo se a interface exibir somente os minutos, segundos e frações originais continuam intactos.
        expect(localPeriodValueToUtcInstant('2026-11-15T14:30', { original })).toBe(original);
    });

    it('converte limites alterados de forma independente e aceita intervalos abertos', () => {
        expect(localPeriodValueToUtcInstant('2026-11-15T14:30')).toBe('2026-11-15T17:30:00Z');
        expect(localPeriodValueToUtcInstant('2026-11-16T18:45')).toBe('2026-11-16T21:45:00Z');
        expect(localPeriodValueToUtcInstant('2026-11-15T14:30:12.25')).toBe('2026-11-15T17:30:12.25Z');
        expect(localPeriodValueToUtcInstant('2026-11-15')).not.toBeNull();
        expect(localPeriodValueToUtcInstant('2026-11-15T14:30')).not.toBeNull();
    });

    it('aplica os extremos inclusivos do dia local quando a hora não foi informada', () => {
        expect(localPeriodValueToUtcInstant('2026-11-15', { boundary: 'start' })).toBe('2026-11-15T03:00:00.000000000Z');
        expect(localPeriodValueToUtcInstant('2026-11-15', { boundary: 'end' })).toBe('2026-11-16T02:59:59.999999999Z');
        expect(localPeriodValueToUtcInstant('2026-11-15', { boundary: 'start', original: '2026-11-15T17:30:45Z' })).toBe('2026-11-15T03:00:00.000000000Z');
    });

    it('rejeita datas inválidas e horas inexistentes ou ambíguas nas mudanças históricas de horário', () => {
        expect(localPeriodValueToUtcInstant('2026-02-30')).toBeNull();
        expect(localPeriodValueToUtcInstant('2018-11-04T00:30')).toBeNull();
        expect(localPeriodValueToUtcInstant('2019-02-16T23:30')).toBeNull();
        expect(publicationInstantToDateTime('2026-02-30T12:00:00Z')).toBeNull();
    });

    it('retorna null para valores de data/hora fora do contrato', () => {
        expect(localPeriodValueToUtcInstant('2026-11-15T24:00')).toBeNull();
        expect(localPeriodValueToUtcInstant('2026-11-15T14:30:00.1234567890')).toBeNull();
        expect(publicationDateTimeToInstant({ date: '2026-11-15', time: '14:30', seconds: '72' })).toBeNull();
    });
});
