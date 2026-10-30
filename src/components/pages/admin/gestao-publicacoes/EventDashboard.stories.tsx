import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EventDashboard } from './EventDashboard';
const empty = { registrations: [], financial: [], dependents: 0, guestsPending: 0, guestsApproved: 0, totalPeople: 0, vehicles: 0, totalCapacity: 0, availableSeats: 0, unpaidCharges: 0, pendingValidation: 0, postCutoffPending: 0, guestsStandby: 0, guestsAllocated: 0, guestsCancelled: 0 };
const meta = { title: 'Publicações/Dashboard de evento', component: EventDashboard, args: { data: empty }, argTypes: { data: { control: 'object', description: 'Fatos do dashboard, distintos do estado editorial e do catálogo.' } } } satisfies Meta<typeof EventDashboard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Vazio: Story = {};
export const CanceladaEValidacao: Story = { args: { data: { ...empty, pendingValidation: 1, registrations: [{ id: 1, eventId: 7, userId: 7, status: 'CANCELLED', allocations: [], createdAt: '2026-10-30T12:00:00Z', confirmedAt: null, cancelledAt: '2026-10-30T12:00:00Z', unallocatedDependentIds: [] }], financial: [{ chargeDefinitionId: 4, userId: 7, memberChargeId: 30, effectiveStatus: 'OPEN', paymentStatus: 'PENDING_VALIDATION', paymentSubmittedAt: '2026-10-30T12:00:00Z', definitionName: 'Transporte e apoio aos participantes do passeio', amount: 150, chargeCycleId: 40, dueDate: null }] } } };
