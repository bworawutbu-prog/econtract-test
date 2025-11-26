"use client"

  export interface CitizenSchema {
    id: string;
    first_name_th: string;
    middle_name_th?: string | null;
    last_name_th: string;
    first_name_eng?: string;
    middle_name_eng?: string | null;
    last_name_eng?: string;
    special_title_name_th?: string | null;
    account_title_th?: string;
    special_title_name_eng?: string | null;
    account_title_eng?: string;
    account_category?: string;
    account_sub_category?: string;
    status_cd?: string;
    tel_no?: string | null;
    name_on_document_th?: string | null;
    name_on_document_eng?: string | null;
    blockchain_flg?: string;
    nickname_eng?: string | null;
    nickname_th?: string | null;
    mobile_no?: string;
    email?: string;
    account_attribute?: string | null;
    username: string;
  }
  
  export type CitizenResponse = CitizenSchema[];