import { localApi, fakeCpf, testPng } from './local-api.mjs';
import { fileURLToPath } from 'node:url';

/** All writes go through domain APIs; no direct inserts or permission bypasses. */
export async function seedContractAudit() {
    const local = await localApi();
    const { api, admin } = local;
    const root = admin.accessToken;
    const run = `E2E-CONTRACT-${Date.now()}`;
    const permissions = await api('authorization/permissions', { token: root });
    async function account(label, codes = [], { pending = false, minimal = false } = {}) {
        const cpf = fakeCpf();
        const created = await api('identity/admin/users', { method: 'POST', token: root, body: {
            name: `${run} ${label}`, cpf, email: minimal ? null : `${label.toLowerCase()}.${Date.now()}@example.test`,
            birthDate: minimal ? null : '1990-05-12', rg: null, phoneNumber: minimal ? null : '12999999999', activationMethod: 'TEMPORARY_PASSWORD',
        } });
        let role;
        if (codes.length) {
            role = await api('authorization/roles', { method: 'POST', token: root, body: { name: `${run}-${label}`, description: null } });
            for (const code of codes) {
                const permission = permissions.find(item => item.code === code);
                if (!permission) throw new Error(`Permission not registered by backend: ${code}`);
                await api(`authorization/roles/${role.id}/permissions/${permission.id}`, { method: 'POST', token: root });
            }
            await api(`authorization/users/${created.userId}/roles/${role.id}`, { method: 'POST', token: root });
        }
        const user = { userId: created.userId, cpf, password: `Audit!${Date.now()}a`, temporaryPassword: created.temporaryPassword, role, name: `${run} ${label}` };
        if (!pending) {
            const challenge = await api('authentication/login', { method: 'POST', body: { cpf, senha: created.temporaryPassword } });
            user.session = await api('authentication/login/password-change', { method: 'POST', body: { passwordChangeToken: challenge.passwordChangeToken, newPassword: user.password } });
        }
        return user;
    }
    const readerCodes = ['IDENTITY_USER_READ', 'AUTHORIZATION_ROLE_READ', 'AUTHORIZATION_PERMISSION_READ', 'AUTHORIZATION_USER_ROLE_READ', 'TOOLS_TOOL_READ', 'VEHICLES_VEHICLE_READ', 'HEALTH_MEDICAL_PROFILE_READ', 'BILLING_CHARGE_DEFINITION_READ', 'BILLING_CHARGE_CYCLE_READ', 'BILLING_MEMBER_CHARGE_READ', 'BILLING_PAYMENT_READ', 'BILLING_REFUND_READ', 'PUBLICATIONS_FEED_READ', 'PUBLICATIONS_PUBLICATION_READ', 'PUBLICATIONS_NOTICE_READ'];
    const reader = await account('Reader', readerCodes);
    const writer = await account('Writer', ['HEALTH_MEDICAL_PROFILE_UPDATE', 'BILLING_PAYMENT_CONFIRM']);
    const member = await account('Member', ['PUBLICATIONS_FEED_READ', 'PUBLICATIONS_PUBLICATION_READ', 'PUBLICATIONS_INTERACTION_LIKE', 'PUBLICATIONS_COMMENT_READ', 'PUBLICATIONS_COMMENT_CREATE', 'PUBLICATIONS_SERVICE_REQUEST_CREATE', 'PUBLICATIONS_EVENT_REGISTER', 'PUBLICATIONS_EVENT_REGISTRATION_READ', 'PUBLICATIONS_EVENT_REGISTRATION_CANCEL']);
    const unprivileged = await account('NoPermissions');
    const firstAccess = await account('FirstAccess', [], { pending: true, minimal: true });
    const own = member.session.accessToken;
    const tool = await api('tools', { method: 'POST', token: own, body: { name: `${run} tool`, description: null } });
    await api(`tools/${tool.id}/archive`, { method: 'PATCH', token: own });
    const medical = await api('medical-profiles/me', { method: 'PUT', token: own, body: {} });
    const dependent = await api('dependents', { method: 'POST', token: own, body: { name: `${run} dependent`, cpf: fakeCpf(), birthDate: '2010-05-12', relationshipType: 'CHILD', phoneNumber: '12999999999' } });
    const dependentMedical = await api(`medical-profiles/dependents/${dependent.id}`, { method: 'PUT', token: own, body: {} });
    const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
    const mod = digits.reduce((sum, n, i) => sum + n * [3, 2, 9, 8, 7, 6, 5, 4, 3, 2][i], 0) * 10 % 11;
    const renavam = digits.join('') + (mod === 10 ? 0 : mod);
    const plate = `Z${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    await api('vehicles/include/member', { method: 'POST', token: own, body: { nickname: null, plate, renavam, brand: 'Jeep', model: 'E2E', manufacturingYear: 2020, modelYear: 2021, color: 'Verde', seatingCapacity: 5, fuelType: 'DIESEL', engineDisplacement: 2, towing: false } });
    const vehicle = (await api('vehicles/list/member?size=50', { token: own })).content.find(item => item.plate === plate);
    await api(`vehicles/archive/member/${vehicle.id}`, { method: 'PATCH', token: own });
    const definition = await api('billing/charge-definitions', { method: 'POST', token: root, body: { name: run, description: null, defaultAmount: 25, recurrenceType: 'ONE_TIME', required: false, paymentAcceptancePolicy: 'AFTER_DUE_DATE', latePaymentGraceDays: null } });
    const assignment = await api(`billing/charge-definitions/${definition.id}/assignments/users/${member.userId}`, { method: 'POST', token: root });
    const generated = await api(`billing/charge-definitions/${definition.id}/cycles`, { method: 'POST', token: root, body: { code: run, dueDate: '2030-12-31' } });
    const charges = await api(`billing/me/member-charges?size=50`, { token: own });
    const charge = charges.content.find(item => item.chargeDefinitionId === definition.id);
    const receipt = new FormData();
    receipt.set('amount', '25'); receipt.set('paymentMethod', 'PIX'); receipt.set('paidAt', new Date().toISOString()); receipt.set('receiptFile', new Blob([testPng], { type: 'image/png' }), 'receipt.png');
    const payment = await api(`billing/member-charges/${charge.id}/payments`, { method: 'POST', token: own, body: receipt });
    const refundDefinition = await api('billing/charge-definitions', { method: 'POST', token: root, body: { name: `${run}-refund`, description: null, defaultAmount: 25, recurrenceType: 'ONE_TIME', required: false, paymentAcceptancePolicy: 'AFTER_DUE_DATE', latePaymentGraceDays: null } });
    await api(`billing/charge-definitions/${refundDefinition.id}/assignments/users/${member.userId}`, { method: 'POST', token: root });
    const refundCycle = await api(`billing/charge-definitions/${refundDefinition.id}/cycles`, { method: 'POST', token: root, body: { code: `${run}-refund`, dueDate: '2030-12-31' } });
    const refundCharge = (await api('billing/me/member-charges?size=50', { token: own })).content.find(item => item.chargeDefinitionId === refundDefinition.id);
    const refundablePayment = await api(`billing/member-charges/${refundCharge.id}/payments`, { method: 'POST', token: own, body: receipt });
    await api(`billing/member-payments/${refundablePayment.id}/confirm`, { method: 'PATCH', token: root });
    await api(`billing/charge-cycles/${refundCycle.chargeCycle.id}/cancel`, { method: 'PATCH', token: root });
    const refund = (await api(`billing/charge-cycles/${refundCycle.chargeCycle.id}/member-refunds`, { token: root })).content[0];
    const image = new FormData(); image.set('file', new Blob([testPng], { type: 'image/png' }), 'test.png');
    const uploaded = await api('media/images', { method: 'POST', token: root, body: image });
    const notice = await api('admin/notices', { method: 'POST', token: root, body: { title: run, content: 'Conteúdo fictício do teste de contrato.', images: [{ storageKey: uploaded.storageKey, position: 0, primary: true }] } });
    await api(`admin/notices/${notice.id}/publish`, { method: 'POST', token: root });
    const event = await api('admin/events', { method: 'POST', token: root, body: { title: `${run} event`, content: 'Evento fictício para testes.', images: [{ storageKey: uploaded.storageKey, position: 0, primary: true }], startsAt: '2030-06-10T10:00:00Z', endsAt: null, charges: [] } });
    await api(`admin/events/${event.id}/publish`, { method: 'POST', token: root });
    await api(`events/${event.id}/registrations`, { method: 'POST', token: own, body: { allocations: [], dependentIds: [] } });
    await api(`publications/${notice.id}/comments`, { method: 'POST', token: own, body: { text: 'Comentário fictício do teste de contrato.', images: [] } });
    const serviceRequest = await api('service-publication-requests', { method: 'POST', token: own, body: { title: `${run} service`, content: 'Serviço fictício para testes.', amount: 10, contactPhone: '12999999999', images: [{ storageKey: uploaded.storageKey, position: 0, primary: true }] } });
    const approvedService = await api(`admin/service-publication-requests/${serviceRequest.id}/approve`, { method: 'POST', token: root });
    const service = { id: approvedService.createdPublicationId };
    await api('service-publication-requests', { method: 'POST', token: own, body: { title: `${run} pending service`, content: 'Solicitação fictícia pendente.', amount: 10, contactPhone: '12999999999', images: [{ storageKey: uploaded.storageKey, position: 0, primary: true }] } });
    const application = await api('membership-applications', { method: 'POST', body: { name: `${run} applicant`, cpf: fakeCpf(), email: null, phoneNumber: '12999999999', message: null } });
    const archivedRole = await api('authorization/roles', { method: 'POST', token: root, body: { name: `${run}-Archived`, description: null } });
    await api(`authorization/roles/${archivedRole.id}/archive`, { method: 'PATCH', token: root });
    console.log(`Contract audit seed: ${JSON.stringify({ users: [reader.userId, writer.userId, member.userId, unprivileged.userId, firstAccess.userId], tool: tool.id, vehicle: vehicle.id, medical: medical.id, definition: definition.id, payment: payment.id })}`);
    return { ...local, run, reader, writer, member, unprivileged, firstAccess, tool, medical, dependent, dependentMedical, vehicle, definition, assignment, cycle: generated.chargeCycle, charge, payment, refund, notice, event, service, application, archivedRole, permissions };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await seedContractAudit();

