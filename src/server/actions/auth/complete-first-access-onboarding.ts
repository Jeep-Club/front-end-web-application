'use server';
import { ActionError } from "@/utils/http/ActionError";

import { getMedicalProfileAction } from "@/server/actions/profile/medical-profile";
import { listVehiclesMemberAction } from "@/server/actions/vehicles/list-member";
import { cookies } from "next/headers";

export async function completeFirstAccessOnboardingAction() {
    const [vehicles, medicalProfile] = await Promise.all([
        listVehiclesMemberAction({ page: 0, size: 1 }),
        getMedicalProfileAction(),
    ]);
    if (vehicles.content.length === 0 || !medicalProfile) {
        throw new ActionError("Cadastre pelo menos um veículo e seus dados médicos antes de continuar.");
    }

    const cookieStore = await cookies();
    cookieStore.delete("FirstAccessOnboardingUserId");
    return { success: true };
}
