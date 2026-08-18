interface CreateDependentRequest {
  name: string;
  cpf: string;
  birthDate?: string;
  relationshipType: DependentRelationshipType;
  phoneNumber?: string;
  consentAccepted: boolean;
}

type CreateDependentFormData = CreateDependentRequest;

type CreateDependentResponse = Dependent;
