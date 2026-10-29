export function getSigningSecret(): Uint8Array {
    const access = process.env.ACCESS;
    if (!access && process.env.NODE_ENV === 'production') {
        throw new Error('ACCESS is required for deployed environments');
    }
    return new TextEncoder().encode(access || 'secret-key-jeep-clube-dev-token');
}
