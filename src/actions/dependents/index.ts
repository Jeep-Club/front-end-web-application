'use server';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { dependentResponseSchema,dependentsResponseSchema } from '@/schemas/dependents';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';
export async function listDependentsAction():Promise<MemberDependent[]>{try{return(await actionFetchWrapper<MemberDependent[]>({url:HttpAPIRoutes.DEPENDENTS_MEMBER,method:'GET',schema:dependentsResponseSchema})).data}catch(error){throw new Error(extractApiErrorMessage(error,'Erro ao carregar dependentes'),{cause:error})}}
export async function createDependentAction(data:CreateMemberDependentRequest):Promise<MemberDependent>{try{return(await actionFetchWrapper<MemberDependent>({url:HttpAPIRoutes.DEPENDENTS_MEMBER,method:'POST',schema:dependentResponseSchema,body:JSON.stringify(data)})).data}catch(error){throw new Error(extractApiErrorMessage(error,'Erro ao cadastrar dependente'),{cause:error})}}
export async function updateDependentAction(id:number,data:CreateMemberDependentRequest):Promise<MemberDependent>{try{return(await actionFetchWrapper<MemberDependent>({url:`${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`,method:'PUT',schema:dependentResponseSchema,body:JSON.stringify(data)})).data}catch(error){throw new Error(extractApiErrorMessage(error,'Erro ao editar dependente'),{cause:error})}}
export async function deleteDependentAction(id:number):Promise<void>{try{await actionFetchWrapper({url:`${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`,method:'DELETE',schema:z.union([z.literal(''),z.null()])})}catch(error){throw new Error(extractApiErrorMessage(error,'Erro ao excluir dependente'),{cause:error})}}