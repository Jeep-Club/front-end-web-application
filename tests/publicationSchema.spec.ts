import { createPublicationSchema } from "@/schemas/admin/publication";
const common = { title: "Publicação válida", content: "Conteúdo", status: "draft" as const, media: [] };
describe("schemas de publicação", () => {
    it.each([
        { ...common, type: "event", startAt: "2026-10-01T10:00:00.000Z", endAt: "2026-10-01T11:00:00.000Z", addressId: BigInt(1), maxParticipants: null, requiresConfirmation: false },
        { ...common, type: "notice", expiresAt: null, noticePriority: "high" },
        { ...common, type: "service", serviceCategory: "benefit" },
    ])("valida os três tipos", (input) => expect(createPublicationSchema.safeParse(input).success).toBe(true));
    it("rejeita evento cujo término antecede o início", () => expect(createPublicationSchema.safeParse({ ...common, type: "event", startAt: "2026-10-01T12:00:00.000Z", endAt: "2026-10-01T11:00:00.000Z", addressId: BigInt(1), maxParticipants: null, requiresConfirmation: false }).success).toBe(false));
});
