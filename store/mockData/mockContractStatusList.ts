import { listTransactionSchema } from "../types/mappingTypes";

export const mockListTransactions: listTransactionSchema[] = [
    // {
    //     key: 1,
    //     id: "txn_20250901_001",
    //     path_pdf: "/uploads/txn_20250901_001.pdf",
    //     pdf_name: "คำขอเบิกค่าเดินทาง.pdf",
    //     workflow_id: "wf_travel_01",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1002,
    //         name: "ฟอร์มเบิกอุปกรณ์",
    //         email: "requester2@example.com",
    //         mapping_text: [
    //             {
    //                 text: "รายการ",
    //                 required: "true",
    //                 max_characters: "200",
    //                 max_lines: "2",
    //                 value: "สมุดบันทึก A4"
    //             },
    //             {
    //                 text: "จำนวน",
    //                 required: "true",
    //                 max_characters: "5",
    //                 max_lines: "1",
    //                 value: "3"
    //             }
    //         ],
    //         mapping_signature: [
    //             {
    //                 text: "อนุมัติ",
    //                 required: "true",
    //                 signatureType: "image",
    //                 value: "/signatures/manager.png",
    //                 actorId: "user_mgr_02"
    //             }
    //         ],
    //         mapping_radiobox: ["office_supplies"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["OFF-2025-0002"],
    //         mapping_more_file: ["/files/invoice_002.pdf"],
    //         mapping_eseal: [],
    //         mapping_checkbox: ["policy_ok"],
    //         mapping_form_id: "form_office_02",
    //         tax_id: "0105557654321",
    //         workspace_id: "workspace_finance",
    //         created_at: "2025-08-20T09:55:00Z",
    //         updated_at: "2025-08-20T11:00:00Z",
    //         created_by: "user_2002",
    //         updated_by: "user_mgr_02"
    //     },
    //     tax_id: "0105551234567",
    //     start_enabled: "2025-09-01T09:00:00Z",
    //     end_enabled: "2025-09-30T18:00:00Z",
    //     status: "รอดำเนินการ",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ยื่นคำขอ",
    //             action: "สร้างเอกสาร",
    //             validate_type: "auto",
    //             validate_data: "ok",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_1001"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-01T09:00:10Z"
    //         },
    //         {
    //             index: "2",
    //             section: "อนุมัติ",
    //             action: "รออนุมัติจากหัวหน้า",
    //             validate_type: "manual",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "approver",
    //             entity: ["user_mgr_01"],
    //             status: "รอดำเนินการ",
    //             approved_at: ""
    //         }
    //     ],
    //     participant: ["user_1001", "user_mgr_01"],
    //     inprogress_participant: ["user_mgr_01"],
    //     document_id: "doc_trv_1001",
    //     created_at: "2025-09-01T08:50:00Z",
    //     updated_at: "2025-09-01T09:05:00Z",
    //     created_by: "user_1001",
    //     updated_by: "user_1001",
    //     approver: [
    //         { email: "mgr1@example.com", name: "นายหัวหน้า แผนก", id: "user_mgr_01" }
    //     ]
    // },

    // {
    //     key: 2,
    //     id: "txn_20250820_002",
    //     path_pdf: "/uploads/txn_20250820_002.pdf",
    //     pdf_name: "เบิกอุปกรณ์สำนักงาน.pdf",
    //     workflow_id: "wf_office_02",
    //     mapping_form_data_id: {
    //         _id: 1002,
    //         name: "ฟอร์มเบิกอุปกรณ์",
    //         email: "requester2@example.com",
    //         mapping_date_time: [],
    //         mapping_text: [
    //             {
    //                 text: "รายการ",
    //                 required: "true",
    //                 max_characters: "200",
    //                 max_lines: "2",
    //                 value: "สมุดบันทึก A4"
    //             },
    //             {
    //                 text: "จำนวน",
    //                 required: "true",
    //                 max_characters: "5",
    //                 max_lines: "1",
    //                 value: "3"
    //             }
    //         ],
    //         mapping_signature: [
    //             {
    //                 text: "อนุมัติ",
    //                 required: "true",
    //                 signatureType: "image",
    //                 value: "/signatures/manager.png",
    //                 actorId: "user_mgr_02"
    //             }
    //         ],
    //         mapping_radiobox: ["office_supplies"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["OFF-2025-0002"],
    //         mapping_more_file: ["/files/invoice_002.pdf"],
    //         mapping_eseal: [],
    //         mapping_checkbox: ["policy_ok"],
    //         mapping_form_id: "form_office_02",
    //         tax_id: "0105557654321",
    //         workspace_id: "workspace_finance",
    //         created_at: "2025-08-20T09:55:00Z",
    //         updated_at: "2025-08-20T11:00:00Z",
    //         created_by: "user_2002",
    //         updated_by: "user_mgr_02"
    //     },
    //     tax_id: "0105557654321",
    //     start_enabled: "2025-08-20T10:00:00Z",
    //     end_enabled: "2025-08-31T18:00:00Z",
    //     status: "เสร็จสิ้น",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ยื่นคำขอ",
    //             action: "ส่งเอกสาร",
    //             validate_type: "auto",
    //             validate_data: "ok",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_2002"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-08-20T10:05:00Z"
    //         },
    //         {
    //             index: "2",
    //             section: "อนุมัติ",
    //             action: "อนุมัติโดยผู้จัดการ",
    //             validate_type: "manual",
    //             validate_data: "ผ่าน",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "approver",
    //             entity: ["user_mgr_02"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-08-20T11:00:00Z"
    //         }
    //     ],
    //     participant: ["user_2002", "user_mgr_02"],
    //     inprogress_participant: [],
    //     document_id: "doc_off_1002",
    //     created_at: "2025-08-20T09:55:00Z",
    //     updated_at: "2025-08-20T11:00:00Z",
    //     created_by: "user_2002",
    //     updated_by: "user_mgr_02",
    //     approver: [
    //         { email: "mgr2@example.com", name: "คุณผู้จัดการ", id: "user_mgr_02" }
    //     ]
    // },

    // {
    //     key: 3,
    //     id: "txn_20250909_003",
    //     path_pdf: "/uploads/txn_20250909_003.pdf",
    //     pdf_name: "ขอลาหยุด.pdf",
    //     workflow_id: "wf_leave_03",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1003,
    //         name: "ฟอร์มลาหยุด",
    //         email: "hr@example.com",
    //         mapping_text: [
    //             {
    //                 text: "เหตุผลการลา",
    //                 required: "true",
    //                 max_characters: "300",
    //                 max_lines: "5",
    //                 value: "พบแพทย์"
    //             }
    //         ],
    //         mapping_signature: [],
    //         mapping_radiobox: ["ลาป่วย"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["LV-2025-0003"],
    //         mapping_more_file: [],
    //         mapping_eseal: [],
    //         mapping_checkbox: [],
    //         mapping_form_id: "form_leave_03",
    //         tax_id: "",
    //         workspace_id: "workspace_hr",
    //         created_at: "2025-09-09T14:00:00Z",
    //         updated_at: "2025-09-09T14:10:00Z",
    //         created_by: "user_3003",
    //         updated_by: "user_3003"
    //     },
    //     tax_id: "",
    //     start_enabled: "2025-09-10T00:00:00Z",
    //     end_enabled: "2025-09-12T23:59:59Z",
    //     status: "บันทึกร่าง",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ร่างเอกสาร",
    //             action: "ร่าง",
    //             validate_type: "auto",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_3003"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-09T14:00:00Z"
    //         }
    //     ],
    //     participant: ["user_3003"],
    //     inprogress_participant: ["user_3003"],
    //     document_id: "doc_lv_1003",
    //     created_at: "2025-09-09T14:00:00Z",
    //     updated_at: "2025-09-09T14:10:00Z",
    //     created_by: "user_3003",
    //     updated_by: "user_3003",
    //     approver: []
    // },
    // {
    //     key: 4,
    //     id: "txn_20250909_003",
    //     path_pdf: "/uploads/txn_20250909_003.pdf",
    //     pdf_name: "ขอลาหยุด.pdf",
    //     workflow_id: "wf_leave_03",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1003,
    //         name: "ฟอร์มลาหยุด",
    //         email: "hr@example.com",
    //         mapping_text: [
    //             {
    //                 text: "เหตุผลการลา",
    //                 required: "true",
    //                 max_characters: "300",
    //                 max_lines: "5",
    //                 value: "พบแพทย์"
    //             }
    //         ],
    //         mapping_signature: [],
    //         mapping_radiobox: ["ลาป่วย"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["LV-2025-0003"],
    //         mapping_more_file: [],
    //         mapping_eseal: [],
    //         mapping_checkbox: [],
    //         mapping_form_id: "form_leave_03",
    //         tax_id: "",
    //         workspace_id: "workspace_hr",
    //         created_at: "2025-09-09T14:00:00Z",
    //         updated_at: "2025-09-09T14:10:00Z",
    //         created_by: "user_3003",
    //         updated_by: "user_3003"
    //     },
    //     tax_id: "",
    //     start_enabled: "2025-09-10T00:00:00Z",
    //     end_enabled: "2025-09-12T23:59:59Z",
    //     status: "กำลังดำเนินการ",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ร่างเอกสาร",
    //             action: "ร่าง",
    //             validate_type: "auto",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_3003"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-09T14:00:00Z"
    //         }
    //     ],
    //     participant: ["user_3003"],
    //     inprogress_participant: ["user_3003"],
    //     document_id: "doc_lv_1003",
    //     created_at: "2025-09-09T14:00:00Z",
    //     updated_at: "2025-09-09T14:10:00Z",
    //     created_by: "user_3003",
    //     updated_by: "user_3003",
    //     approver: []
    // },
    // {
    //     key: 5,
    //     id: "txn_20250909_003",
    //     path_pdf: "/uploads/txn_20250909_003.pdf",
    //     pdf_name: "ขอลาหยุด.pdf",
    //     workflow_id: "wf_leave_03",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1003,
    //         name: "ฟอร์มลาหยุด",
    //         email: "hr@example.com",
    //         mapping_text: [
    //             {
    //                 text: "เหตุผลการลา",
    //                 required: "true",
    //                 max_characters: "300",
    //                 max_lines: "5",
    //                 value: "พบแพทย์"
    //             }
    //         ],
    //         mapping_signature: [],
    //         mapping_radiobox: ["ลาป่วย"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["LV-2025-0003"],
    //         mapping_more_file: [],
    //         mapping_eseal: [],
    //         mapping_checkbox: [],
    //         mapping_form_id: "form_leave_03",
    //         tax_id: "",
    //         workspace_id: "workspace_hr",
    //         created_at: "2025-09-09T14:00:00Z",
    //         updated_at: "2025-09-09T14:10:00Z",
    //         created_by: "user_3003",
    //         updated_by: "user_3003"
    //     },
    //     tax_id: "",
    //     start_enabled: "2025-09-10T00:00:00Z",
    //     end_enabled: "2025-09-12T23:59:59Z",
    //     status: "ปฏิเสธ",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ร่างเอกสาร",
    //             action: "ร่าง",
    //             validate_type: "auto",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_3003"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-09T14:00:00Z"
    //         }
    //     ],
    //     participant: ["user_3003"],
    //     inprogress_participant: ["user_3003"],
    //     document_id: "doc_lv_1003",
    //     created_at: "2025-09-09T14:00:00Z",
    //     updated_at: "2025-09-09T14:10:00Z",
    //     created_by: "user_3003",
    //     updated_by: "user_3003",
    //     approver: []
    // },
    // {
    //     key: 6,
    //     id: "txn_20250909_003",
    //     path_pdf: "/uploads/txn_20250909_003.pdf",
    //     pdf_name: "ขอลาหยุด.pdf",
    //     workflow_id: "wf_leave_03",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1003,
    //         name: "ฟอร์มลาหยุด",
    //         email: "hr@example.com",
    //         mapping_text: [
    //             {
    //                 text: "เหตุผลการลา",
    //                 required: "true",
    //                 max_characters: "300",
    //                 max_lines: "5",
    //                 value: "พบแพทย์"
    //             }
    //         ],
    //         mapping_signature: [],
    //         mapping_radiobox: ["ลาป่วย"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["LV-2025-0003"],
    //         mapping_more_file: [],
    //         mapping_eseal: [],
    //         mapping_checkbox: [],
    //         mapping_form_id: "form_leave_03",
    //         tax_id: "",
    //         workspace_id: "workspace_hr",
    //         created_at: "2025-09-09T14:00:00Z",
    //         updated_at: "2025-09-09T14:10:00Z",
    //         created_by: "user_3003",
    //         updated_by: "user_3003"
    //     },
    //     tax_id: "",
    //     start_enabled: "2025-09-10T00:00:00Z",
    //     end_enabled: "2025-09-12T23:59:59Z",
    //     status: "ยกเลิก",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ร่างเอกสาร",
    //             action: "ร่าง",
    //             validate_type: "auto",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_3003"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-09T14:00:00Z"
    //         }
    //     ],
    //     participant: ["user_3003"],
    //     inprogress_participant: ["user_3003"],
    //     document_id: "doc_lv_1003",
    //     created_at: "2025-09-09T14:00:00Z",
    //     updated_at: "2025-09-09T14:10:00Z",
    //     created_by: "user_3003",
    //     updated_by: "user_3003",
    //     approver: []
    // },
    // {
    //     key: 7,
    //     id: "txn_20250909_003",
    //     path_pdf: "/uploads/txn_20250909_003.pdf",
    //     pdf_name: "ขอลาหยุด.pdf",
    //     workflow_id: "wf_leave_03",
    //     mapping_form_data_id: {
    //         mapping_date_time: [],
    //         _id: 1003,
    //         name: "ฟอร์มลาหยุด",
    //         email: "hr@example.com",
    //         mapping_text: [
    //             {
    //                 text: "เหตุผลการลา",
    //                 required: "true",
    //                 max_characters: "300",
    //                 max_lines: "5",
    //                 value: "พบแพทย์"
    //             }
    //         ],
    //         mapping_signature: [],
    //         mapping_radiobox: ["ลาป่วย"],
    //         mapping_stamp: [],
    //         mapping_doc_no: ["LV-2025-0003"],
    //         mapping_more_file: [],
    //         mapping_eseal: [],
    //         mapping_checkbox: [],
    //         mapping_form_id: "form_leave_03",
    //         tax_id: "",
    //         workspace_id: "workspace_hr",
    //         created_at: "2025-09-09T14:00:00Z",
    //         updated_at: "2025-09-09T14:10:00Z",
    //         created_by: "user_3003",
    //         updated_by: "user_3003"
    //     },
    //     tax_id: "",
    //     start_enabled: "2025-09-10T00:00:00Z",
    //     end_enabled: "2025-09-12T23:59:59Z",
    //     status: "เสร็จสิ้น",
    //     flow_data: [
    //         {
    //             index: "1",
    //             section: "ร่างเอกสาร",
    //             action: "ร่าง",
    //             validate_type: "auto",
    //             validate_data: "",
    //             selfie_video: false,
    //             script_video: "",
    //             type_entity: "user",
    //             entity: ["user_3003"],
    //             status: "เสร็จสิ้น",
    //             approved_at: "2025-09-09T14:00:00Z"
    //         }
    //     ],
    //     participant: ["user_3003"],
    //     inprogress_participant: ["user_3003"],
    //     document_id: "doc_lv_1003",
    //     created_at: "2025-09-09T14:00:00Z",
    //     updated_at: "2025-09-09T14:10:00Z",
    //     created_by: "user_3003",
    //     updated_by: "user_3003",
    //     approver: []
    // },
];
