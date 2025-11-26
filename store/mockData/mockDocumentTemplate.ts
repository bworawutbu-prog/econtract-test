"use client";

export interface DocumentTemplateType {
  key: React.Key;
  documentNo: string;
  documentName: string;
  createDate: string;
  editDate: string;
  groupId?: string;
}

export const mockDocumentTemplate: DocumentTemplateType[] = [
  {
    key: "1",
    documentNo: "ID-0123456",
    documentName: "เอกสารสัญญาเช่า1",
    createDate: "12/09/2025 13:00:00",
    editDate: "12/09/2025 13:00:00",
  },
  {
    key: "2",
    documentNo: "ID-0123457",
    documentName: "เอกสารสัญญาเช่า2",
    createDate: "12/09/2025 14:00:00",
    editDate: "12/09/2025 14:00:00",
  },
  {
    key: "3",
    documentNo: "ID-0123458",
    documentName: "เอกสารสัญญาเช่า3",
    createDate: "12/09/2025 15:00:00",
    editDate: "12/09/2025 15:00:00",
  },
  {
    key: "4",
    documentNo: "ID-0123459",
    documentName: "เอกสารสัญญาเช่า4",
    createDate: "12/09/2025 16:00:00",
    editDate: "12/09/2025 16:00:00",
  },
  {
    key: "5",
    documentNo: "ID-0123460",
    documentName: "เอกสารสัญญาเช่า5",
    createDate: "12/09/2025 17:00:00",
    editDate: "12/09/2025 17:00:00",
  },
];

