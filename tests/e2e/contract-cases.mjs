import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { z, page, load } = require('./schema-runtime.cjs');

export function auditCases(seed) {
    const own = seed.member.session.accessToken;
    const root = seed.admin.accessToken;
    const auth = load('auth/me/me');
    const tools = load('tools/detail');
    const medical = load('profile/medical-profile');
    const billing = load('billing/management');
    const role = load('authorization/detail');
    const cases = [
        ['session', 'authentication/me', auth.meResponseSchema, own],
        ['identity', 'identity/me', auth.identityMeResponseSchema, own],
        ['authorization', 'authorization/me', auth.authorizationMeResponseSchema, own],
        ['users-page', 'identity/admin/users?size=50', load('admin/users').adminUserListResponseSchema, root],
        ['admin-user', `identity/admin/users/${seed.firstAccess.userId}`, load('admin/users').adminUserSchema, root],
        ['sessions', `authentication/admin/users/${seed.member.userId}/sessions`, z.array(load('admin/security').sessionSchema), root],
        ['refresh-tokens', `authentication/admin/users/${seed.member.userId}/refresh-tokens`, z.array(load('admin/security').refreshTokenSchema), root],
        ['recovery-requests', `authentication/admin/password-recovery/requests/users/${seed.member.userId}`, z.array(load('admin/security').passwordRecoveryRequestSchema), root],
        ['roles', 'authorization/roles', z.array(role.roleResponseSchema), root],
        ['archived-role', `authorization/roles/${seed.archivedRole.id}`, role.roleResponseSchema, root],
        ['permissions', 'authorization/permissions', load('authorization/permission').permissionListResponseSchema, root],
        ['user-roles', `authorization/users/${seed.reader.userId}/roles`, z.array(role.roleResponseSchema), root],
        ['role-permissions', `authorization/roles/${seed.reader.role.id}/permissions`, load('authorization/permission').permissionListResponseSchema, root],
        ['member-tools', 'tools?size=50', load('tools/list').listToolsResponseSchema, own],
        ['archived-tool', `tools/${seed.tool.id}`, tools.toolDetailResponseSchema, own],
        ['admin-tools', 'admin/tools?size=50', load('admin/tools').listAdminToolsResponseSchema, root],
        ['vehicles', 'vehicles/list/member?size=50', load('vehicles/list').listVehicleMemberResponseSchema, own],
        ['archived-vehicle', `vehicles/detail/member/${seed.vehicle.id}`, load('vehicles/detail').vehicleDetailResponseSchema, own],
        ['vehicle-edit', `vehicles/detail-for-edit/member/${seed.vehicle.id}`, load('vehicles/detail-for-edit').vehicleDetailForEditResponseSchema, own],
        ['admin-vehicles', 'vehicles/list/admin?size=50', load('vehicles/list').listVehicleMemberResponseSchema, root],
        ['dependents', 'dependents', load('dependents').dependentsResponseSchema, own],
        ['medical', 'medical-profiles/me', medical.medicalProfileResponseSchema, own],
        ['dependent-medical', `medical-profiles/dependents/${seed.dependent.id}`, medical.medicalProfileResponseSchema, own],
        ['medical-summary', 'admin/medical-profiles?size=50', load('admin/medical-profile').getAllMedicalProfilesResponseSchema, root],
        ['medical-detail', `admin/medical-profiles/${seed.medical.id}`, load('admin/medical-profile').getMedicalProfileResponseSchema, root],
        ['definitions', 'billing/charge-definitions?size=50', page(load('billing/chargeDefinition').chargeDefinitionSummaryResponseSchema), root],
        ['definition', `billing/charge-definitions/${seed.definition.id}`, load('billing/chargeDefinition').chargeDefinitionResponseSchema, root],
        ['assignments', `billing/charge-definitions/${seed.definition.id}/assignments`, page(load('billing/chargeAssignment').chargeAssignmentResponseSchema), root],
        ['cycles', `billing/charge-definitions/${seed.definition.id}/cycles`, page(billing.cycleSchema), root],
        ['cycle', `billing/charge-cycles/${seed.cycle.id}`, billing.cycleSchema, root],
        ['charges', `billing/member-charges?userId=${seed.member.userId}&size=50`, page(billing.chargeSchema), root],
        ['member-charges', 'billing/me/member-charges?size=50', page(load('billing/memberCharge').memberChargeSummaryResponseSchema), own],
        ['charge', `billing/member-charges/${seed.charge.id}`, billing.chargeSchema, root],
        ['payments', 'billing/member-payments?size=50', load('payments').paymentPageSchema, root],
        ['payment', `billing/member-payments/${seed.payment.id}`, load('payments').paymentDetailSchema, root],
        ['refunds', 'billing/member-refunds?size=50', page(billing.refundSchema), root],
        ['refund', `billing/member-refunds/${seed.refund.id}`, billing.refundSchema, root],
        ['membership-applications', 'admin/membership-applications?size=50', load('membership/application').membershipApplicationPageSchema, root],
        ['feed', 'publications/feed?size=50', page(load('publications/feed').publicationFeedItemSchema), own],
        ['notice-detail', `publications/${seed.notice.id}`, load('publications/feed').publicationFeedDetailSchema, own],
        ['event-detail', `publications/${seed.event.id}`, load('publications/feed').publicationFeedDetailSchema, own],
        ['service-detail', `publications/${seed.service.id}`, load('publications/feed').publicationFeedDetailSchema, own],
        ['admin-notice', `admin/notices/${seed.notice.id}`, load('publications/admin').adminPublicationSchema, root],
        ['admin-service', `admin/services/${seed.service.id}`, load('publications/admin').adminPublicationSchema, root],
        ['admin-event', `admin/events/${seed.event.id}`, load('publications/admin').adminEventSchema, root],
        ['admin-events', 'admin/events?size=48', page(load('publications/admin').adminEventSchema), root],
        ['pending-service-requests', 'admin/service-publication-requests?status=PENDING&size=48', page(load('publications/admin').pendingServiceRequestSchema), root],
        ['comments', `publications/${seed.notice.id}/comments?size=48`, page(load('publications/feed').publicationCommentSchema), own],
        ['event-registration', `events/${seed.event.id}/registrations/me`, load('publications/event-registration').eventRegistrationSchema, own],
    ];
    return cases.map(([name, route, schema, token]) => ({ name, route, schema, token }));
}

