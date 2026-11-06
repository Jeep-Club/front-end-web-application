'use server';
import { ActionError } from "@/utils/http/ActionError";

import { getMedicalProfileAction } from "@/server/actions/profile/medical-profile";
import { getUserProfileAction } from "@/server/actions/profile/get";
import { cookies } from "next/headers";

export async function completeFirstAccessOnboardingAction() {
    const [profile, medicalProfile] = await Promise.all([
        getUserProfileAction(),
        getMedicalProfileAction(),
    ]);
    if (!profile.profilePhotoUrl || !medicalProfile) {
        throw new ActionError("Adicione uma foto de perfil e preencha seus dados médicos antes de continuar.");
    }

    const cookieStore = await cookies();
    cookieStore.delete("FirstAccessOnboardingUserId");
    return { success: true };
}
