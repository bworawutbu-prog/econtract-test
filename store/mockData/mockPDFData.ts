"use client"
export interface changPageNumber {
   pageNum: number
}

interface ApproverInfo {
  name: string;
  email: string;
  position: string;
}

export interface ApproverItem {
  level: number;
  status: "pending" | "approved" | "rejected";
  approver: ApproverInfo;
  approved_at?: string;
}

export interface DocumentDetails {
  documentNumber: string;
  typeCode: string;
  documentStatus: string;
  documentDate: string;
  documentOwner: string;
  company: string;
  documentTitle?: string;
  documentDescription?: string;
  documentVersion?: string;
  documentId?: string;
  version?: string;
  status?: string;
  approvers?: ApproverItem[];
}

export interface AdditionalInfo {
  description: string;
  remarks: string;
  tags: string[];
  relatedDocuments: string[];
  documentId?: string;
  version?: string;
  status?: string;
  approvers?: ApproverItem[];
}

export interface PDFDataType {
  key: string;
  fileName: string;
  lastUpdated: string;
  effectiveDate: string;
  isActive: boolean;
  url: string;
  status: string;
  type: string;
  documentDetails: DocumentDetails;
  additionalInfo: AdditionalInfo;
  approvers: ApproverItem[];
}

export const mockPDFData: PDFDataType[] = [
  {
    key: "1",
    fileName: "camry_ebrochure.pdf",
    lastUpdated: "2024-01-15T10:30:00",
    effectiveDate: "2024-02-01T10:30:00",
    isActive: true,
    url: "/pdf/camry_ebrochure.pdf",
    status: "active",
    type: "approved",
    documentDetails: {
      documentNumber: "DOC-2024-001",
      typeCode: "E-Brochure",
      documentStatus: "Published",
      documentDate: "2024-01-15",
      documentOwner: "Marketing Team",
      company: "Sales & Marketing"
    },
    additionalInfo: {
      description: "Toyota Camry 2024 Electronic Brochure",
      remarks: "Latest version with updated specifications",
      tags: ["toyota", "camry", "2024", "brochure"],
      relatedDocuments: ["price_list_2024.pdf", "warranty_terms.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Jon Snow",
          email: "jon.snow@gmail.com",
          position: "Tester"
        }
      },
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Arya Stark",
          email: "arya.stark@gmail.com",
          position: "Tester"
        }
      },
      {
        level: 2,
        status: "approved",
        approver: {
          name: "Tony Stark",
          email: "tony.stark@gmail.com",
          position: "Lead Developer"
        }
      },
      {
        level: 3,
        status: "pending",
        approver: {
          name: "Tyrion Lannister",
          email: "tyrion.lannister@gmail.com",
          position: "Backend Developer"
        }
      }
    ]
  },
  {
    key: "2",
    fileName: "Honda-Accord_Catalogue.pdf",
    lastUpdated: "2024-01-14T15:45:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/Honda-Accord_Catalogue.pdf",
    status: "inactive",
    type: "approved",
    documentDetails: {
      documentNumber: "DOC-2024-002",
      typeCode: "Catalogue",
      documentStatus: "Archived",
      documentDate: "2024-01-14",
      documentOwner: "Product Team",
      company: "Product Management"
    },
    additionalInfo: {
      description: "Honda Accord Product Catalogue",
      remarks: "Pending update for 2024 model",
      tags: ["honda", "accord", "catalogue"],
      relatedDocuments: ["accord_specs.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Jaime Lannister",
          email: "jaime.lannister@gmail.com",
          position: "Frontend Developer"
        }
      },
      {
        level: 2,
        status: "rejected",
        approver: {
          name: "Daenerys Targaryen",
          email: "daenerys.targaryen@gmail.com",
          position: "UX/UI Designer"
        }
      }
    ]
  },
  {
    key: "3",
    fileName: "Rolls_Royce.pdf",
    lastUpdated: "2024-01-13T09:15:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/Rolls_Royce.pdf",
    status: "inactive",
    type: "approved",
    documentDetails: {
      documentNumber: "DOC-2024-003",
      typeCode: "Product Specification",
      documentStatus: "Under Review",
      documentDate: "2024-01-13",
      documentOwner: "Luxury Division",
      company: "Premium Vehicles"
    },
    additionalInfo: {
      description: "Rolls Royce Product Information",
      remarks: "Luxury vehicle specifications",
      tags: ["rolls-royce", "luxury", "premium"],
      relatedDocuments: ["pricing_premium.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "pending",
        approver: {
          name: "Brienne of Tarth",
          email: "brienne.tarth@gmail.com",
          position: "Frontend Developer"
        }
      },
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Davos Seaworth",
          email: "davos.seaworth@gmail.com",
          position: "QA Engineer"
        }
      }
    ]
  },
  {
    key: "4",
    fileName: "tesla-impact-report-2019.pdf",
    lastUpdated: "2024-01-12T14:20:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/tesla-impact-report-2019.pdf",
    status: "inactive",
    type: "draft",
    documentDetails: {
      documentNumber: "DOC-2024-004",
      typeCode: "Impact Report",
      documentStatus: "Draft",
      documentDate: "2024-01-12",
      documentOwner: "Sustainability Team",
      company: "Environmental Affairs"
    },
    additionalInfo: {
      description: "Tesla Environmental Impact Report 2019",
      remarks: "Historical data for reference",
      tags: ["tesla", "sustainability", "2019", "report"],
      relatedDocuments: ["environmental_metrics.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Samwell Tarly",
          email: "samwell.tarly@gmail.com",
          position: "Backend Developer"
        }
      },
      {
        level: 2,
        status: "pending",
        approver: {
          name: "Sansa Stark",
          email: "sansa.stark@gmail.com",
          position: "Backend Developer"
        }
      },
      {
        level: 3,
        status: "pending",
        approver: {
          name: "Robb Stark",
          email: "robb.stark@gmail.com",
          position: "Backend Developer"
        }
      }
    ]
  },
  {
    key: "5",
    fileName: "volvo-xc40-bev-s-m-brochure.pdf",
    lastUpdated: "2024-01-11T11:05:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/volvo-xc40-bev-s-m-brochure.pdf",
    status: "inactive",
    type: "draft",
    documentDetails: {
      documentNumber: "DOC-2024-005",
      typeCode: "Product Brochure",
      documentStatus: "Draft",
      documentDate: "2024-01-11",
      documentOwner: "EV Division",
      company: "Electric Vehicles"
    },
    additionalInfo: {
      description: "Volvo XC40 BEV Sales Material",
      remarks: "Draft version for internal review",
      tags: ["volvo", "xc40", "electric", "bev"],
      relatedDocuments: ["ev_charging_guide.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "pending",
        approver: {
          name: "Cersei Lannister",
          email: "cersei.lannister@gmail.com",
          position: "Content Writer"
        }
      }
    ]
  },
  {
    key: "6",
    fileName: "atto3-th.pdf",
    lastUpdated: "2024-02-14T17:01:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/atto3-th.pdf",
    status: "inactive",
    type: "draft",
    documentDetails: {
      documentNumber: "DOC-2024-006",
      typeCode: "Product Manual",
      documentStatus: "Draft",
      documentDate: "2024-02-14",
      documentOwner: "Technical Team",
      company: "Technical Documentation"
    },
    additionalInfo: {
      description: "ATTO 3 Technical Handbook",
      remarks: "Thai language version",
      tags: ["atto3", "manual", "technical", "thai"],
      relatedDocuments: ["atto3_service_manual.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "pending",
        approver: {
          name: "Diana Prince",
          email: "diana.prince@gmail.com",
          position: "UX/UI Designer"
        }
      },
      {
        level: 1,
        status: "pending",
        approver: {
          name: "Clark Kent",
          email: "clark.kent@gmail.com",
          position: "UX/UI Designer"
        }
      }
    ]
  },
  {
    key: "7",
    fileName: "M0052_2558.pdf",
    lastUpdated: "2025-01-13T08:00:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/M0052_2558.pdf",
    status: "inactive",
    type: "approved",
    documentDetails: {
      documentNumber: "DOC-2025-001",
      typeCode: "Technical Document",
      documentStatus: "Pending Review",
      documentDate: "2025-01-13",
      documentOwner: "Engineering Team",
      company: "Engineering"
    },
    additionalInfo: {
      description: "Engineering Specifications M0052",
      remarks: "Technical specifications for model 2558",
      tags: ["engineering", "specifications", "M0052"],
      relatedDocuments: ["engineering_standards.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "approved",
        approver: {
          name: "Bruce Wayne",
          email: "bruce.wayne@gmail.com",
          position: "QA Engineer"
        }
      },
      {
        level: 2,
        status: "rejected",
        approver: {
          name: "Tony Stark",
          email: "tony.stark@gmail.com",
          position: "Lead Developer"
        }
      }
    ]
  },
  {
    key: "8",
    fileName: "BYD-Sealion-7-2025-MY.pdf",
    lastUpdated: "2025-01-13T08:00:00",
    effectiveDate: "-",
    isActive: false,
    url: "/pdf/BYD-Sealion-7-2025-MY.pdf",
    status: "inactive",
    type: "draft",
    documentDetails: {
      documentNumber: "DOC-2025-002",
      typeCode: "Product Specification",
      documentStatus: "Draft",
      documentDate: "2025-01-13",
      documentOwner: "Product Planning",
      company: "Product Development"
    },
    additionalInfo: {
      description: "BYD Sealion 7 2025 Model Year Specifications",
      remarks: "Preliminary specifications for 2025 model",
      tags: ["byd", "sealion", "2025", "specifications"],
      relatedDocuments: ["byd_features_list.pdf"]
    },
    approvers: [
      {
        level: 1,
        status: "pending",
        approver: {
          name: "Jon Snow",
          email: "jon.snow@gmail.com",
          position: "Tester"
        }
      },
      {
        level: 2,
        status: "pending",
        approver: {
          name: "Tyrion Lannister",
          email: "tyrion.lannister@gmail.com",
          position: "Backend Developer"
        }
      }
    ]
  }
];