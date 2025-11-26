"use client"
import { userData } from "./mockUsers";

export interface InboxItem {
  key: string;
  docId: string;
  sender: {
    name: string;
    email: string;
    company: string;
  };
  typeCode: string;
  details: string;
  createdAt: string;
  updatedAt: string;
  status: "รอดำเนินการ" | "กำลังดำเนินการ" | "ปฏิเสธ" | "ยกเลิก" | "เสร็จสิ้น";
}

// Document types
const documentTypes = [
  "ใบแจ้งหนี้",
  "ใบเสนอราคา",
  "สัญญา",
  "รายงานการประชุม",
  "บันทึกข้อความ",
  "เอกสารทั่วไป",
];

// Generate random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
};

// Statuses
const statuses: InboxItem["status"][] = [
  "รอดำเนินการ",
  "กำลังดำเนินการ",
  "ปฏิเสธ",
  "ยกเลิก",
  "เสร็จสิ้น",
];

// Generate mock inbox data
export const inboxData: InboxItem[] = Array.from({ length: 20 }, (_, index) => {
  const user = userData[Math.floor(Math.random() * userData.length)];
  const createdAt = getRandomDate();
  const docType =
    documentTypes[Math.floor(Math.random() * documentTypes.length)];
  const randomStatus = Math.floor(Math.random() * statuses.length);

  return {
    key: (index + 1).toString(),
    docId: `DOC-${new Date().getFullYear()}-${10000 + index}`,
    sender: {
      name: user.name,
      email: user.email,
      company: user.company,
    },
    typeCode: docType,
    details: `รายละเอียด${docType} สำหรับการดำเนินการ ${index + 1}`,
    createdAt: createdAt,
    updatedAt: getRandomDate(),
    status: statuses[randomStatus],
  };
});
