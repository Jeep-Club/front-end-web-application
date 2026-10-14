import { z } from 'zod';
import { isValidCPF } from '@/utils/validate/validateCPF';

export const relationshipSchema = z.enum(['CHILD', 'GUEST', 'OTHER', 'PARENT', 'SIBLING', 'SPOUSE']);

export const dependentResponseSchema: z.ZodType<MemberDependent> = z.object({
  id: z.number(), name: z.string(), cpf: z.string(), birthDate: z.string(),
  relationshipType: relationshipSchema, phoneNumber: z.string().nullable(),
  userId: z.number(), status: z.enum(['ACTIVE', 'DISABLED']),
  createdAt: z.string(), updatedAt: z.string().nullable(),
});
export const dependentsResponseSchema = z.array(dependentResponseSchema);

const optionalText = z.string().trim().max(2000, 'Máximo de 2000 caracteres');
export const createDependentFormSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome completo').max(150),
  cpf: z.string().refine(isValidCPF, 'Informe um CPF válido'),
  birthDate: z.string().min(1, 'Informe a data de nascimento').refine((value) => new Date(`${value}T12:00:00`) <= new Date(), 'A data não pode estar no futuro'),
  relationshipType: z.enum(['CHILD', 'GUEST', 'OTHER', 'PARENT', 'SIBLING', 'SPOUSE'], { error: 'Selecione o parentesco' }),
  phoneNumber: z.string().refine((value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')), 'Informe um telefone com DDD'),
  medicalProfile: z.object({
    bloodType: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'], { error: 'Selecione o tipo sanguíneo' }), allergies: optionalText, chronicDiseases: optionalText,
    medications: optionalText, medicalNotes: optionalText,
  }),
  consentAccepted: z.boolean().refine(Boolean, 'É necessário aceitar o consentimento'),
});
export const editDependentFormSchema = createDependentFormSchema.extend({
  cpf: z.string().refine((value) => /^\d{11}$/.test(value.replace(/\D/g, '')), 'CPF cadastrado inválido'),
});
