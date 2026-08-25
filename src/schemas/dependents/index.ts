import { z } from 'zod';
import { isValidCPF } from '@/utils/validate/validateCPF';
export const relationshipSchema=z.enum(['CHILD','GUEST','OTHER','PARENT','SIBLING','SPOUSE']);
const nt=z.string().nullable();
export const dependentResponseSchema:z.ZodType<MemberDependent>=z.object({id:z.number(),name:z.string(),cpf:z.string(),birthDate:z.string(),relationshipType:relationshipSchema,phoneNumber:z.string(),medicalProfile:z.object({bloodType:nt,allergies:nt,chronicDiseases:nt,medications:nt,medicalNotes:nt}),consentAccepted:z.boolean(),consentAcceptedAt:z.string().nullable(),socioId:z.number(),createdAt:z.string(),updatedAt:z.string()});
export const dependentsResponseSchema=z.array(dependentResponseSchema);
const optional=z.string().trim().max(1000,'Máximo de 1000 caracteres');
export const createDependentFormSchema=z.object({name:z.string().trim().min(3,'Informe o nome completo').max(150),cpf:z.string().refine(isValidCPF,'Informe um CPF válido'),birthDate:z.string().min(1,'Informe a data de nascimento').refine(v=>new Date(`${v}T12:00:00`)<=new Date(),'A data não pode estar no futuro'),relationshipType:relationshipSchema,phoneNumber:z.string().refine(v=>/^\d{10,11}$/.test(v.replace(/\D/g,'')),'Informe um telefone com DDD'),medicalProfile:z.object({bloodType:z.string().min(1,'Selecione o tipo sanguíneo'),allergies:optional,chronicDiseases:optional,medications:optional,medicalNotes:optional}),consentAccepted:z.boolean().refine(Boolean,'É necessário aceitar o consentimento')});
export const editDependentFormSchema=createDependentFormSchema.extend({cpf:z.string().refine(v=>/^\d{11}$/.test(v.replace(/\D/g,'')),'CPF cadastrado inválido')});
