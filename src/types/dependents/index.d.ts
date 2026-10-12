type MemberDependentRelationshipType = 'CHILD'|'GUEST'|'OTHER'|'PARENT'|'SIBLING'|'SPOUSE';
interface MemberDependent {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  relationshipType: MemberDependentRelationshipType;
  phoneNumber: string | null;
  userId: number;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string | null;
}
interface CreateMemberDependentRequest {
  name: string;
  cpf: string;
  birthDate: string;
  relationshipType: MemberDependentRelationshipType;
  phoneNumber: string;
}
interface CreateMemberDependentFormData extends CreateMemberDependentRequest {
  medicalProfile: {
    bloodType: MedicalProfileBloodType;
    allergies: string;
    chronicDiseases: string;
    medications: string;
    medicalNotes: string;
  };
  consentAccepted: boolean;
}
