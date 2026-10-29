import { relativeTime } from '@/utils/publications/relativeTime';

const now = Date.parse('2026-10-21T18:00:00Z');
it.each([
    [10, 'agora'], [60, '1 min atrás'], [300, '5 min atrás'], [3600, '1 hora atrás'],
    [18000, '5 horas atrás'], [86400, 'ontem'], [172800, '2 dias atrás'],
    [604800, '1 semana atrás'], [2592000, '1 mês atrás'], [12960000, '5 meses atrás'],
    [31536000, '1 ano atrás'], [63072000, '2 anos atrás'],
])('formats %s seconds ago as %s', (seconds, expected) => {
    expect(relativeTime(new Date(now - seconds * 1000).toISOString(), now)).toBe(expected);
});
it('handles invalid or slightly future timestamps safely', () => {
    expect(relativeTime('invalid', now)).toBe('');
    expect(relativeTime(new Date(now + 1000).toISOString(), now)).toBe('agora');
});
