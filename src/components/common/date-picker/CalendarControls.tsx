'use client';

import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { ptBR } from '@mui/x-date-pickers/locales';
import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { RangeCalendarStateContext } from 'react-aria-components/RangeCalendar';
import { X } from 'lucide-react';

function Wheel({ label, value, count, onSelect }: { label: string; value: number; count: number; onSelect: (value: number) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const rowHeight = 36;
    useEffect(() => {
        const element = ref.current;
        if (element) element.scrollTop = value * rowHeight;
    }, [count, value]);
    return <div aria-label={label} className="jeep-time-wheel" ref={ref}>
        {Array.from({ length: count }, (_, index) => {
            const option = index;
            return <button key={index} type="button" aria-label={label + ' ' + String(option).padStart(2, '0')} aria-pressed={option === value} tabIndex={option === value ? 0 : -1} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = Math.max(0, Math.min(count - 1, value + (event.key === "ArrowDown" ? 1 : -1))); onSelect(next); requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"][tabindex="0"]')?.focus()); } }} onClick={() => onSelect(option)} className="jeep-time-option">{String(option).padStart(2, '0')}</button>;
        })}
    </div>;
}

export function TimeWheels({ value, onChange, onMinuteSelected }: { value: Time | null; onChange: (value: Time) => void; onMinuteSelected?: () => void }) {
    const current = value ?? new Time(0, 0);
    return <div className="jeep-time-columns">
        <Wheel label="Horas" count={24} value={current.hour} onSelect={hour => onChange(new Time(hour, current.minute))} />
        <Wheel label="Minutos" count={60} value={current.minute} onSelect={minute => { onChange(new Time(current.hour, minute)); onMinuteSelected?.(); }} />
    </div>;
}

/** A date change advances the mobile flow only after a complete selection. */
export function MobileDateAdvance({ dateKey, isOpen, onAdvance }: { dateKey: string; isOpen: boolean; onAdvance: () => void }) {
    const previous = useRef(dateKey);
    useEffect(() => {
        if (isOpen && dateKey && dateKey !== previous.current && window.matchMedia('(max-width: 640px)').matches && !document.activeElement?.closest('.jeep-sheet-header')) onAdvance();
        previous.current = dateKey;
    }, [dateKey, isOpen, onAdvance]);
    return null;
}

/** Keep confirmation disabled while the range calendar is awaiting its second day. */
export function MobileRangeSelection({ onIncompleteChange }: { onIncompleteChange: (incomplete: boolean) => void }) {
    const calendar = useContext(RangeCalendarStateContext);
    const incomplete = !!calendar?.anchorDate;
    useEffect(() => { onIncompleteChange(incomplete); }, [incomplete, onIncompleteChange]);
    return null;
}

export type MobileSheetPhase = 'date' | 'hours' | 'minutes';

export function MobileSheetHeader({ title, phase, hasTime, onPhaseChange, onClose, activeTime, onActiveTimeChange, children }: {
    title: string;
    phase: MobileSheetPhase;
    hasTime: boolean;
    onPhaseChange: (phase: MobileSheetPhase) => void;
    onClose: () => void;
    activeTime?: 'start' | 'end';
    onActiveTimeChange?: (part: 'start' | 'end') => void;
    children: ReactNode;
}) {
    const start = useRef<number | null>(null);
    const header = useRef<HTMLElement>(null);
    useEffect(() => {
        const viewport = window.visualViewport;
        const sheet = header.current?.closest<HTMLElement>('.jeep-calendar-popover');
        if (!viewport || !sheet || !window.matchMedia('(max-width: 640px)').matches) return;
        const update = () => {
            sheet.style.setProperty('--jeep-visible-height', viewport.height + 'px');
            sheet.style.setProperty('--jeep-keyboard-offset', Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) + 'px');
        };
        update();
        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);
        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
            sheet.style.removeProperty('--jeep-visible-height');
            sheet.style.removeProperty('--jeep-keyboard-offset');
        };
    }, []);
    return <header ref={header} className="jeep-sheet-header">
        <div className="jeep-sheet-handle-area" aria-hidden="true" onPointerDown={event => { start.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={event => { if (start.current !== null && event.clientY - start.current > 70) onClose(); start.current = null; }} onPointerCancel={() => { start.current = null; }}><span className="jeep-sheet-handle" /></div>
        <div className="jeep-sheet-title"><strong>{title}</strong><button type="button" aria-label="Fechar seletor de data" onClick={onClose}><X size={20} /></button></div>
        {children}
        <nav className="jeep-sheet-steps" aria-label="Etapas de seleção">
            {(['date', ...(hasTime ? ['hours', 'minutes'] : [])] as MobileSheetPhase[]).map(part => <button key={part} type="button" aria-pressed={phase === part} onClick={() => onPhaseChange(part)}>{({ date: 'Data', hours: 'Hora', minutes: 'Minuto' })[part]}</button>)}
        </nav>
        {activeTime && hasTime && <div className="jeep-time-parts jeep-sheet-range-parts" role="group" aria-label="Horário do intervalo"><button type="button" aria-pressed={activeTime === 'start'} onClick={() => onActiveTimeChange?.('start')}>Início</button><button type="button" aria-pressed={activeTime === 'end'} onClick={() => onActiveTimeChange?.('end')}>Fim</button></div>}
    </header>;
}

export function MobileSheetFooter({ onClear, onConfirm, isDisabled }: { onClear: () => void; onConfirm: () => void; isDisabled?: boolean }) {
    return <footer className="jeep-sheet-footer"><button type="button" onClick={onClear}>Limpar</button><button type="button" disabled={isDisabled} onClick={onConfirm}>Concluir</button></footer>;
}

export function MobileTimeClock({ value, label, onChange, onMinuteSelected, phase, onPhaseChange }: {
    value: Time | null;
    label?: string;
    onChange: (value: Time) => void;
    onMinuteSelected?: () => void;
    phase: 'hours' | 'minutes';
    onPhaseChange: (phase: MobileSheetPhase) => void;
}) {
    const clockRef = useRef<HTMLElement>(null);
    useEffect(() => {
        // MUI's clock calculates pointer positions against a fixed 220px dial.
        // Normalize coordinates when CSS scales it, including document-level drag events.
        let pointerId: number | null = null;
        let mask: HTMLElement | null = null;
        const normalize = (event: PointerEvent) => {
            if (event.type === 'pointerdown') {
                const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.MuiClock-squareMask') : null;
                if (!target || !clockRef.current?.contains(target)) return;
                mask = target;
                pointerId = event.pointerId;
            }
            if (!mask || event.pointerId !== pointerId) return;
            const rect = mask.getBoundingClientRect();
            const x = event.clientX, y = event.clientY;
            Object.defineProperties(event, {
                clientX: { configurable: true, value: rect.left + (x - rect.left) * 220 / rect.width },
                clientY: { configurable: true, value: rect.top + (y - rect.top) * 220 / rect.height },
            });
            if (event.type === 'pointerup' || event.type === 'pointercancel') { pointerId = null; mask = null; }
        };
        for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const) document.addEventListener(type, normalize, true);
        return () => { for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const) document.removeEventListener(type, normalize, true); };
    }, []);
    const current = value ?? new Time(0, 0);
    const clockValue = dayjs().hour(current.hour).minute(current.minute).second(0).millisecond(0);
    return <section ref={clockRef} className="jeep-mobile-clock" aria-label={label ? 'Horário de ' + label : 'Selecionar horário'}>
        <p className="text-center text-sm text-secondary">{label ? 'Horário de ' + label + ' · ' : ''}{phase === 'minutes' ? 'Selecione os minutos' : 'Selecione a hora'}</p>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br" localeText={ptBR.components.MuiLocalizationProvider.defaultProps.localeText}>
            <TimeClock ampm={false} views={['hours', 'minutes']} view={phase} value={clockValue}
                onViewChange={view => { if (view === 'hours' || view === 'minutes') onPhaseChange(view); }}
                onChange={(next, selectionState, selectedView) => {
                    if (!next) return;
                    if (!value || next.hour() !== current.hour || next.minute() !== current.minute) onChange(new Time(next.hour(), next.minute()));
                    if (selectionState === 'finish' && selectedView === 'minutes') onMinuteSelected?.();
                }}
                sx={{
                    '& .MuiClock-clock': { backgroundColor: 'var(--background-secondary)' },
                    '& .MuiClockNumber-root': { color: 'var(--text-primary)' },
                    '& .MuiClockNumber-root.Mui-selected': { color: 'var(--button-primary-text)' },
                    '& .MuiClock-pin, & .MuiClockPointer-root, & .MuiClockPointer-thumb': { backgroundColor: 'var(--button-primary-bg)', borderColor: 'var(--button-primary-bg)' },
                }} />
        </LocalizationProvider>
    </section>;
}