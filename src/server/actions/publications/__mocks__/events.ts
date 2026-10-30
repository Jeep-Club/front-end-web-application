import { fn } from 'storybook/test';

/** Storybook manual module mock: prevents evaluating server-only auth imports, even before Query runs. */
export const listEventChargeCatalogAction = fn<typeof import('../events').listEventChargeCatalogAction>(async ({ page, size }) => ({
    content: [{ id: page + 4, name: 'Definição elegível', description: null, defaultAmount: 50, required: false, paymentAcceptancePolicy: 'AFTER_DUE_DATE' }],
    number: page, size, totalElements: 24, totalPages: 2, numberOfElements: 1, first: page === 0, last: page === 1, empty: false,
}));
