"use client"
export interface Company {
  name: string;
  departments: string[];
}

export const mockCompany: Company[] = [
  {
    name: "INET Plc.",
    departments: [
      "Developer Team",
      "Tester Team",
      "UX/UI Team",
      "Sales Team",
      "Marketing Team",
      "HR Team",
      "Finance Team",
      "IT Team",
      "Admin Team",
      "Customer Support Team",
    ],
  },
  {
    name: "One Geo Survey Co., Ltd.",
    departments: [
      "Developer Team",
      "Tester Team",
      "UX/UI Team",
      "Sales Team",
      "Marketing Team",
      "Customer Support Team",
    ],
  },
  {
    name: "Mandala Communications Co., Ltd.",
    departments: [
      "Developer Team",
      "Sales Team",
      "Marketing Team",
      "Customer Support Team",
    ],
  },
  {
    name: "Test Company",
    departments: [
      "Developer Team",
      "Tester Team",
      "UX/UI Team",
      "Sales Team",
      "Marketing Team",
      "Customer Support Team",
    ],
  },
  {
    name: "Test Company 2",
    departments: [
      "Developer Team",
      "Tester Team",
    ],
  },
  {
    name: "Test Company 3",
    departments: [
      "Developer Team",
      "Tester Team",
      "UX/UI Team",
    ],
  },
];
