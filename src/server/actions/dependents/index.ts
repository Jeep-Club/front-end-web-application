'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { dependentResponseSchema,dependentsResponseSchema } from '@/schemas/dependents';
import { medicalProfileResponseSchema } from '@/schemas/profile/medical-profile';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';
import { birthDateSchema } from '@/schemas/auth/user/birthDate';
async function listDependentsActionImpl():Promise<MemberDependent[]>{try{return(await actionFetchWrapper<MemberDependent[]>({url:HttpAPIRoutes.DEPENDENTS_MEMBER,method:'GET',schema:dependentsResponseSchema})).data}catch(error){throw new ActionError(extractApiErrorMessage(error,'Erro ao carregar dependentes'),{cause:error})}}
async function createDependentActionImpl(data:CreateMemberDependentRequest):Promise<MemberDependent>{birthDateSchema.parse(data.birthDate);try{return(await actionFetchWrapper<MemberDependent>({url:HttpAPIRoutes.DEPENDENTS_MEMBER,method:'POST',schema:dependentResponseSchema,body:JSON.stringify(data)})).data}catch(error){throw new ActionError(extractApiErrorMessage(error,'Erro ao cadastrar dependente'),{cause:error})}}
async function getDependentMedicalProfileActionImpl(id:number):Promise<MedicalProfile|null>{try{return(await actionFetchWrapper<MedicalProfile>({url:HttpAPIRoutes.MEDICAL_PROFILE_DEPENDENT.replace('{dependentId}',String(id)),method:'GET',schema:medicalProfileResponseSchema})).data}catch(error){if(error&&typeof error==='object'&&'status'in error&&error.status===404)return null;throw new ActionError(extractApiErrorMessage(error,'Erro ao carregar dados médicos do dependente'),{cause:error})}}
async function saveDependentMedicalProfileActionImpl(id:number,data:MedicalProfileRequest):Promise<MedicalProfile>{try{return(await actionFetchWrapper<MedicalProfile>({url:HttpAPIRoutes.MEDICAL_PROFILE_DEPENDENT.replace('{dependentId}',String(id)),method:'PUT',schema:medicalProfileResponseSchema,body:JSON.stringify(data)})).data}catch(error){throw new ActionError(extractApiErrorMessage(error,'Erro ao salvar dados médicos do dependente'),{cause:error})}}
async function updateDependentActionImpl(id:number,data:CreateMemberDependentRequest):Promise<MemberDependent>{birthDateSchema.parse(data.birthDate);try{return(await actionFetchWrapper<MemberDependent>({url:`${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`,method:'PUT',schema:dependentResponseSchema,body:JSON.stringify(data)})).data}catch(error){throw new ActionError(extractApiErrorMessage(error,'Erro ao editar dependente'),{cause:error})}}
async function deleteDependentActionImpl(id:number):Promise<void>{try{await actionFetchWrapper({url:`${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`,method:'DELETE',schema:z.union([z.literal(''),z.null()])})}catch(error){throw new ActionError(extractApiErrorMessage(error,'Erro ao excluir dependente'),{cause:error})}}


export async function listDependentsAction(...args: Parameters<typeof listDependentsActionImpl>) {
    return captureAction(() => listDependentsActionImpl(...args));
}


export async function createDependentAction(...args: Parameters<typeof createDependentActionImpl>) {
    return captureAction(() => createDependentActionImpl(...args));
}


export async function getDependentMedicalProfileAction(...args: Parameters<typeof getDependentMedicalProfileActionImpl>) {
    return captureAction(() => getDependentMedicalProfileActionImpl(...args));
}


export async function saveDependentMedicalProfileAction(...args: Parameters<typeof saveDependentMedicalProfileActionImpl>) {
    return captureAction(() => saveDependentMedicalProfileActionImpl(...args));
}


export async function updateDependentAction(...args: Parameters<typeof updateDependentActionImpl>) {
    return captureAction(() => updateDependentActionImpl(...args));
}


export async function deleteDependentAction(...args: Parameters<typeof deleteDependentActionImpl>) {
    return captureAction(() => deleteDependentActionImpl(...args));
}
