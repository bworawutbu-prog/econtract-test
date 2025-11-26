export interface WorkspaceCreateType {
    name: string
    // business_id: string
    group_id: string
    permission: Permission[]
  }
  
  export interface Permission {
    index: number
    email: string
    account_id: string
  }

  export interface WorkspaceCreateResponseType {
    workspace: Workspace
    permission_results: PermissionResults
  }
  
  export interface Workspace {
    name?: string
    new_name?: string
    old_name?: string
    business_id?: string
    group_id: string
    permission: Permission[]
    created_by?: string
    updated_by?: string
    _id?: string
    created_at?: string
    updated_at?: string
    __v?: number
  }
  
  export interface PermissionResults {
    success_accounts: string[]
    failed_accounts: any[]
  }

  export interface WorkspaceResponseType {
    _id: string
    name: string
    business_id?: string
    group_id?: string
    form_total: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
  }
