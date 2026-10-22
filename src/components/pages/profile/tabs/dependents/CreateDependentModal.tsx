'use client';

import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type DefaultValues, useController, useFormContext, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HeartPulse, ShieldCheck, UserPlus, X } from 'lucide-react';
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
import { InputFile } from '@/components/common/input/file';
import { DependentPhoto } from './DependentPhoto';
import { saveDependentWithPhotoAction, removeDependentPhotoAction } from '@/actions/dependents/photo';

const NOT_APPLICABLE = 'Não se aplica';
const light = '[&_button[aria-haspopup=dialog]]:!text-j-blue-800 [&_button[aria-haspopup=dialog]_svg]:!text-j-blue-800 [&_input]:!h-11 [&_input]:!py-2 [&_input]:!text-base [&_select]:!h-11 [&_select]:!py-2 [&_select]:!text-base [&_textarea]:!min-h-28 [&_textarea]:!py-3 [&_label]:!text-j-gray-700 [&_input]:!border-j-gray-200 [&_input]:!bg-j-gray-100 [&_input]:!text-j-gray-700 [&_select]:!border-j-gray-200 [&_select]:!bg-j-gray-100 [&_select]:!text-j-gray-700 [&_textarea]:!border-j-gray-200 [&_textarea]:!bg-j-gray-100 [&_textarea]:!text-j-gray-700';


function DependentHealthField({ name, label, question, placeholder }: {
  name: 'medicalProfile.allergies' | 'medicalProfile.chronicDiseases' | 'medicalProfile.medications' | 'medicalProfile.medicalNotes';
  label: string;
  question: string;
  placeholder: string;
}) {
  const { control } = useFormContext<CreateMemberDependentFormData>();
  const { field, fieldState } = useController({ name, control });
  const applies = field.value !== NOT_APPLICABLE;
  const choose = (hasCondition: boolean) => field.onChange(hasCondition ? '' : NOT_APPLICABLE);

  return <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-j-gray-200 bg-j-white p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold leading-relaxed text-j-gray-700 sm:text-sm">{question}</span>
      <div className="grid shrink-0 grid-cols-2 gap-1 rounded-lg bg-j-gray-100 p-1">
        <button type="button" onClick={() => choose(true)} className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-extrabold transition-colors ${applies ? 'bg-j-blue-800 text-j-white shadow-sm' : 'text-j-gray-500 hover:bg-j-white'}`}>Sim</button>
        <button type="button" onClick={() => choose(false)} className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-extrabold transition-colors ${!applies ? 'bg-j-blue-800 text-j-white shadow-sm' : 'text-j-gray-500 hover:bg-j-white'}`}>Não</button>
      </div>
    </div>
    {applies ? <TextareaRegister name={name} label={label} placeholder={placeholder} maxLength={2000} rows={3} className="min-h-28 resize-y px-3 !py-3" />
      : null}
    {fieldState.error && <p className="text-sm text-j-red-400">{fieldState.error.message}</p>}
  </div>;
}

function Fields({ dependent, isEdit, isSaving }: { dependent?: MemberDependent; isEdit: boolean; isSaving: boolean }) {
  const { formState, setValue, control } = useFormContext<CreateMemberDependentFormData>();
  const photo = useWatch({ control, name: 'photo' });
  const removePhoto = useWatch({ control, name: 'removePhoto' });

  useEffect(() => {
    if (!dependent) return;
    let active = true;
    getDependentMedicalProfileAction(dependent.id).then((profile) => {
      if (!active || !profile) return;
      if (profile.bloodType && profile.bloodType !== 'UNKNOWN') setValue('medicalProfile.bloodType', profile.bloodType);
      setValue('medicalProfile.allergies', profile.allergies?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.chronicDiseases', profile.chronicConditions?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.medications', profile.continuousMedications?.trim() || NOT_APPLICABLE);
      setValue('medicalProfile.medicalNotes', profile.observations?.trim() || NOT_APPLICABLE);
    }).catch((error: Error) => toast.error(error.message));
    return () => { active = false; };
  }, [dependent, setValue]);

  return <>
    <section
      className="w-full cursor-pointer rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-j-blue-800"
      tabIndex={0}
      aria-label="Selecionar foto do dependente"
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (!event.currentTarget.contains(target) || target.closest('button, input, a, [role="dialog"]')) return;
        event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]')?.click();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]')?.click();
      }}
    >
      <h3 className="mb-3 text-sm font-extrabold text-j-blue-800">Foto do dependente</h3>
      {dependent?.photoUrl && !removePhoto && !photo?.length && <div className="relative mb-3 w-fit">
        <DependentPhoto dependent={dependent} className="h-28 w-28 rounded-full text-xl" />
        <button type="button" aria-label="Remover foto atual do dependente" title="Remover foto" onClick={() => setValue('removePhoto', true, { shouldDirty: true })} className="absolute right-0 top-0 flex size-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md"><X size={20} /></button>
      </div>}
      {removePhoto && !photo?.length && <div className="mb-3 flex items-center justify-between gap-3 text-sm text-j-gray-600"><p>A foto será removida ao salvar.</p><button type="button" onClick={() => setValue('removePhoto', false)} className="font-bold text-j-blue-800">Desfazer</button></div>}
      <InputFile.Image name="photo" label="Selecionar foto (opcional)" maxFiles={1} maxSizeMB={5} cropShape="circle" className="[&_label]:font-semibold [&_label]:!text-j-gray-700 [&_p]:!text-j-gray-600 [&_svg]:!text-j-gray-400 [&>div]:!border-j-gray-200 [&>div]:!bg-j-white [&>div]:py-4" />
      <p className="mt-2 text-xs text-j-gray-500">JPEG, PNG ou WebP de até 5 MiB. Ajuste o enquadramento antes de salvar.</p>
    </section>
    <section className="w-full"><h3 className="mb-2 text-sm font-extrabold text-j-blue-800">Dados pessoais</h3><div className={`grid gap-3 sm:grid-cols-2 ${light}`}>
      <div className="min-w-0 sm:col-span-2">
        <InputRegister name="name" label="Nome completo" required />
      </div>
      <InputRegister name="cpf" label="CPF" mask={maskCPF} inputMode="numeric" disabled={isEdit} required />
      <InputDate name="birthDate" label="Data de nascimento" required />
      <SelectRegister name="relationshipType" label="Parentesco" required><option value="" disabled hidden>Selecione</option><option value="CHILD">Filho(a)</option><option value="SPOUSE">Cônjuge</option><option value="PARENT">Pai/Mãe</option><option value="SIBLING">Irmão/Irmã</option><option value="GUEST">Convidado(a)</option><option value="OTHER">Outro</option></SelectRegister>
      <InputRegister name="phoneNumber" label="Telefone" mask={maskPhoneNumber} inputMode="tel" required />
    </div></section>
    <section className="flex w-full flex-col gap-3 border-t border-j-gray-200 pt-3"><div className="flex items-center gap-2"><HeartPulse size={18} className="text-red-500"/><h3 className="font-extrabold text-j-blue-800">Perfil médico</h3></div>
      <div className={light}><SelectRegister name="medicalProfile.bloodType" label="Tipo sanguíneo" required><option value="" disabled hidden>Selecione</option>{[['A_POSITIVE','A+'],['A_NEGATIVE','A-'],['B_POSITIVE','B+'],['B_NEGATIVE','B-'],['AB_POSITIVE','AB+'],['AB_NEGATIVE','AB-'],['O_POSITIVE','O+'],['O_NEGATIVE','O-']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</SelectRegister></div>
      <div className={`grid gap-2 sm:grid-cols-2 ${light}`}>
      <DependentHealthField name="medicalProfile.allergies" label="Quais alergias?" question="Possui alguma alergia?" placeholder="Ex.: dipirona, amendoim" />
      <DependentHealthField name="medicalProfile.chronicDiseases" label="Quais condições?" question="Possui alguma condição crônica?" placeholder="Ex.: asma, diabetes" />
      <DependentHealthField name="medicalProfile.medications" label="Quais medicamentos?" question="Usa medicamento contínuo?" placeholder="Informe medicamento, dose e frequência" />
      <DependentHealthField name="medicalProfile.medicalNotes" label="Observações médicas" question="Possui alguma observação médica adicional?" placeholder="Outras informações importantes" />
      </div>
    </section>
    <section aria-labelledby="dependent-consent-title" className="w-full rounded-xl border border-j-blue-100 bg-j-blue-50/50 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300"><ShieldCheck size={19} aria-hidden="true" /></span>
        <div>
          <h3 id="dependent-consent-title" className="text-sm font-extrabold text-j-blue-800">Autorização de cadastro <span className="text-j-red-500" aria-hidden="true">*</span></h3>
          <p className="mt-1 text-xs leading-relaxed text-j-gray-600">Confirme a autorização para registrar as informações pessoais e médicas do dependente.</p>
        </div>
      </div>
      <InputCheckbox name="consentAccepted" required label="Tenho autorização para cadastrar e tratar os dados deste dependente." className="rounded-lg border border-j-gray-200 bg-j-white p-3 [&>span:last-child]:!text-j-gray-700 [&>span:last-child]:leading-relaxed [&>span:first-of-type]:border-j-gray-300 [&>span:first-of-type]:bg-j-white" />
      {formState.errors.consentAccepted && <p role="alert" className="mt-2 text-xs font-medium text-j-red-500">{formState.errors.consentAccepted.message}</p>}
    </section>
    <Button type="submit" disabled={formState.isSubmitting || isSaving} className="w-full bg-j-blue-700 text-j-white hover:bg-j-blue-800 hover:text-j-white">{isSaving ? 'Salvando...' : 'Salvar dependente'}</Button>
  </>;
}

export function CreateDependentModal({ dependent }: { dependent?: MemberDependent }) {
  const { setClose } = useModal();
  const queryClient = useQueryClient();
  const isEdit = !!dependent;
  const mutation = useMutation({
    mutationFn: async (data: CreateMemberDependentFormData) => {
      const request: CreateMemberDependentRequest = { name: data.name, cpf: unMaskCPF(data.cpf), phoneNumber: unMaskPhoneNumber(data.phoneNumber), birthDate: data.birthDate, relationshipType: data.relationshipType };
      const photo = data.photo?.[0];
      let saved: MemberDependent;
      if (photo) {
        const form = new FormData();
        form.set('dependent', JSON.stringify(request));
        form.set('photo', photo, photo.name);
        saved = await saveDependentWithPhotoAction(form, dependent?.id);
      } else {
        saved = isEdit ? await updateDependentAction(dependent.id, request) : await createDependentAction(request);
        if (isEdit && data.removePhoto && dependent.photoUrl) saved = await removeDependentPhotoAction(saved.id);
      }
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

  const defaults: DefaultValues<CreateMemberDependentFormData> = {
    name: dependent?.name ?? '', cpf: dependent ? maskCPF(dependent.cpf) : '', birthDate: dependent?.birthDate ?? '',
    relationshipType: dependent?.relationshipType, phoneNumber: dependent?.phoneNumber ? maskPhoneNumber(dependent.phoneNumber) : '',
    medicalProfile: { bloodType: undefined, allergies: NOT_APPLICABLE, chronicDiseases: NOT_APPLICABLE, medications: NOT_APPLICABLE, medicalNotes: NOT_APPLICABLE },
    consentAccepted: false,
    photo: [], removePhoto: false,
  };

  return <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
    <ButtonIcon type="button" onClick={setClose} className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2"><X size={21} /></ButtonIcon>
    <header className="border-b border-j-gray-200 px-4 py-4 pr-16 sm:px-6"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><UserPlus size={20} /></span><div><h2 className="text-lg font-extrabold sm:text-xl text-j-blue-800">{isEdit ? 'Editar dependente' : 'Incluir dependente'}</h2><p className="mt-1 text-xs leading-relaxed text-j-gray-500">{isEdit ? 'Atualize os dados da pessoa vinculada.' : 'Cadastre uma pessoa vinculada à sua associação.'}</p></div></div></header>
    <Form<CreateMemberDependentFormData> schema={isEdit ? editDependentFormSchema : createDependentFormSchema} onSubmit={(data) => mutation.mutateAsync(data)} onError={() => toast.error('Revise os campos destacados antes de salvar.')} formOptions={{ defaultValues: defaults }} className="items-stretch gap-3 px-4 py-4 sm:px-6"><Fields dependent={dependent} isEdit={isEdit} isSaving={mutation.isPending} /></Form>
  </div>;
}
