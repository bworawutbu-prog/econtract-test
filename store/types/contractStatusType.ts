export interface ContractApiResponse {
  status: boolean;
  message: string;
  data: ContractData;
}

export interface ContractData {
  is_verified: boolean;
  owner_contract: OwnerContract;
  co_contract: CoContract;
}

export interface Business {
  id: string;
  tax_id: string;
  trust_level: string;
  has_ca: boolean;
  has_seal: boolean;
  name_on_document_th: string;
  name_on_document_eng: string;
}

export interface Participant {
  index: number;
  id: string;
  name: string;
  email: string;
  id_card: string;
  has_ca: boolean;
  is_in_business: boolean;
}

export interface OwnerContract {
  business: Business;
  participant_list: Participant[];
}

export interface CoContract {
  business: Business;
  operator: Operator;
  participant_list: Participant[];
}

export interface Operator {
  name: string;
  email: string;
  id_card: string;
}
