"use client";

import { useSyncExternalStore } from 'react';
import { relativeTime } from '@/utils/publications/relativeTime';
import { feedDate } from './feedDisplay';

let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!timer) {
        now = Date.now();
        timer = setInterval(() => {
            now = Date.now();
            listeners.forEach(notify => notify());
        }, 30_000);
    }
    return () => {
        listeners.delete(listener);
        if (!listeners.size) { clearInterval(timer); timer = undefined; }
    };
}
const snapshot = () => now;
const serverSnapshot = () => 0;

export function RelativeTime({ value, className }: { value: string; className?: string }) {
    const currentTime = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
    return <time dateTime={value} title={Number.isFinite(Date.parse(value)) ? feedDate(value) : undefined} className={className}>
        {currentTime ? relativeTime(value, currentTime) : ''}
    </time>;
}
