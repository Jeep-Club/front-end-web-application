const TIME_ZONE = 'America/Sao_Paulo';
const instantPattern = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?Z$/;
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export type PublicationPeriodDateTime = {
    /** ISO civil date, YYYY-MM-DD. */
    date: string;
    /** Local wall time HH:mm; absent means a date-only bound. */
    time?: string;
    /** Optional seconds for editing an existing precise timestamp. */
    seconds?: string;
    /** Optional fractional seconds, up to nanosecond precision. */
    fraction?: string;
    /** Original wire timestamp, retained to avoid precision or offset loss on no-op edits. */
    original?: string;
};

export type PeriodBoundary = 'start' | 'end';
export type PeriodInstantOptions = { original?: string; boundary?: PeriodBoundary };

const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function validDate(value: string): boolean {
    const match = datePattern.exec(value);
    if (!match) return false;
    const [, year, month, day] = match;
    const date = new Date(0);
    date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    date.setUTCHours(0, 0, 0, 0);
    return date.getUTCFullYear() === Number(year) && date.getUTCMonth() + 1 === Number(month) && date.getUTCDate() === Number(day);
}

function partsAt(epochMs: number) {
    return Object.fromEntries(formatter.formatToParts(new Date(epochMs)).map(({ type, value }) => [type, value]));
}

function validWallDateTime(date: string, time: string, seconds: string): boolean {
    return validDate(date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && /^(?:[0-5]\d)$/.test(seconds);
}

function wallTimeToEpoch(date: string, time: string, seconds: string): number | null {
    if (!validWallDateTime(date, time, seconds)) return null;
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const second = Number(seconds);
    const targetDate = new Date(0);
    targetDate.setUTCFullYear(year, month - 1, day);
    targetDate.setUTCHours(hour, minute, second, 0);
    const target = targetDate.getTime();
    const matches = new Set<number>();

    // Probe offsets around the target wall time so historical DST transitions are handled too.
    for (let delta = -36; delta <= 36; delta += 3) {
        const probe = target + delta * 60 * 60 * 1000;
        const p = partsAt(probe);
        const representedAsUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
        const offset = representedAsUtc - probe;
        const candidate = target - offset;
        const actual = partsAt(candidate);
        if (actual.year === String(year).padStart(4, '0') && actual.month === String(month).padStart(2, '0') && actual.day === String(day).padStart(2, '0') && actual.hour === String(hour).padStart(2, '0') && actual.minute === String(minute).padStart(2, '0') && actual.second === String(second).padStart(2, '0')) matches.add(candidate);
    }
    // Reject nonexistent and repeated local times rather than silently shifting an instant.
    return matches.size === 1 ? [...matches][0] : null;
}

function fieldsForInstant(value: string): PublicationPeriodDateTime | null {
    const match = instantPattern.exec(value);
    if (!match) return null;
    if (!validDate(match[1])) return null;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return null;
    const p = partsAt(date.getTime());
    const fraction = match[5]?.slice(1) ?? '';
    return {
        date: `${p.year}-${p.month}-${p.day}`,
        time: `${p.hour}:${p.minute}`,
        seconds: p.second,
        fraction,
        original: value,
    };
}

/** Converts a UTC instant into São Paulo wall-clock fields while retaining the original wire value. */
export function publicationInstantToDateTime(value: string): PublicationPeriodDateTime | null {
    const fields = fieldsForInstant(value);
    if (!fields || !validDate(fields.date)) return null;
    return fields;
}

/** Returns a DatePicker-friendly local value, retaining seconds/fraction only when present. */
export function utcInstantToLocalPeriodValue(value: string): string | null {
    const fields = publicationInstantToDateTime(value);
    if (!fields) return null;
    const fraction = fields.fraction ? `.${fields.fraction}` : '';
    return `${fields.date}T${fields.time}:${fields.seconds}${fraction}`;
}

/** Converts local fields to an ISO UTC instant. Date-only bounds cover the full local day inclusively. */
export function publicationDateTimeToInstant(fields: PublicationPeriodDateTime, boundary: PeriodBoundary = 'start'): string | null {
    if (!validDate(fields.date)) return null;

    const time = fields.time;
    if (time === undefined || time === '') {
        const edgeTime = boundary === 'start' ? '00:00' : '23:59';
        const edgeSeconds = boundary === 'start' ? '00' : '59';
        const epoch = wallTimeToEpoch(fields.date, edgeTime, edgeSeconds);
        if (epoch === null) return null;
        const suffix = boundary === 'start' ? '000000000' : '999999999';
        return `${new Date(epoch).toISOString().slice(0, 19)}.${suffix}Z`;
    }

    const seconds = fields.seconds ?? '00';
    const fraction = fields.fraction ?? '';
    if (fraction !== '' && !/^\d{1,9}$/.test(fraction)) return null;
    const epoch = wallTimeToEpoch(fields.date, time, seconds);
    if (epoch === null) return null;

    if (fields.original) {
        const original = fieldsForInstant(fields.original);
        if (original && original.date === fields.date && original.time === time && original.seconds === seconds && original.fraction === fraction) return fields.original;
    }
    const base = new Date(epoch).toISOString().slice(0, 19);
    return `${base}${fraction ? `.${fraction}` : ''}Z`;
}

/** Parses a DatePicker local value and converts it to UTC. A date-only value uses the selected inclusive edge. */
export function localPeriodValueToUtcInstant(value: string, options: PeriodInstantOptions = {}): string | null {
    const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/.exec(value);
    if (!match) return null;
    const [, date, hour, minute, seconds, fraction] = match;
    if (options.original && hour !== undefined) {
        const originalLocal = utcInstantToLocalPeriodValue(options.original);
        const comparedLength = fraction !== undefined ? value.length : seconds !== undefined ? 19 : hour !== undefined ? 16 : 10;
        if (originalLocal?.slice(0, comparedLength) === value.slice(0, comparedLength)) return options.original;
    }
    return publicationDateTimeToInstant({
        date,
        ...(hour === undefined ? {} : { time: `${hour}:${minute}`, seconds: seconds ?? '00', fraction: fraction ?? '' }),
        ...(options.original ? { original: options.original } : {}),
    }, options.boundary ?? 'start');
}
