import { createPublicationSchema, updatePublicationSchema } from "@/schemas/admin/publication";

interface PublicationRepository {
    list(query: PublicationListQuery): Promise<PageResponse<Publication>>;
    get(id: bigint): Promise<Publication>;
    create(input: CreatePublicationInput): Promise<Publication>;
    update(id: bigint, input: UpdatePublicationInput): Promise<Publication>;
    delete(id: bigint): Promise<void>;
}

const now = "2026-09-01T12:00:00.000Z";
const seeds: Publication[] = [
    // @ts-expect-error BigInt literals are required by the domain while the project still targets ES2017.
    { id: 1n, type: "event", title: "Encontro Nacional de Jeepeiros", summary: "Trilhas e confraternização.", content: "Participe do nosso encontro anual.", thumbnailUrl: "https://images.example.com/encontro.jpg", media: [{ id: 1n, type: "image", url: "https://images.example.com/trilha.jpg", alt: "Jipes na trilha", caption: "Trilha principal" }], status: "published", publishedAt: "2026-08-01T10:00:00.000Z", createdAt: "2026-07-01T10:00:00.000Z", updatedAt: now, startAt: "2026-10-10T12:00:00.000Z", endAt: "2026-10-12T18:00:00.000Z", addressId: 10n, maxParticipants: 150, requiresConfirmation: true },
    // @ts-expect-error See the note above.
    { id: 2n, type: "notice", title: "Manutenção da sede", summary: "Atendimento suspenso pela manhã.", content: "A sede passará por manutenção elétrica.", media: [], status: "published", publishedAt: "2026-08-15T09:00:00.000Z", createdAt: "2026-08-14T09:00:00.000Z", updatedAt: now, expiresAt: "2026-09-15T23:59:00.000Z", noticePriority: "high" },
    // @ts-expect-error See the note above.
    { id: 3n, type: "service", title: "Auxílio mecânico", summary: "Rede credenciada para associados.", content: "Consulte oficinas e condições do benefício.", media: [], status: "published", publishedAt: "2026-05-02T10:00:00.000Z", createdAt: "2026-05-01T10:00:00.000Z", updatedAt: now, serviceCategory: "help" },
    // @ts-expect-error See the note above.
    { id: 4n, type: "event", title: "Passeio Serra Verde", content: "Passeio de nível iniciante.", media: [], status: "draft", createdAt: "2026-08-20T10:00:00.000Z", updatedAt: now, startAt: "2026-11-05T11:00:00.000Z", endAt: "2026-11-05T20:00:00.000Z", addressId: 11n, maxParticipants: 40, requiresConfirmation: true },
    // @ts-expect-error See the note above.
    { id: 5n, type: "notice", title: "Atualização cadastral", content: "Mantenha telefone e endereço atualizados.", media: [], status: "archived", publishedAt: "2026-01-10T10:00:00.000Z", createdAt: "2026-01-09T10:00:00.000Z", updatedAt: now, expiresAt: null, noticePriority: "medium" },
    // @ts-expect-error See the note above.
    { id: 6n, type: "service", title: "Desconto em combustível", content: "Benefício disponível nos postos parceiros.", media: [], status: "published", publishedAt: "2026-03-12T10:00:00.000Z", createdAt: "2026-03-10T10:00:00.000Z", updatedAt: now, serviceCategory: "benefit" },
    // @ts-expect-error See the note above.
    { id: 7n, type: "event", title: "Curso de direção 4x4", content: "Treinamento prático de condução segura.", media: [], status: "published", publishedAt: "2026-07-10T10:00:00.000Z", createdAt: "2026-07-08T10:00:00.000Z", updatedAt: now, startAt: "2026-09-20T12:00:00.000Z", endAt: "2026-09-20T21:00:00.000Z", addressId: 12n, maxParticipants: 25, requiresConfirmation: true },
    // @ts-expect-error See the note above.
    { id: 8n, type: "notice", title: "Novo horário de atendimento", content: "Atendimento de segunda a sexta, das 9h às 18h.", media: [], status: "draft", createdAt: "2026-08-25T10:00:00.000Z", updatedAt: now, expiresAt: null, noticePriority: "low" },
    // @ts-expect-error See the note above.
    { id: 9n, type: "service", title: "Clube de vantagens", content: "Conheça todos os parceiros do clube.", media: [], status: "draft", createdAt: "2026-08-22T10:00:00.000Z", updatedAt: now, serviceCategory: "general" },
    // @ts-expect-error See the note above.
    { id: 10n, type: "event", title: "Expedição Caminho das Águas", content: "Expedição de três dias com apoio técnico.", media: [{ id: 10n, type: "video", url: "https://videos.example.com/expedicao.mp4", thumbnailUrl: "https://images.example.com/expedicao.jpg", alt: "Vídeo da expedição" }], status: "archived", publishedAt: "2025-08-01T10:00:00.000Z", createdAt: "2025-07-01T10:00:00.000Z", updatedAt: now, startAt: "2025-10-10T12:00:00.000Z", endAt: "2025-10-13T18:00:00.000Z", addressId: 13n, maxParticipants: null, requiresConfirmation: false },
    // @ts-expect-error See the note above.
    { id: 11n, type: "notice", title: "Assembleia geral", content: "Confira a pauta e participe da assembleia.", media: [], status: "published", publishedAt: "2026-08-28T10:00:00.000Z", createdAt: "2026-08-27T10:00:00.000Z", updatedAt: now, expiresAt: "2026-10-01T00:00:00.000Z", noticePriority: "high" },
    // @ts-expect-error See the note above.
    { id: 12n, type: "service", title: "Seguro para veículos", content: "Condições exclusivas para sócios.", media: [], status: "archived", publishedAt: "2025-02-02T10:00:00.000Z", createdAt: "2025-02-01T10:00:00.000Z", updatedAt: now, serviceCategory: "benefit" },
];

function clone(publication: Publication): Publication {
    return { ...publication, media: publication.media.map((item) => ({ ...item })) };
}

export function normalizePublicationSearch(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function notFound(id: bigint): Error {
    return new Error(`Publicação com ID ${id.toString()} não encontrada.`);
}

export function createMockPublicationsRepository(options: { delay?: number; initial?: Publication[] } = {}): PublicationRepository {
    let records = (options.initial ?? seeds).map(clone);
    let nextId = records.reduce((max, item) => item.id > max ? item.id : max, BigInt(0)) + BigInt(1);
    let nextMediaId = records.flatMap((item) => item.media).reduce((max, item) => item.id > max ? item.id : max, BigInt(0)) + BigInt(1);
    const delay = options.delay ?? 120;
    const wait = () => new Promise((resolve) => setTimeout(resolve, delay));

    return {
        async list(query) {
            await wait();
            const general = normalizePublicationSearch(query.q ?? "");
            const title = normalizePublicationSearch(query.title ?? "");
            const from = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`).getTime() : undefined;
            const to = (value?: string) => value ? new Date(`${value}T23:59:59.999Z`).getTime() : undefined;
            let result = records.filter((item) => {
                const searchable = [item.title, item.summary, item.content, ...item.media.flatMap((media) => [media.alt, media.caption])]
                    .filter((value): value is string => Boolean(value)).map(normalizePublicationSearch);
                const created = new Date(item.createdAt).getTime();
                const published = item.publishedAt ? new Date(item.publishedAt).getTime() : undefined;
                return (!general || searchable.some((value) => value.includes(general)))
                    && (!title || normalizePublicationSearch(item.title).includes(title))
                    && (!query.type || item.type === query.type) && (!query.status || item.status === query.status)
                    && (!query.noticePriority || (item.type === "notice" && item.noticePriority === query.noticePriority))
                    && (!query.serviceCategory || (item.type === "service" && item.serviceCategory === query.serviceCategory))
                    && (!from(query.createdFrom) || created >= from(query.createdFrom)!) && (!to(query.createdTo) || created <= to(query.createdTo)!)
                    && (!from(query.publishedFrom) || (published !== undefined && published >= from(query.publishedFrom)!))
                    && (!to(query.publishedTo) || (published !== undefined && published <= to(query.publishedTo)!));
            });
            const [field = "createdAt", direction = "desc"] = query.sort?.split(",") ?? [];
            const sortable = (item: Publication): string | number | undefined => {
                if (field === "startAt") return item.type === "event" ? item.startAt : undefined;
                if (field === "expiresAt") return item.type === "notice" ? item.expiresAt ?? undefined : undefined;
                const value = item[field as keyof Publication];
                return typeof value === "string" || typeof value === "number" ? value : undefined;
            };
            result = [...result].sort((a, b) => String(sortable(a) ?? "").localeCompare(String(sortable(b) ?? ""), "pt-BR") * (direction === "desc" ? -1 : 1));
            const totalElements = result.length;
            const totalPages = totalElements ? Math.ceil(totalElements / query.size) : 0;
            const page = totalPages ? Math.min(query.page, totalPages - 1) : 0;
            const content = result.slice(page * query.size, (page + 1) * query.size).map(clone);
            return { content, totalElements, totalPages, number: page, size: query.size, first: page === 0, last: !totalPages || page === totalPages - 1, numberOfElements: content.length, empty: !content.length, sort: { sorted: true, unsorted: false, empty: false } };
        },
        async get(id) { await wait(); const item = records.find((record) => record.id === id); if (!item) throw notFound(id); return clone(item); },
        async create(input) {
            await wait(); const valid = createPublicationSchema.parse(input); const timestamp = new Date().toISOString();
            const item = { ...valid, id: nextId++, media: valid.media.map((media) => ({ ...media, id: media.id ?? nextMediaId++ })), createdAt: timestamp, updatedAt: timestamp, ...(valid.status === "published" && { publishedAt: timestamp }) } as Publication;
            records = [...records, item]; return clone(item);
        },
        async update(id, input) {
            await wait(); const index = records.findIndex((item) => item.id === id); if (index < 0) throw notFound(id);
            const valid = updatePublicationSchema.parse(input); const current = records[index]; const timestamp = new Date().toISOString();
            const item = { ...valid, id, media: valid.media.map((media) => ({ ...media, id: media.id ?? nextMediaId++ })), createdAt: current.createdAt, updatedAt: timestamp, ...(valid.status === "published" ? { publishedAt: current.publishedAt ?? timestamp } : {}) } as Publication;
            records = records.map((record) => record.id === id ? item : record); return clone(item);
        },
        async delete(id) { await wait(); if (!records.some((item) => item.id === id)) throw notFound(id); records = records.filter((item) => item.id !== id); },
    };
}

const globalPublications = globalThis as typeof globalThis & { __publicationRepository?: PublicationRepository };
export const publicationsRepository = globalPublications.__publicationRepository ??= createMockPublicationsRepository();
