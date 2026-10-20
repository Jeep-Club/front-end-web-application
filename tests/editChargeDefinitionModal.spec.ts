import React, { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { useModal } from "@/providers/ModalProvider";
import { ModalRoot } from "@/components/common/modal/root";
import { EditChargeDefinitionModal } from "@/components/pages/admin/gestao-financeira/EditChargeDefinitionModal";
import { updateChargeDefinitionAction } from "@/actions/billing/chargeDefinitions/update";

jest.mock("@tanstack/react-query", () => ({ useQuery: jest.fn(), useMutation: jest.fn(), useQueryClient: jest.fn() }));
jest.mock("@/providers/ModalProvider", () => ({ useModal: jest.fn() }));
jest.mock("@/components/common/form", () => ({ Form: () => null }));
jest.mock("@/components/pages/admin/gestao-financeira/ChargeDefinitionFormFields", () => ({ ChargeDefinitionFormFields: () => null }));
jest.mock("@/actions/billing/chargeDefinitions/get", () => ({ getChargeDefinitionAction: jest.fn() }));
jest.mock("@/actions/billing/chargeDefinitions/update", () => ({ updateChargeDefinitionAction: jest.fn() }));
jest.mock("react-hot-toast", () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

const close = jest.fn();
const refetch = jest.fn();
const mutateAsync = jest.fn();
const invalidateQueries = jest.fn();
const definition = {
    id: 7, name: "Anuidade", description: null, defaultAmount: 120,
    recurrenceType: "YEARLY", required: true, paymentAcceptancePolicy: "UNTIL_DUE_DATE",
    latePaymentGraceDays: null,
};

function queryState(patch: Record<string, unknown> = {}) {
    jest.mocked(useQuery).mockReturnValue({
        data: undefined, isLoading: false, isFetching: false, isError: true, refetch,
        ...patch,
    } as unknown as ReturnType<typeof useQuery>);
}

function findElement(node: ReactNode, type: unknown): ReactElement<Record<string, unknown>> {
    for (const child of Children.toArray(node)) {
        if (!isValidElement<{ children?: ReactNode }>(child)) continue;
        if (child.type === type) return child as ReactElement<Record<string, unknown>>;
        if (child.props.children) {
            const found = findElementOrNull(child.props.children, type);
            if (found) return found;
        }
    }
    throw new Error("Expected element missing");
}

function findElementOrNull(node: ReactNode, type: unknown) {
    try { return findElement(node, type); } catch { return null; }
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useModal).mockReturnValue({
        setClose: close, setOpen: jest.fn(), setContent: jest.fn(), content: null, ref: { current: null },
    });
    jest.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as unknown as ReturnType<typeof useQueryClient>);
    jest.mocked(useMutation).mockReturnValue({ mutateAsync, isPending: false } as unknown as ReturnType<typeof useMutation>);
    queryState();
});

it("shows initial loading, then an alert and retry instead of endless loading after failure", () => {
    queryState({ isLoading: true, isFetching: true, isError: false });
    expect(renderToStaticMarkup(EditChargeDefinitionModal({ chargeDefinitionId: 7 }))).toContain("Carregando dados");
    queryState();
    const tree = EditChargeDefinitionModal({ chargeDefinitionId: 7 });
    const html = renderToStaticMarkup(tree);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Não foi possível carregar os dados da cobrança");
    expect(html).not.toContain("Carregando dados");
    expect(html).toContain("Tentar novamente");
    (findElement(tree, Button).props.onClick as () => void)();
    expect(refetch).toHaveBeenCalledTimes(1);
});

it("disables retry during a fetch and keeps the close button available", () => {
    queryState({ isFetching: true });
    const tree = EditChargeDefinitionModal({ chargeDefinitionId: 7 });
    expect(findElement(tree, Button).props.disabled).toBe(true);
    const closeButton = findElement(tree, ButtonIcon);
    expect(closeButton.props["aria-label"]).toBe("Fechar edição de definição de cobrança");
    (closeButton.props.onClick as () => void)();
    expect(close).toHaveBeenCalledTimes(1);
    expect(renderToStaticMarkup(tree)).toContain('type="button"');
});

it("shows the original form values after retry succeeds and keeps them on background refetch errors", () => {
    for (const isError of [false, true]) {
        queryState({ data: definition, isError });
        const tree = EditChargeDefinitionModal({ chargeDefinitionId: 7 });
        const form = findElement(tree, Form);
        expect(form.props.formOptions).toEqual({ defaultValues: {
            name: "Anuidade", description: "", defaultAmount: 120, recurrenceType: "YEARLY",
            required: true, paymentAcceptancePolicy: "UNTIL_DUE_DATE", latePaymentGraceDays: undefined,
        } });
        expect(renderToStaticMarkup(tree)).not.toContain("Tentar novamente");
    }
});

it("preserves submission, mutation payload, invalidation and successful closure", async () => {
    queryState({ data: definition, isError: false });
    const tree = EditChargeDefinitionModal({ chargeDefinitionId: 7 });
    const values = { ...definition, defaultAmount: 150 };
    await (findElement(tree, Form).props.onSubmit as (value: unknown) => Promise<void>)(values);
    expect(mutateAsync).toHaveBeenCalledWith(values);
    const options = jest.mocked(useMutation).mock.calls[0][0];
    await options.mutationFn!(values, {} as never);
    expect(updateChargeDefinitionAction).toHaveBeenCalledWith(7, values);
    await options.onSuccess!(definition, values, undefined, {} as never);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["billing", "charge-definitions"] });
    expect(close).toHaveBeenCalledTimes(1);
});

it("retains Escape closure through the existing ModalRoot, including while an error is displayed", () => {
    const listeners = new EventTarget();
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    let cleanup: void | (() => void);
    const effect = jest.spyOn(React, "useEffect").mockImplementation((callback) => { cleanup = callback(); });
    Object.defineProperty(globalThis, "document", { configurable: true, value: listeners });
    try {
        renderToStaticMarkup(ModalRoot({
            isOpen: true, onClose: close, children: EditChargeDefinitionModal({ chargeDefinitionId: 7 }),
        }));
        const escape = new Event("keydown");
        Object.defineProperty(escape, "key", { value: "Escape" });
        listeners.dispatchEvent(escape);
        expect(close).toHaveBeenCalledTimes(1);
        cleanup!();
        listeners.dispatchEvent(escape);
        expect(close).toHaveBeenCalledTimes(1);
    } finally {
        effect.mockRestore();
        if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
        else Reflect.deleteProperty(globalThis, "document");
    }
});
