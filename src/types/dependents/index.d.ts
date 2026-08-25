type MemberDependentRelationshipType = 'CHILD'|'GUEST'|'OTHER'|'PARENT'|'SIBLING'|'SPOUSE';
interface MemberDependentMedicalProfile { bloodType:string|null; allergies:string|null; chronicDiseases:string|null; medications:string|null; medicalNotes:string|null }
interface MemberDependent { id:number; name:string; cpf:string; birthDate:string; relationshipType:MemberDependentRelationshipType; phoneNumber:string; medicalProfile:MemberDependentMedicalProfile; consentAccepted:boolean; consentAcceptedAt:string|null; socioId:number; createdAt:string; updatedAt:string }
interface CreateMemberDependentRequest { name:string; cpf:string; birthDate:string; relationshipType:MemberDependentRelationshipType; phoneNumber:string; medicalProfile:{bloodType:string;allergies:string;chronicDiseases:string;medications:string;medicalNotes:string}; consentAccepted:boolean }
interface CreateMemberDependentFormData extends CreateMemberDependentRequest {}

