type MemberDependentRelationshipType = 'CHILD'|'GUEST'|'OTHER'|'PARENT'|'SIBLING'|'SPOUSE';
interface MemberDependent {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  relationshipType: MemberDependentRelationshipType;
  phoneNumber: string | null;
  userId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  photoUrl?: string | null;
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
  photo?: File[];
  removePhoto?: boolean;
  medicalProfile: {
    bloodType: MedicalProfileBloodType;
    allergies: string;
    chronicDiseases: string;
    medications: string;
    medicalNotes: string;
  };
  consentAccepted: boolean;
}
