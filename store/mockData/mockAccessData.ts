"use client"
import { AccessRights } from "./mockWorkSpace";

export interface AccessRightsData {
  workspaceId: string | number;
  workspaceName: string;
  accessType: string;
  accessRights: AccessRights;
}

export const mockAccessData: AccessRightsData[] = [
  {
    workspaceId: "1",
    workspaceName: "ประกันสุขภาพกลุ่ม A",
    accessType: "public",
    accessRights: {
      type: "public",
      users: "all",
      departments: "all"
    }
  },
  {
    workspaceId: "2",
    workspaceName: "ประกันอุบัติเหตุกลุ่ม B",
    accessType: "private",
    accessRights: {
      type: "private",
      users: [
        { name: "John Doe", email: "john.doe@example.com", role: "Admin" },
        { name: "Jane Smith", email: "jane.smith@example.com", role: "Member" }
      ],
      departments: "all"
    }
  },
  {
    workspaceId: "3",
    workspaceName: "ประกันชีวิตกลุ่ม C",
    accessType: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["Developer Team", "UX/UI Team"],
        "One Geo Survey Co., Ltd.": ["Marketing Team"]
      }
    }
  },
  {
    workspaceId: "4",
    workspaceName: "ประกันสุขภาพพนักงาน",
    accessType: "public",
    accessRights: {
      type: "public",
      users: "all",
      departments: "all"
    }
  },
  {
    workspaceId: "5",
    workspaceName: "ประกันอุบัติเหตุนักเรียน",
    accessType: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["HR Team", "Finance Team"],
        "One Geo Survey Co., Ltd.": ["Sales Team"]
      }
    }
  },
  {
    workspaceId: "6",
    workspaceName: "ประกันสุขภาพครอบครัว",
    accessType: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["Executive Team"]
      }
    }
  },
  {
    workspaceId: "7",
    workspaceName: "ประกันอุบัติเหตุส่วนบุคคล",
    accessType: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "One Geo Survey Co., Ltd.": ["Product Team", "Development Team"]
      }
    }
  }
]; 