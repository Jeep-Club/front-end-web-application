'use client';

import Link from "next/link";
import { Button } from "@/components/common/button";
import { maskDate } from "@/utils/masks";

interface Props {
  canUpdate: boolean;
  medicalProfile: GetMedicalProfileResponse;
}

// Color and shadow styling inspired by the image
const cardStyle = "bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6";
const tagStyle = "px-3 py-1 text-xs font-bold rounded-md";

export default function AdminMedicalProfilePage({ canUpdate, medicalProfile }: Props) {
  return (
    <div className="bg-slate-100 min-h-screen p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Main Page Title - in the style of "Avisos" */}
        <h1 className="text-4xl font-bold text-slate-800 text-center mb-6">
          Perfil Médico
        </h1>

        <p className="text-slate-600 text-center -mt-8 mb-10 max-w-2xl mx-auto">
          Detalhes do perfil médico do usuário. Mantenha essas informações atualizadas para garantir a segurança e eficiência em qualquer eventualidade.
        </p>

        {/* Section 1: Core Information & Dates */}
        <div className={cardStyle}>
          <div className="flex justify-between items-start border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-1">
                Informações Principais
              </h2>
              <span className="text-slate-500 text-sm">
                ID do Perfil: {medicalProfile.id}
              </span>
            </div>
            
            {/* Blood Type as a prominent, "urgent" style tag */}
            <div className="flex items-center gap-4">
                <span className="text-slate-600 text-xl font-medium">Tipo Sanguíneo:</span>
                <span className="bg-red-600 text-white px-5 py-3 text-3xl font-bold rounded-full shadow-lg">
                  {medicalProfile.bloodType}
                </span>
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>Criado em: {maskDate(medicalProfile.createdAt)}</span>
            <span>Última atualização: {maskDate(medicalProfile.updatedAt)}</span>
          </div>
        </div>

        {/* Section 2: Medical Conditions & Allergies (2-column on md+) */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Allergies - "Novo Ponto" style card */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Alergias</h3>
              <span className={`${tagStyle} bg-yellow-400 text-slate-900`}>NOVÍSSIMO</span>
            </div>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {medicalProfile.allergies !== "string" ? medicalProfile.allergies : "Nenhuma alergia registrada."}
            </p>
          </div>

          {/* Chronic Conditions */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Condições Crônicas</h3>
              <span className={`${tagStyle} bg-slate-300 text-slate-900`}>ACOMPANHAMENTO</span>
            </div>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {medicalProfile.chronicConditions !== "string" ? medicalProfile.chronicConditions : "Nenhuma condição crônica registrada."}
            </p>
          </div>

        </div>

        {/* Section 3: Medications & Insurance (2-column on md+) */}
        <div className="grid md:grid-cols-2 gap-10">
            
            {/* Medications - "Kit de Primeiros" style card */}
            <div className={cardStyle}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-2xl font-bold text-slate-800">Medicações Contínuas</h3>
                <span className={`${tagStyle} bg-blue-100 text-blue-900`}>USO DIÁRIO</span>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {medicalProfile.continuousMedications !== "string" ? medicalProfile.continuousMedications : "Nenhuma medicação contínua registrada."}
              </p>
            </div>

            {/* Insurance details - More structured like a form */}
            <div className={cardStyle}>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-2xl font-bold text-slate-800">Plano de Saúde</h3>
                    <span className={`${tagStyle} bg-emerald-100 text-emerald-900`}>ATIVO</span>
                </div>
                <div className="flex flex-col gap-3 text-slate-600">
                    <p><strong className="font-semibold text-slate-800">Provedor:</strong> {medicalProfile.healthInsuranceProvider !== "string" ? medicalProfile.healthInsuranceProvider : '-'}</p>
                    <p><strong className="font-semibold text-slate-800">Plano:</strong> {medicalProfile.healthInsurancePlan !== "string" ? medicalProfile.healthInsurancePlan : '-'}</p>
                    <p><strong className="font-semibold text-slate-800">Número da Carteirinha:</strong> {medicalProfile.healthInsuranceNumber !== "string" ? medicalProfile.healthInsuranceNumber : '-'}</p>
                </div>
            </div>

        </div>

        {/* Section 4: Emergency Contact & Observations */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Emergency Contact */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Contato de Emergência</h3>
              <span className={`${tagStyle} bg-purple-100 text-purple-900`}>PRIMÁRIO</span>
            </div>
            <div className="flex flex-col gap-3 text-slate-600">
                <p><strong className="font-semibold text-slate-800">Nome:</strong> {medicalProfile.emergencyContactName !== "string" ? medicalProfile.emergencyContactName : '-'}</p>
                <p><strong className="font-semibold text-slate-800">Telefone:</strong> {medicalProfile.emergencyContactPhone !== "string" ? medicalProfile.emergencyContactPhone : '-'}</p>
                <p><strong className="font-semibold text-slate-800">Parentesco:</strong> {medicalProfile.emergencyContactRelationship !== "string" ? medicalProfile.emergencyContactRelationship : '-'}</p>
            </div>
          </div>

          {/* Observations */}
          <div className={cardStyle}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Observações</h3>
            </div>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {medicalProfile.observations !== "string" ? medicalProfile.observations : "Nenhuma observação registrada."}
            </p>
          </div>

        </div>

        {/* Action Button - If canUpdate, style like "Detalhes da Rota" */}
        {canUpdate && (
          <div className="flex justify-center md:justify-end mt-12 mb-10">
            <Link href={`/admin/medical-profile/${medicalProfile.id}/edit`}>
                <Button className="bg-slate-950 text-white font-bold px-12 py-4 text-lg rounded-md hover:bg-slate-800 shadow-lg transform hover:scale-105 transition duration-300">
                  Editar Perfil Médico
                </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
