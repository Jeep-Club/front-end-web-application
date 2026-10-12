'use client';

import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useController, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HeartPulse, UserPlus, X } from 'lucide-react';
import { createDependentAction, getDependentMedicalProfileAction, saveDependentMedicalProfileAction, updateDependentAction } from '@/actions/dependents';
import { Button, ButtonIcon } from '@/components/common/button';
import { Form } from '@/components/common/form';
import { InputCheckbox } from '@/components/common/input/input-checkbox';
import { InputDate } from '@/components/common/input/input-date';
import { InputRegister } from '@/components/common/input/input-register';
import { SelectRegister } from '@/components/common/select/select-register';
import { TextareaRegister } from '@/components/common/textarea/textarea-register';
import { useModal } from '@/providers/ModalProvider';
import { createDependentFormSchema, editDependentFormSchema } from '@/schemas/dependents';
import { maskCPF, unMaskCPF } from '@/utils/masks/maskCPF';
import { maskPhoneNumber, unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';

const NOT_APPLICABLE = 'Não se aplica';
const light = '[&_label]:!text-j-gray-700 [&_input]:!border-j-gray-200 [&_input]:!bg-j-gray-100 [&_input]:!text-j-gray-700 [&_select]:!border-j-gray-200 [&_select]:!bg-j-gray-100 [&_select]:!text-j-gray-700 [&_textarea]:!border-j-gray-200 [&_textarea]:!bg-j-gray-100 [&_textarea]:!text-j-gray-700';

function localDateInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function DependentHealthField({ name, label, question, placeholder, multiline = false }: {
  name: 'medicalProfile.allergies' | 'medicalProfile.chronicDiseases' | 'medicalProfile.medications' | 'medicalProfile.medicalNotes';
  label: string;
  question: string;
  placeholder: string;
  multiline?: boolean;
}) {
  const { control } = useFormContext<CreateMemberDependentFormData>();
  const { field, fieldState } = useController({ name, control });
  const applies = field.value !== NOT_APPLICABLE;
  const choose = (hasCondition: boolean) => field.onChange(hasCondition ? '' : NOT_APPLICABLE);

  return <div className="flex flex-col gap-3 rounded-xl border border-j-gray-200 bg-j-white p-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <span className="text-sm font-bold text-j-gray-700">{question}</span>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-j-gray-100 p-1">
        <button type="button" onClick={() => choose(true)} className={`rounded-md px-4 py-1.5 text-xs font-extrabold transition-colors ${applies ? 'bg-j-blue-800 text-j-white shadow-sm' : 'text-j-gray-500 hover:bg-j-white'}`}>Sim</button>
        <button type="button" onClick={() => choose(false)} className={`rounded-md px-4 py-1.5 text-xs font-extrabold transition-colors ${!applies ? 'bg-j-blue-800 text-j-white shadow-sm' : 'text-j-gray-500 hover:bg-j-white'}`}>Não</button>
      </div>
    </div>
    {applies ? (multiline
      ? <TextareaRegister name={name} label={label} placeholder={placeholder} maxLength={2000} />
      : <InputRegister name={name} label={label} placeholder={placeholder} maxLength={2000} />)
      : <p className="text-xs font-semibold text-j-green-600">Marcado como “Não se aplica”.</p>}
    {fieldState.error && <p className="text-sm text-j-red-400">{fieldState.error.message}</p>}
  </div>;
}

function Fields({ dependent, isEdit, isSaving }: { dependent?: MemberDependent; isEdit: boolean; isSaving: boolean }) {
  const { formState, setValue } = useFormContext<CreateMemberDependentFormData>();

  useEffect(() => {
    if (!dependent) return;
    let active = true;
    getDependentMedicalProfileAction(dependent.id).then((profile) => {
      if (!active || !profile) return;
      setValue('medicalProfile.bloodType', profile.bloodType ?? 'UNKNOWN');
      setValue('medicalProfile.allergies', profile.allergies?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.chronicDiseases', profile.chronicConditions?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.medications', profile.continuousMedications?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.medicalNotes', profile.observations?.trim() || NOT_APPLICABLE);
    }).catch((error: Error) => toast.error(error.message));
    return () => { active = false; };
  }, [dependent, setValue]);

  return <>
    <section className="w-full"><h3 className="mb-3 font-extrabold text-j-blue-800">Dados pessoais</h3><div className={`grid gap-4 md:grid-cols-2 ${light}`}>
      <InputRegister name="name" label="Nome completo" required />
      <InputRegister name="cpf" label="CPF" mask={maskCPF} inputMode="numeric" disabled={isEdit} required />
      <InputDate name="birthDate" label="Data de nascimento" max={localDateInputValue()} required />
      <SelectRegister name="relationshipType" label="Parentesco" required><option value="">Selecione</option><option value="CHILD">Filho(a)</option><option value="SPOUSE">Cônjuge</option><option value="PARENT">Pai/Mãe</option><option value="SIBLING">Irmão/Irmã</option><option value="GUEST">Convidado(a)</option><option value="OTHER">Outro</option></SelectRegister>
      <InputRegister name="phoneNumber" label="Telefone" mask={maskPhoneNumber} inputMode="tel" required />
    </div></section>
    <section className="flex w-full flex-col gap-4 border-t border-j-gray-200 pt-5"><div className="flex items-center gap-2"><HeartPulse size={18} className="text-red-500"/><h3 className="font-extrabold text-j-blue-800">Perfil médico</h3></div>
      <div className={light}><SelectRegister name="medicalProfile.bloodType" label="Tipo sanguíneo"><option value="UNKNOWN">Não informado</option>{[['A_POSITIVE','A+'],['A_NEGATIVE','A-'],['B_POSITIVE','B+'],['B_NEGATIVE','B-'],['AB_POSITIVE','AB+'],['AB_NEGATIVE','AB-'],['O_POSITIVE','O+'],['O_NEGATIVE','O-']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</SelectRegister></div>
      <DependentHealthField name="medicalProfile.allergies" label="Quais alergias?" question="Possui alguma alergia?" placeholder="Ex.: dipirona, amendoim" />
      <DependentHealthField name="medicalProfile.chronicDiseases" label="Quais condições?" question="Possui alguma condição crônica?" placeholder="Ex.: asma, diabetes" />
      <DependentHealthField name="medicalProfile.medications" label="Quais medicamentos?" question="Usa medicamento contínuo?" placeholder="Informe medicamento, dose e frequência" />
      <DependentHealthField name="medicalProfile.medicalNotes" label="Observações médicas" question="Possui alguma observação médica adicional?" placeholder="Outras informações importantes" multiline />
    </section>
    <div className="w-full rounded-2xl bg-blue-50 p-4"><InputCheckbox name="consentAccepted" label="Confirmo que tenho autorização para cadastrar e tratar os dados deste dependente." className="[&_span:last-child]:!text-j-gray-700 [&_span:first-of-type]:!bg-j-white" />{formState.errors.consentAccepted && <p className="mt-2 text-sm text-j-red-400">{formState.errors.consentAccepted.message}</p>}</div>
    <Button type="submit" disabled={formState.isSubmitting || isSaving} className="w-full bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">{isSaving ? 'Salvando...' : 'Salvar dependente'}</Button>
  </>;
}

export function CreateDependentModal({ dependent }: { dependent?: MemberDependent }) {
  const { setClose } = useModal();
  const queryClient = useQueryClient();
  const isEdit = !!dependent;
  const mutation = useMutation({
    mutationFn: async (data: CreateMemberDependentFormData) => {
      const request: CreateMemberDependentRequest = { ...data, cpf: unMaskCPF(data.cpf), phoneNumber: unMaskPhoneNumber(data.phoneNumber) };
      const saved = isEdit ? await updateDependentAction(dependent.id, request) : await createDependentAction(request);
      try {
        const health = data.medicalProfile;
        await saveDependentMedicalProfileAction(saved.id, {
          bloodType: health.bloodType,
          allergies: health.allergies,
          chronicConditions: health.chronicDiseases,
          continuousMedications: health.medications,
          healthInsuranceProvider: '', healthInsurancePlan: '', healthInsuranceNumber: '',
          emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
          observations: health.medicalNotes,
        });
      } catch (error) {
        throw new Error(`Dependente ${isEdit ? 'atualizado' : 'cadastrado'}, mas não foi possível salvar o perfil médico: ${(error as Error).message}`);
      }
      return saved;
    },
    onSuccess: (saved) => { toast.success(isEdit ? 'Dependente atualizado com sucesso!' : 'Dependente cadastrado com sucesso!'); queryClient.invalidateQueries({ queryKey: ['dependents'] }); queryClient.invalidateQueries({ queryKey: ['dependent-medical-profile', saved.id] }); setClose(); },
    onError: (error) => toast.error(error.message || (isEdit ? 'Erro ao editar dependente.' : 'Erro ao cadastrar dependente.')),
  });

  const defaults: CreateMemberDependentFormData = {
    name: dependent?.name ?? '', cpf: dependent ? maskCPF(dependent.cpf) : '', birthDate: dependent?.birthDate ?? '',
    relationshipType: dependent?.relationshipType ?? 'OTHER', phoneNumber: dependent?.phoneNumber ? maskPhoneNumber(dependent.phoneNumber) : '',
    medicalProfile: { bloodType: 'UNKNOWN', allergies: NOT_APPLICABLE, chronicDiseases: NOT_APPLICABLE, medications: NOT_APPLICABLE, medicalNotes: NOT_APPLICABLE },
    consentAccepted: false,
  };

  return <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
    <ButtonIcon type="button" onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2"><X size={21} /></ButtonIcon>
    <header className="border-b border-j-gray-200 px-5 py-6 pr-16 md:px-8"><div className="flex gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><UserPlus size={20} /></span><div><h2 className="text-xl font-extrabold text-j-blue-800">{isEdit ? 'Editar dependente' : 'Incluir dependente'}</h2><p className="text-sm text-j-gray-500">{isEdit ? 'Atualize os dados da pessoa vinculada.' : 'Cadastre uma pessoa vinculada à sua associação.'}</p></div></div></header>
    <Form<CreateMemberDependentFormData> schema={isEdit ? editDependentFormSchema : createDependentFormSchema} onSubmit={(data) => mutation.mutateAsync(data)} onError={() => toast.error('Revise os campos destacados antes de salvar.')} formOptions={{ defaultValues: defaults }} className="gap-5 px-5 py-5 md:px-8"><Fields dependent={dependent} isEdit={isEdit} isSaving={mutation.isPending} /></Form>
  </div>;
}
