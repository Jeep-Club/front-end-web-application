'use server';

import { cookies } from "next/headers";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { getMedicalProfileAction } from "@/actions/profile/medical-profile";

export async function completeFirstAccessOnboardingAction() {
    const [vehicles, medicalProfile] = await Promise.all([
        listVehiclesMemberAction({ page: 0, size: 1 }),
        getMedicalProfileAction(),
    ]);
    if (vehicles.content.length === 0 || !medicalProfile) {
        throw new Error("Cadastre pelo menos um veículo e seus dados médicos antes de continuar.");
    }

    const cookieStore = await cookies();
    cookieStore.delete("FirstAccessOnboardingUserId");
    return { success: true };
}
