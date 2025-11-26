"use client"

import { BusinessContact, GroupResponseType, SearchBusinessResponseType } from "../types/groupType";

export interface GroupItem {
    key: string;
    label: string;
  }
  
  export const groupData: GroupItem[] = [
    { key: "1", label: "กลุ่ม : ทำสัญญากลุ่มการลงทะเบียนประกัน 1" },
    { key: "2", label: "กลุ่ม : ทำสัญญากลุ่มการลงทะเบียนประกัน 2" },
    { key: "3", label: "กลุ่ม : ทำสัญญากลุ่มการลงทะเบียนประกัน 3" },
    { key: "4", label: "กลุ่ม : ชมรมคนชอบกีฬา แห่งประเทศไทย" },
  ]; 

  export const groupData2: GroupResponseType[] = [
        {
            _id: "68a58b3426f5fed8b0fd109a",
            name: "กลุ่มทดสอบ 1",
            business_id: "175128061064325",
            business_contact: [
                {
                    index: 0,
                    business_id: "44832785100809091",
                    created_by: "348230124226402",
                    updated_by: "348230124226402",
                    created_at: "2025-08-20T08:45:40.897Z",
                    updated_at: "2025-08-20T08:45:40.897Z",
                    _id: "68a58b3426f5fed8b0fd109b",
                    tax_id: "0202233445566",
                    name_on_document_th: "บริษัท บริษัท โพรเทคดาต้า จำกัด จำกัด",
                    name_on_document_eng: "ProtectData Co., Ltd. Co., Ltd."
                },
                {
                    index: 1,
                    business_id: "175128061064325",
                    created_by: "348230124226402",
                    updated_by: "348230124226402",
                    created_at: "2025-08-20T08:45:40.897Z",
                    updated_at: "2025-08-20T08:45:40.897Z",
                    _id: "68a58b3426f5fed8b0fd109c",
                    tax_id: "0808899001122",
                    name_on_document_th: "บริษัท ซีเคียวโค้ด จำกัด",
                    name_on_document_eng: "SecureCode CO., LTD."
                }
            ],
            created_by: "348230124226402",
            updated_by: "348230124226402",
            created_at: "2025-08-20T08:45:40.930Z",
            updated_at: "2025-08-20T08:45:40.930Z",
            __v: 0
        },
        {
            _id: "68a5910326f5fed8b0fd14f0",
            name: "กลุ่มทดสอบ 4",
            business_id: "175128061064325",
            business_contact: [
                {
                    index: 0,
                    business_id: "175128061064325",
                    created_by: "348230124226402",
                    updated_by: "348230124226402",
                    created_at: "2025-08-20T09:10:27.441Z",
                    updated_at: "2025-08-20T09:10:27.441Z",
                    _id: "68a5910326f5fed8b0fd14f1",
                    tax_id: "0808899001122",
                    name_on_document_th: "บริษัท ซีเคียวโค้ด จำกัด",
                    name_on_document_eng: "SecureCode CO., LTD."
                },
                {
                    index: 1,
                    business_id: "5567806128069456",
                    created_by: "348230124226402",
                    updated_by: "348230124226402",
                    created_at: "2025-08-20T09:10:27.441Z",
                    updated_at: "2025-08-20T09:10:27.441Z",
                    _id: "68a5910326f5fed8b0fd14f2",
                    tax_id: "D9582473610",
                    name_on_document_th: "ห้างหุ้นส่วนสามัญ ความอดทนไม่มี",
                    name_on_document_eng: "NoMorePatient Co."
                }
            ],
            created_by: "348230124226402",
            updated_by: "348230124226402",
            created_at: "2025-08-20T09:10:27.443Z",
            updated_at: "2025-08-20T09:10:27.443Z",
            __v: 0
        }
    ]

    export const businessData: SearchBusinessResponseType[] = [
      {
        business_id: "TH001",
        name_on_document_th: "บริษัท ไทยเทค จำกัด",
        name_on_document_eng: "ThaiTech Co., Ltd.",
        name_th: "ไทยเทค",
        name_eng: "ThaiTech",
        type: "Technology"
      },
      {
        business_id: "TH002",
        name_on_document_th: "ห้างหุ้นส่วนจำกัด สมาร์ทฟู้ด",
        name_on_document_eng: "SmartFood Ltd. Partnership",
        name_th: "สมาร์ทฟู้ด",
        name_eng: "SmartFood",
        type: "Food & Beverage"
      },
      {
        business_id: "TH003",
        name_on_document_th: "บริษัท เจริญสุข พร็อพเพอร์ตี้ จำกัด",
        name_on_document_eng: "Charoensuk Property Co., Ltd.",
        name_th: "เจริญสุข",
        name_eng: "Charoensuk",
        type: "Real Estate"
      },
      {
        business_id: "TH004",
        name_on_document_th: "บริษัท ไอเดียดี จำกัด",
        name_on_document_eng: "IdeaDee Co., Ltd.",
        name_th: "ไอเดียดี",
        name_eng: "IdeaDee",
        type: "Marketing"
      },
      {
        business_id: "TH005",
        name_on_document_th: "บริษัท เอเชียทรานสปอร์ต จำกัด",
        name_on_document_eng: "AsiaTransport Co., Ltd.",
        name_th: "เอเชียทรานสปอร์ต",
        name_eng: "AsiaTransport",
        type: "Logistics"
      },
      {
        business_id: "TH006",
        name_on_document_th: "บริษัท กรีนพาวเวอร์ จำกัด",
        name_on_document_eng: "GreenPower Co., Ltd.",
        name_th: "กรีนพาวเวอร์",
        name_eng: "GreenPower",
        type: "Energy"
      },
      {
        business_id: "TH007",
        name_on_document_th: "บริษัท ซอฟต์แวร์ไทย จำกัด",
        name_on_document_eng: "ThaiSoftware Co., Ltd.",
        name_th: "ซอฟต์แวร์ไทย",
        name_eng: "ThaiSoftware",
        type: "Software"
      },
      {
        business_id: "TH008",
        name_on_document_th: "บริษัท ฟินเทคโซลูชั่น จำกัด",
        name_on_document_eng: "FintechSolution Co., Ltd.",
        name_th: "ฟินเทคโซลูชั่น",
        name_eng: "FintechSolution",
        type: "Finance"
      },
      {
        business_id: "TH009",
        name_on_document_th: "บริษัท เมดิคอลแคร์ จำกัด",
        name_on_document_eng: "MedicalCare Co., Ltd.",
        name_th: "เมดิคอลแคร์",
        name_eng: "MedicalCare",
        type: "Healthcare"
      },
      {
        business_id: "TH010",
        name_on_document_th: "บริษัท อีโคดีไซน์ จำกัด",
        name_on_document_eng: "EcoDesign Co., Ltd.",
        name_th: "อีโคดีไซน์",
        name_eng: "EcoDesign",
        type: "Design"
      }
    ]    