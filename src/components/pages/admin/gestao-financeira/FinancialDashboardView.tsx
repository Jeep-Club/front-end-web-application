"use client";

import { useState } from "react";
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, Clock3, Compass, Layers3, RefreshCw, Wallet } from "lucide-react";
import { distributionPercentage, type FinancialDashboardViewProps } from "./financialDashboardModel";
import styles from "./FinancialDashboardView.module.css";

const tones = { blue: "#3988e6", green: "#11a693", amber: "#e8a328", violet: "#8e6bd5" };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR");
const futureHints = {
    "Previsão de caixa": "Aguardando integração para acompanhar a previsão de caixa.",
    Despesas: "Aguardando integração para acompanhar as despesas do clube.",
    "Reserva do clube": "Aguardando integração para acompanhar a reserva do clube.",
};
const chartHints = {
    Receitas: "As entradas aparecerão aqui quando a integração estiver disponível.",
    Despesas: "As saídas aparecerão aqui quando a integração estiver disponível.",
    Saldo: "A evolução do saldo aparecerá aqui quando a integração estiver disponível.",
};

type ChartMode = keyof typeof chartHints;

export function FinancialDashboardView({ metrics, distribution, queue, shortcuts, updatedAt, refreshing, onRefresh, onNavigate, onQueueChange, onRetryQueue, configuration }: FinancialDashboardViewProps) {
    const [selectedSegment, setSelectedSegment] = useState<string>();
    const [chartMode, setChartMode] = useState<ChartMode>("Receitas");
    const [months, setMonths] = useState<6 | 12>(6);
    const [futureTopic, setFutureTopic] = useState<keyof typeof futureHints>();
    const total = distribution.segments.reduce((sum, segment) => sum + segment.count, 0);
    const activeSegment = distribution.segments.find((segment) => segment.id === selectedSegment);
    let offset = 0;

    return <section className={styles.dashboard} aria-label="Dashboard financeiro">
        <header className={styles.hero}>
            <div className={styles.heroContent}>
                <span className={styles.eyebrow}><span className={styles.eyebrowDot} /> Visão da diretoria</span>
                <h2>Panorama financeiro<span>.</span></h2>
                <p>Uma visão clara para acompanhar as finanças e cuidar do futuro do clube.</p>
                <div className={styles.heroMeta}><span><Clock3 size={15} /> {updatedAt ? `Atualizado às ${new Date(updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Aguardando atualização"}</span><span className={styles.metaDivider} /> <span>Todo o histórico</span></div>
            </div>
            <button className={styles.refresh} type="button" onClick={onRefresh} disabled={refreshing}><RefreshCw size={16} className={refreshing ? styles.spinning : undefined} /> {refreshing ? "Atualizando..." : "Atualizar dados"}</button>
            <div className={styles.heroDecoration} aria-hidden="true"><Activity size={100} strokeWidth={1} /></div>
        </header>

        {metrics.length > 0 && <div className={styles.metrics} aria-label="Indicadores financeiros">{metrics.map((metric, index) => {
            const Icon = [Wallet, Clock3, CheckCircle2, Layers3][index % 4];
            return <button type="button" key={metric.id} className={`${styles.metric} ${styles[metric.tone]}`} onClick={() => onNavigate(metric.destination)} aria-busy={metric.loading}>
                <span className={styles.metricTop}><span>{metric.title}</span><span className={styles.metricIcon}><Icon size={19} /></span></span>
                {metric.loading ? <span className={styles.skeleton} aria-label="Carregando indicador" /> : <strong>{metric.error || metric.value === undefined ? "—" : number.format(metric.value)}</strong>}
                <span className={styles.metricDescription}>{metric.error ? "Não foi possível carregar este indicador." : metric.description}</span>
                <span className={styles.metricAction}>Consultar <ArrowRight size={14} /></span>
            </button>;
        })}</div>}

        <div className={styles.analysisGrid}>
            {distribution.available && <article className={styles.panel}>
                <div className={styles.panelHeader}><div><span className={styles.kicker}>VISÃO GERAL</span><h3>Distribuição de cobranças</h3><p>Confira a situação das cobranças do clube.</p></div><span className={styles.panelIcon}><BarChart3 size={19} /></span></div>
                {distribution.loading ? <div className={styles.state} role="status">Carregando distribuição...</div> : distribution.error ? <div className={styles.state} role="alert">Não foi possível carregar a distribuição. <button type="button" onClick={onRefresh}>Tentar novamente</button></div> : <div className={styles.distribution}>
                    <div className={styles.donut} aria-label={`Total de ${number.format(total)} cobranças`}>
                        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="48" fill="none" stroke="var(--fd-track)" strokeWidth="12" />{total > 0 && distribution.segments.map((segment) => { const length = segment.count / total * 100; const currentOffset = offset; offset += length; return <circle key={segment.id} cx="60" cy="60" r="48" fill="none" stroke={tones[segment.tone]} strokeWidth="12" pathLength="100" strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={-currentOffset} className={styles.donutArc} opacity={activeSegment && activeSegment.id !== segment.id ? 0.25 : 1} transform="rotate(-90 60 60)" />; })}</svg>
                        <div className={styles.donutCenter} aria-live="polite"><strong>{activeSegment ? `${distributionPercentage(activeSegment.count, total)}%` : number.format(total)}</strong><span>{activeSegment ? `${number.format(activeSegment.count)} ${activeSegment.label.toLowerCase()}` : total === 0 ? "Nenhuma cobrança no histórico" : "cobranças"}</span></div>
                    </div>
                    <div className={styles.legend}>{distribution.segments.map((segment) => <button type="button" key={segment.id} className={styles.legendItem} aria-pressed={activeSegment?.id === segment.id} onClick={() => setSelectedSegment(activeSegment?.id === segment.id ? undefined : segment.id)}><span className={styles.legendLabel}><i style={{ backgroundColor: tones[segment.tone] }} />{segment.label}</span><strong>{number.format(segment.count)}</strong><span>{distributionPercentage(segment.count, total)}%</span></button>)}
                        {activeSegment && <button type="button" className={styles.textAction} onClick={() => onNavigate(activeSegment.destination)}>Consultar {activeSegment.label.toLowerCase()} <ArrowRight size={14} /></button>}
                    </div>
                </div>}
            </article>}
            <article className={styles.panel}>
                <div className={styles.panelHeader}><div><span className={styles.kicker}>ACOMPANHAMENTO</span><h3>Evolução de caixa</h3><p>Uma perspectiva das movimentações financeiras.</p></div><span className={styles.panelIcon}><Activity size={19} /></span></div>
                <div className={styles.chartControls}><div className={styles.switcher} aria-label="Tipo de evolução">{(Object.keys(chartHints) as ChartMode[]).map((mode) => <button type="button" key={mode} aria-pressed={chartMode === mode} onClick={() => setChartMode(mode)}>{mode}</button>)}</div><div className={styles.switcher} aria-label="Período de evolução">{([6, 12] as const).map((period) => <button type="button" key={period} aria-pressed={months === period} onClick={() => setMonths(period)}>{period} meses</button>)}</div></div>
                <div className={styles.chartEmpty}><div><span className={styles.emptyIcon}><Activity size={20} /></span><strong>Aguardando integração</strong><p>{chartHints[chartMode]}</p><small>Visualização de {months} meses</small></div></div>
            </article>
        </div>

        <div className={styles.lowerGrid}>
            {queue.groups.length > 0 && <article className={styles.panel}>
                <div className={styles.panelHeader}><div><span className={styles.kicker}>ATENÇÃO NECESSÁRIA</span><h3>Central de pendências</h3><p>Acompanhe o que precisa da sua atenção.</p></div><span className={styles.queueTotal}>{queue.total === undefined ? "—" : number.format(queue.total)} <small>no total</small></span></div>
                <div className={styles.queueTabs} aria-label="Categorias de pendências">{queue.groups.map((group) => <button type="button" key={group.id} aria-pressed={queue.selected === group.id} onClick={() => onQueueChange(group.id)}>{group.label} <span>{group.loading ? "…" : group.total === undefined ? "—" : number.format(group.total)}</span></button>)}</div>
                <p className={styles.listHint}>Até 5 registros por categoria</p>
                {queue.loading ? <div className={styles.state} role="status">Carregando pendências...</div> : queue.error ? <div className={styles.state} role="alert">Não foi possível carregar as pendências. <button type="button" onClick={onRetryQueue}>Tentar novamente</button></div> : queue.items.length === 0 ? <div className={styles.state}>Nenhuma pendência nesta categoria.</div> : <div className={styles.queueList}>{queue.items.slice(0, 5).map((item) => <button type="button" className={styles.queueItem} key={item.id} onClick={() => onNavigate(item.destination)}><span className={styles.queueItemIcon}><ArrowDownLeft size={17} /></span><span className={styles.queueItemText}><strong>{item.title}</strong><small>{item.description}</small>{item.date && !Number.isNaN(Date.parse(item.date)) && <small>Registrado em <time dateTime={item.date}>{new Date(item.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</time></small>}</span><span className={styles.queueAmount}>{currency.format(item.amount)}<ArrowRight size={15} /></span></button>)}</div>}
                {queue.destination && <button type="button" className={styles.textAction} onClick={() => onNavigate(queue.destination!)}>Ver todas as pendências <ArrowRight size={15} /></button>}
            </article>}
            <article className={styles.panel}>
                <div className={styles.panelHeader}><div><span className={styles.kicker}>GESTÃO MAIS SIMPLES</span><h3>Acesso rápido</h3><p>Continue de onde precisar.</p></div><span className={styles.panelIcon}><Compass size={19} /></span></div>
                {shortcuts.length ? <div className={styles.shortcuts}>{shortcuts.map((shortcut) => <button type="button" className={styles.shortcut} key={shortcut.label} onClick={() => onNavigate(shortcut.destination)}><span className={styles.shortcutIcon}><ArrowUpRight size={18} /></span><span><strong>{shortcut.label}</strong><small>{shortcut.description}</small></span><ArrowRight size={16} /></button>)}</div> : <div className={styles.state}>Nenhum acesso rápido disponível.</div>}
                <div className={styles.future}><span className={styles.kicker}>OLHANDO ADIANTE</span><h4>Planejamento financeiro</h4><p>Mais ferramentas para apoiar as próximas decisões do clube.</p><div>{(Object.keys(futureHints) as (keyof typeof futureHints)[]).map((topic) => <button type="button" key={topic} aria-expanded={futureTopic === topic} onClick={() => setFutureTopic(futureTopic === topic ? undefined : topic)}>{topic}</button>)}</div>{futureTopic ? <p aria-live="polite">{futureHints[futureTopic]}</p> : <small>Em planejamento</small>}</div>
            </article>
        </div>
        {configuration}
    </section>;
}
