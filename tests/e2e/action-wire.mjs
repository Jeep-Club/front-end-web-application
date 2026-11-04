// Read the subset of React Flight used by these action assertions, including
// length-prefixed UTF-8 text chunks emitted for large export strings.
export function readActionFrame(body) {
    const bytes = Buffer.from(body);
    const records = new Map();
    let offset = 0;
    while (offset < bytes.length) {
        const colon = bytes.indexOf(58, offset);
        if (colon < 0) break;
        const id = bytes.toString('utf8', offset, colon);
        offset = colon + 1;
        const tag = String.fromCharCode(bytes[offset]);
        if (tag === 'T') {
            const comma = bytes.indexOf(44, offset);
            const length = parseInt(bytes.toString('utf8', offset + 1, comma), 16);
            offset = comma + 1;
            records.set(id, { value: bytes.toString('utf8', offset, offset + length) });
            offset += length;
        } else {
            const newline = bytes.indexOf(10, offset);
            const end = newline < 0 ? bytes.length : newline;
            const value = bytes.toString('utf8', offset, end);
            records.set(id, tag === 'E' ? { error: JSON.parse(value.slice(1)) } : { value: JSON.parse(value) });
            offset = end + 1;
        }
    }
    const actionReference = records.get('0')?.value?.a;
    if (typeof actionReference !== 'string' || !actionReference.startsWith('$@')) throw new Error('Missing action reference in React Flight response.');
    const result = records.get(actionReference.slice(2));
    if (!result) throw new Error('Missing action result in React Flight response.');
    if (result.error) return result;
    const resolve = value => {
        if (typeof value === 'string' && /^\$[0-9a-f]+$/.test(value)) return resolve(records.get(value.slice(1))?.value);
        if (Array.isArray(value)) return value.map(resolve);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolve(child)]));
        return value;
    };
    return { value: resolve(result.value) };
}
