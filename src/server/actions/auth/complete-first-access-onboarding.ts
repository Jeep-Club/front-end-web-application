'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { cookies } from "next/headers";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { getMedicalProfileAction } from "@/actions/profile/medical-profile";

async function completeFirstAccessOnboardingActionImpl() {
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


export async function completeFirstAccessOnboardingAction(...args: Parameters<typeof completeFirstAccessOnboardingActionImpl>) {
    return captureAction(() => completeFirstAccessOnboardingActionImpl(...args));
}
