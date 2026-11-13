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

type AdminDependentStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

type AdminDependentLifecycleAction =
  | 'ENABLE'
  | 'DISABLE'
  | 'ARCHIVE'
  | 'UNARCHIVE';

interface AdminDependentItem {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  relationshipType: DependentRelationshipType;
  phoneNumber: string | null;
  userId: number;
  ownerName?: string | null;
  status: AdminDependentStatus;
  createdAt: string;
  updatedAt: string | null;
  archivedAt?: string | null;
  photoUrl?: string | null;
}

interface ListAdminDependentsResponse {
  content: AdminDependentItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface ListAdminDependentsParams {
  page?: number;
  size?: number;
  q?: string;
  name?: string;
  cpf?: string;
  userId?: number;
  relationshipType?: DependentRelationshipType;
  status?: AdminDependentStatus;
  sort?: string;
}
