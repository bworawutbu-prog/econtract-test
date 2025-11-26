export interface GroupCreateType {
    name: string
    business_contact: BusinessContactType[]
  }
  
  export interface BusinessContactType {
    index: number
    business_id: string
  }

  export interface GroupResponseType {
    name: string
    business_id: string
    business_contact: BusinessContact[]
    created_by: string
    updated_by: string
    _id: string
    created_at: string
    updated_at: string
    __v: number
    template_count?: number
  }
  
  export interface BusinessContact {
    index: number
    business_id: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
    _id: string
    tax_id: string
    name_on_document_th: string
    name_on_document_eng: string
  }

  export interface CreateGroupPayload {
    name: string
    business_contact: BusinessContactType[]
  }

  export interface UpdateGroupPayload {
    old_name: string
    new_name: string
    business_contact: BusinessContactType[]
  }

  export interface SearchBusinessResponseType {
    business_id: string
    name_on_document_th: string
    name_on_document_eng: string
    name_th: string
    name_eng: string
    type: string
  }

  export interface CreateDocumentTypePayload {
    name: string
    code: string
    form_estamp_id?: string
  }

  export interface FormEstampType {
    _id: string
    name: string
  }

  export interface DocumentTypeResponseType {
    _id: string
    name: string
    code: string
    form_estamp: FormEstampType | null
    business_id: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
    __v: number
    template_count?: number
  }

  /**
   * Template item from API response
   * GET /document-types/:id/templates
   */
  export interface TemplateItemType {
    id: string
    document_no: string
    name: string
    created_at: string
    updated_at: string
  }

  /**
   * Response type for getTemplatesByDocumentTypeId API
   */
  export interface TemplatesByDocumentTypeResponseType {
    status: boolean
    message: string
    data: TemplateItemType[]
    total?: number
    page?: number
    limit?: number
  }