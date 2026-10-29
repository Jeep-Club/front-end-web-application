import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PaymentDetailPage from "@/components/pages/admin/payments/PaymentDetailPage";
import { useUserStore } from "@/stores/userStore";
import type { PaymentDetail } from "@/schemas/payments";

jest.mock("@/server/actions/payments", () => ({ confirmPaymentAction: jest.fn(), getPaymentAction: jest.fn(), rejectPaymentAction: jest.fn() }));
jest.mock("@/stores/userStore", () => ({ useUserStore: jest.fn() }));
jest.mock("@/components/pages/admin/payments/PaymentReceipt", () => ({ __esModule: true, default: () => null }));

function render(actions: string[], status: PaymentDetail["status"] = "PENDING_VALIDATION") {
    jest.mocked(useUserStore).mockReturnValue([{ module: "BILLING", actions }]);
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, gcTime: Infinity } } });
    client.setQueryData(["billing", "payments", "detail", 12], {
        id: 12, memberChargeId: 7, amount: 250, paymentMethod: "PIX", status,
        paidAt: "2026-10-15T12:00:00Z", receiptUrl: "/billing/member-payments/12/receipt", createdAt: "2026-10-15T12:05:00Z",
        confirmedAt: null, confirmedByUserId: null, rejectedAt: null, rejectedByUserId: null,
        rejectionReason: status === "REJECTED" ? "Comprovante ilegível" : null, canceledAt: null, notes: null, updatedAt: null,
    } satisfies PaymentDetail);
    const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(PaymentDetailPage, { id: 12 })));
    client.clear();
    return html;
}

describe("controles de decisão na tela", () => {
    it("mostra os detalhes, sem decisões, para o usuário somente com leitura", () => {
        const html = render(["PAYMENT_READ"]);
        expect(html).toContain("Dados do pagamento");
        expect(html).toContain("somente à consulta");
        expect(html).not.toContain("Confirmar</button>");
        expect(html).not.toContain("Rejeitar</button>");
    });

    it("mostra confirmar e oculta rejeitar quando só há permissão de confirmação", () => {
        const html = render(["PAYMENT_READ", "PAYMENT_CONFIRM"]);
        expect(html).toContain("Confirmar</button>");
        expect(html).not.toContain("Rejeitar</button>");
    });

    it("mostra rejeitar e oculta confirmar quando só há permissão de rejeição", () => {
        const html = render(["PAYMENT_READ", "PAYMENT_REJECT"]);
        expect(html).toContain("Rejeitar</button>");
        expect(html).not.toContain("Confirmar</button>");
    });

    it.each(["CONFIRMED", "REJECTED", "CANCELED"] as const)("oculta decisões para pagamento %s", status => {
        const html = render(["PAYMENT_READ", "PAYMENT_CONFIRM", "PAYMENT_REJECT"], status);
        expect(html).toContain("já foi analisado ou cancelado");
        expect(html).not.toContain("Confirmar</button>");
        expect(html).not.toContain("Rejeitar</button>");
        if (status === "REJECTED") expect(html).toContain("Comprovante ilegível");
    });

    it("não apresenta detalhes sem leitura", () => {
        expect(render(["PAYMENT_CONFIRM"])).not.toContain("Dados do pagamento");
    });
});
