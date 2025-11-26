interface StampDutyPlayerData {
  fullName?: string;
  idCard?: string;
  email?: string;
}

interface DocsTypeDetail {
  section?: string;
  paymentChannel?: string;
  stampDutyBizPayer?: string;
  stampDutyPlayer?: StampDutyPlayerData;
  startDocsDate?: string;
  endDocsDate?: string;
  expireDocsDate?: string;
  isRenewal?: boolean;
  refDocs?: string;
  notificationRenewDocs?: string;

}
export interface OperatorDetail{
  name?: string;
  idCard?: string;
  email?: string;
  userName?: string;
  hasCa?: boolean;
  isInBusiness?: boolean;
  accountId?: string;
}

export interface UserListData {
  fullName?: string;
  idCard?: string;
  email?: string;
  userName?: string;
  hasCa?: boolean;
  isInBusiness?: boolean;
  accountId?: string;
  isSaved?:boolean;
  nationality?: string;
}

interface Approver {
  section?: string;
  approverType?: string; //external, internal
  attachment?: boolean;
  attachmentType?: any; // ไฟล์แนบ
  permissionType?: string; //signer, approver
  userList?: UserListData[];
}
interface ContractPartyDetail {
  taxId: string;
  operator: OperatorDetail;
  approvers?: Approver[];
}

interface ContractPartySection{
  section : string;
}
export interface DocsSetting {
  docsType?: string;
  docsTypeDetail: DocsTypeDetail;
  contractParty: ContractPartyDetail;
  // approvers?: ContractPartySection[];
}

