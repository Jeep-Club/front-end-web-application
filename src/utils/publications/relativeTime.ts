export function relativeTime(value: string, now = Date.now()): string {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return '';
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
    const days = Math.floor(seconds / 86400);
    if (days === 1) return 'ontem';
    if (days < 1) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    }
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    }
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    }
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'ano' : 'anos'} atrás`;
}
