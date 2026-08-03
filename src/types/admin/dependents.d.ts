interface Dependent {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  relationshipType: DependentRelationshipType;
  phoneNumber: string;
  medicalProfile: DependentMedicalProfile;
  consentAccepted: boolean;
  consentAcceptedAt: string;
  socioId: number;
  createdAt: string;
  updatedAt: string;
}

interface DependentMedicalProfile {
  bloodType: string | null;
  allergies: string | null;
  chronicDiseases: string | null;
  medications: string | null;
  medicalNotes: string | null;
}

type DependentRelationshipType =
  | 'CHILD'
  | 'GUEST'
  | 'OTHER'
  | 'PARENT'
  | 'SIBLING'
  | 'SPOUSE';


type GetListDependentsResponse = Array<Dependent>;