// Dados públicos. Não preencher estas variáveis com credenciais ou segredos.
export function getLegalContact() {
    return {
        controllerName: process.env.LEGAL_CONTROLLER_NAME?.trim() || "",
        controllerDocument: process.env.LEGAL_CONTROLLER_DOCUMENT?.trim() || "",
        controllerAddress: process.env.LEGAL_CONTROLLER_ADDRESS?.trim() || "",
        privacyEmail: process.env.LEGAL_PRIVACY_EMAIL?.trim() || "dpo@jeeptamoios.com.br",
        supportEmail: process.env.LEGAL_SUPPORT_EMAIL?.trim() || "",
    };
}
