"use client"
export interface RoleItem {
  key: string;
  label: string;
}

export const roleData: RoleItem[] = [
  {
    key: "1",
    label: "Super Admin",
  },
  {
    key: "2",
    label: "Admin",
  },
  {
    key: "3",
    label: "Designer",
  },
  {
    key: "4",
    label: "Member",
  },
];
