"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Form,
  Collapse,
  Select,
  Spin,
  Input,
  Button,
  Checkbox,
  Radio,
  Typography,
  Tooltip,
  message,
  DatePicker,
} from "antd";
import { ChevronDown, Trash, Plus, CircleMinus, UserRound } from "lucide-react";
import {
  SearchOutlined,
  UserAddOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  citizenGetAll,
  citizenSearchByEmail,
} from "@/store/backendStore/citizenAPI";
import {
  B2BSearchByEmail,
  B2BSearchByEmailOrName,
} from "@/store/documentStore/profileB2BAPI";
import { searchUserInBusiness } from "@/store/backendStore/workspaceAPI";
import { addSubmittedForm } from "@/store/documentStore/B2BForm";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { enqueueSnackbar } from "notistack";
import type { Rule } from "antd/es/form";
import { convertSegmentPathToStaticExportFilename } from "next/dist/shared/lib/segment-cache/segment-value-encoding";
import { STORAGE_KEYS } from "@/store/utils/localStorage";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UserListData } from "@/store/types/contractB2BType";
import appEmitter from "@/store/libs/eventEmitter";
import debounce from "lodash/debounce";
import { PdfMergeUpload } from "../PdfMergeUpload";
import { checkSum } from "@/components/utils/util";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { useSelector } from "react-redux";

interface FormB2BProps {
  open: boolean;
  pdfPage: number;
  pdfObject: any;
  form: any; // AntD form instance จาก Modal
  style?: string;
  onPdfUpdate?: (newPdfUrl: string, newPageCount: number) => void;
  onConfirmResetAllMapping?: () => void;
  mode?: "template" | "document"; // 🎯 NEW: Mode to determine if validation is needed
}

interface ApproverUser {
  fullName?: string;
  idCard?: string;
  email?: string;
  userName?: string;
  hasCa?: boolean;
  isInBusiness?: boolean;
  accountId?: string;
  isSaved?: boolean;
}

interface GetB2BMailUserData {
  email?: string;
  name?: string;
  type?: string;
  tax_id?: string;
  business_id?: string;
}

type UserFieldProps = {
  userField: any;
  userIndex: number;
  approverIndex: any;
  form: any;
  style?: string;
  handleSaveUser: (index: number) => void;
  handleAddNext: () => void;
  handleRemoveUser: (index: number) => void;
};

interface UserSettingData {
  typeCode: string;
  approvers: {
    index: number;
    role: string;
    permission: string;
    section: string;
    validateType: string;
    validateData: string;
    entityType: string;
    entities: {
      id: string;
      name: string;
      email: string;
    }[];
    selfieVideo: boolean;
    selfieMessage: string;
  }[];
  formId: string;
  documentId: string | undefined;
}

interface FindMailInterfaceProps {
  addUser: () => void;
  approverIndex: number;
}

const FormB2BRuleConfig: Record<string, Rule[]> = {
  refDocs: [{ required: true, message: "เลขที่อ้างอิงเป็นข้อมูลที่จำเป็น" }],
  notificationRenewDocs: [
    {
      required: true,
      message: "ข้อมูลแจ้งเตือนต่ออายุเอกสารเป็นข้อมูลที่จำเป็น",
    },
  ],
  section: [
    { required: true, message: "มาตราเป็นข้อมูลที่จำเป็น" }, //จังหวัดเป็นข้อมูลที่จำเป็น
  ],
  paymentChannel: [
    { required: true, message: "ช่องทางการชำระอากรแสตมป์เป็นข้อมูลที่จำเป็น" },
  ],
  stampDutyBizPayer: [
    { required: true, message: "ผู้ชำระอากรแสตมป์เป็นข้อมูลที่จำเป็น" },
  ],
  fullName: [{ required: true, message: "ชื่อ-นามสกุลเป็นข้อมูลที่จำเป็น" }],
  idCard: [
    // { required: true, message: "เลขบัตรประจำตัวประชาชนเป็นข้อมูลที่จำเป็น" },
    // {
    //   pattern: /^\d+$/,
    //   message: "กรอกได้เฉพาะตัวเลขเท่านั้น",
    // },
    // {
    //   min: 13,
    //   max: 13,
    //   message: "เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก",
    // },
    {
      // validate id card checksum
      validator: (_, value) => {
        // Allow empty values since idCard is not required
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return Promise.resolve();
        }
        if (!checkSum(value)) {
          return Promise.reject(new Error("เลขบัตรประจำตัวประชาชนไม่ถูกต้อง"));
        } else if (value.length !== 13) {
          return Promise.reject(
            new Error("เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก")
          );
        }
        return Promise.resolve();
      },
    },
  ],
  idCardRequired: [
    { required: true, message: "เลขบัตรประจำตัวประชาชนเป็นข้อมูลที่จำเป็น" },
    {
      pattern: /^\d+$/,
      message: "กรอกได้เฉพาะตัวเลขเท่านั้น",
    },
    // {
    //   min: 13,
    //   max: 13,
    //   message: "เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก",
    // },
    {
      // validate id card checksum
      validator: (_, value) => {
        // Required field - must have value
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return Promise.reject(
            new Error("เลขบัตรประจำตัวประชาชนเป็นข้อมูลที่จำเป็น")
          );
        } else if (value.length !== 13) {
          return Promise.reject(
            new Error("เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก")
          );
        } else if (!checkSum(value)) {
          return Promise.reject(new Error("เลขบัตรประจำตัวประชาชนไม่ถูกต้อง"));
        }
        return Promise.resolve();
      },
    },
  ],
  passportRequired: [
    {
      required: true,
      message: "เลขที่หนังสือเดินทาง/พาสปอร์ตเป็นข้อมูลที่จำเป็น",
    },
  ],
  email: [
    { required: true, message: "อีเมลเป็นข้อมูลที่จำเป็น" },
    {
      type: "email",
      message: "รูปแบบอีเมลไม่ถูกต้อง",
    },
  ],
  taxId: [{ required: true, message: "TaxID เป็นข้อมูลที่จำเป็น" }],
  approverType: [{ required: true, message: "สิทธิ์เป็นข้อมูลที่จำเป็น" }],
  permissionType: [{ required: true, message: "ประเภทเป็นข้อมูลที่จำเป็น" }],
};

export const FormB2B: React.FC<FormB2BProps> = ({
  open,
  pdfPage,
  pdfObject,
  form,
  style,
  onPdfUpdate,
  onConfirmResetAllMapping,
  mode = "document", // 🎯 NEW: Default to document mode
}) => {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const userProfile = useSelector((state: RootState) => state.userProfile);
  const pathname = usePathname();
  const currentPath = pathname.split("/").filter(Boolean);
  const isDocumentPath = currentPath && currentPath[0] === "document";
  const [messageApi, contextHolder] = message.useMessage();
  const maxLength = 13;
  // console.log('currentPath =>',currentPath)
  const { Option } = Select;
  const { Text } = Typography;
  const plainOptions = [
    { value: "Signer", label: "Signer" },
    { value: "Approver", label: "Approver" },
  ];
  const [approver, setApprover] = useState<any[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>(["1", "2"]);
  const [isExternal, setIsExternal] = useState<boolean>(false);
  const [hasDuplicateEmail, setHasDuplicateEmail] = useState<boolean>(false);
  const [attachFileChecked, setAttachFileChecked] = useState(false);
  const [isAddUserList, setAddUserList] = useState<boolean>(false);
  // const [disabledSelects, setDisabledSelects] = useState<
  //   Record<number, boolean>
  // >({});
  const [userSaveList, setUserSaveList] = useState<any[]>([]);
  // const [userSettings, setUserSettings] = useState<UserSettingData | null>(
  //   null
  // );
  const [savedUserList, setSavedUserList] = useState<Record<string, boolean>>(
    {}
  );
  // console.log("savedUserList =>", savedUserList);
  // const [loadings, setLoadings] = useState<Record<string, boolean>>({});
  // const [isSuccessStatus, setIsSuccessStatus] = useState<boolean>(false);
  const [isCheckedRenewDocs, setIsCheckedRenewDocs] = useState<boolean>(false);
  // const [isEmail, setIsEmail] = useState<boolean>(false);
  const [confirmRemoveApprover, setConfirmRemoveApprover] = useState<{
    open: boolean;
    fieldName: number | null;
  }>({ open: false, fieldName: null });
  const removeApproverRef = useRef<((index: number) => void) | null>(null);
  const canvasState = useAppSelector((state) => state.canvas);
  const B2BformData = useAppSelector((state) => state.contractB2BForm);

  // ถ้าอยู่ในเส้นทาง document และมีการเปิด confirm ให้ลบทันทีโดยไม่ต้องแสดง modal
  useEffect(() => {
    if (isDocumentPath && confirmRemoveApprover.open) {
      if (
        confirmRemoveApprover.fieldName !== null &&
        removeApproverRef.current
      ) {
        if (onConfirmResetAllMapping) {
          onConfirmResetAllMapping();
        }
        removeApproverRef.current(confirmRemoveApprover.fieldName);
      }
      setConfirmRemoveApprover({ open: false, fieldName: null });
    }
  }, [isDocumentPath, confirmRemoveApprover.open]);

  useEffect(() => {
    // console.log("currpath => ");
    const currPath = pathname.split("/").filter(Boolean);

    if (currPath && (currPath[0] === "document" || currPath[0] === "backend") ) {
      // รอให้ userProfile โหลดเสร็จก่อนเรียก getUserData
      if (userProfile?.data) {
        // form.resetFields();
        getUserData();
        appEmitter.emit("formB2BUpdated",{isValid : checkValidateFormB2B()});
      }
    }
  }, [pathname, userProfile?.data]);

  useEffect(() => {
    const currPath = pathname.split("/").filter(Boolean);
    if (currPath[0] !== "document" && B2BformData?.forms?.contractParty) {
      const newSaved: Record<string, boolean> = {};

      const approvers = B2BformData.forms.contractParty.approvers || [];
      approvers.forEach((approver, approverIndex) => {
        (approver.userList || []).forEach((user, userIdx) => {
          // mark ว่า user คนนี้ถูก save แล้ว
          newSaved[`${approverIndex}-${userIdx}`] = true;
        });
      });

      setSavedUserList(newSaved);
    }
  }, [pathname, B2BformData?.forms]);

  // 🎯 Ensure first approver has approverType: "internal" when modal opens
  // useEffect(() => {
  //   if (open) {
  //     const currentValues = form.getFieldsValue();
  //     const currentApprovers = currentValues?.contractParty?.approvers || [];
      
  //     // Check if first approver exists but doesn't have approverType
  //     if (currentApprovers.length > 0 && !currentApprovers[0]?.approverType) {
  //       form.setFieldsValue({
  //         contractParty: {
  //           ...currentValues?.contractParty,
  //           approvers: currentApprovers.map((approver: any, index: number) => ({
  //             ...approver,
  //             approverType: index === 0 ? "internal" : approver.approverType,
  //           })),
  //         },
  //       });
  //     }
  //     console.log('current values =>',form.getFieldsValue())
  //   }
  // }, [open, form]);

  useEffect(() => {
    // console.log("isAddUserList =>", isAddUserList);
    // console.log("hasDuplicateEmail =>", hasDuplicateEmail);
  }, [hasDuplicateEmail, isAddUserList]);
  useEffect(() => {
    if (pdfPage > 0 && approver.length > 0) {
      const updatedApprovers = approver.map((item, index) => ({
        ...item,
        signPosition: `หน้า ${index + 1 <= pdfPage ? index + 1 : pdfPage}`,
      }));

      form.setFieldsValue({
        contractParty: {
          approvers: updatedApprovers,
        },
      });
    }
  }, [pdfPage, approver, form]);

  const convertDateStringsToDayjs = (obj: any) => {
    if (!obj || typeof obj !== "object") return obj;

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        result[key] = dayjs(value); // 🗓️ แปลง string YYYY-MM-DD → dayjs object
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  const mapUserData = (data: any): UserListData => {
    return {
      fullName: data?.name || "",
      idCard: data?.id_card || "",
      email: data?.email || "",
      userName: data?.email || "", // ถ้าจะใช้ email เป็น userName
      hasCa: data?.has_ca || false,
      isInBusiness: data?.is_in_business || false,
      accountId: data?.id || "",
      nationality: data?.nationality || "thailand",
    };
  };

  // Set default values from B2BformData when style is "1column"
  useEffect(() => {
    if (style === "1column" && B2BformData.forms) {
      const mappedApprovers = (
        B2BformData.forms.contractParty?.approvers ?? []
      ).map((approver: any) => ({
        ...approver,
        userList: (approver.userList || []).map(mapUserData),
      }));

      // ✅ ใช้ helper function ตรงนี้
      const docsTypeDetail = convertDateStringsToDayjs(
        B2BformData.forms.docsTypeDetail
      );

      const defaultValues = {
        docsType: B2BformData.forms.docsType || "B2B",
        docsTypeDetail, // 🧩 ใช้ค่าที่แปลงแล้ว
        contractParty: {
          ...B2BformData.forms.contractParty,
          approvers: mappedApprovers,
        },
      };

      form.setFieldsValue(defaultValues);
    }
  }, [style, B2BformData.forms, form]);

  useEffect(() => {
    const currPath = pathname.split("/").filter(Boolean)[0];
    const payment = (
      B2BformData.forms?.docsTypeDetail?.paymentChannel ?? ""
    ).trim();
    // console.log('payment =>',payment)

    if (currPath !== "document") {
      setIsExternal(payment === "นอกระบบ" || payment === "ไม่ชำระอากรแสตมป์");
    }
  }, [pathname, B2BformData.forms]);

  const handleFormChange = debounce(() => {
    appEmitter.emit("formB2BUpdated", { isValid: checkValidateFormB2B() });
  }, 300);

  // 🎯 Helper function to get rules based on mode
  const getRules = useCallback((ruleKey: keyof typeof FormB2BRuleConfig): Rule[] => {
    // If template mode, return empty rules (no validation)
    if (mode === "template") {
      return [];
    }
    return FormB2BRuleConfig[ruleKey] || [];
  }, [mode]);

  const checkValidateFormB2B = useCallback(() => {
    // 🎯 If template mode, skip all validation
    if (mode === "template") {
      return true;
    }

    // console.log('checkValidateFormB2B => ')
    const values = form.getFieldsValue(true); // get all values
    // console.log('values =>',values)
    const contractParty = values.contractParty;
    const docsTypeDetail = values.docsTypeDetail;

    if (docsTypeDetail && contractParty) {
      if (
        !docsTypeDetail?.section ||
        !docsTypeDetail?.paymentChannel ||
        (!contractParty?.taxId && B2BformData.forms?.docsType == "B2B") ||
        !contractParty?.operator?.email ||
        !contractParty?.operator?.name
        // || !contractParty.operator.idCard
        // || !(contractParty?.approvers && contractParty?.approvers.length < 2)
      ) {
        return false;
      }
      if (docsTypeDetail?.paymentChannel === "ในระบบ") {
        if (
          !docsTypeDetail?.stampDutyBizPayer ||
          !docsTypeDetail?.stampDutyPlayer?.fullName ||
          !docsTypeDetail?.stampDutyPlayer?.email
          // || !docsTypeDetail.stampDutyPlayer?.idCard
        ) {
          return false;
        }
      }

      if (contractParty?.approvers) {
        const isExternalData = contractParty?.approvers ?? [];
        // const checkApprove = isExternal.some((i:any) => i.approverType === "external"); // ถ้าไม่มี "นอกระบบ" อย่างน้อย 1 รายการให้ return false;
        const checkPermission = isExternalData.every(
          (i: any) => i.permissionType && i.permissionType !== ""
        );
        if (!checkPermission) {
          return false;
        }
      }

      // const checkUserList = contractParty?.approvers.every((approver: any, index: number) => {
      //   if (index === 0) return true; // ยกเว้นตัวแรก
      //   return approver?.userList.every(
      //     (user: any) =>
      //       user?.fullName && user?.fullName.trim() !== "" &&
      //       user?.email && user?.email.trim() !== ""
      //       // && user.idCard && user.idCard.trim() !== ""
      //       && (user?.idCard && user?.idCard.length > 0 ? user?.idCard.length === 13 : true)
      //   );
      // });

      // if (!checkUserList) {
      //   return false;
      // }

      // if(contractParty?.approvers){
      //   const data = contractParty.approvers
      //   const checkSaveData = data.some((approver:any) =>
      //     approver.userList.some((user:any) => user.isSaved === false)
      //   );
      //  if(checkSaveData) return false;
      // }
    }
    return true;
  }, [form, mode]);

  const getUserData = async () => {
    
    try {
      const userData =
        localStorage.getItem(STORAGE_KEYS.PERSIST_AUTH) || "no data";
      const convertData = JSON.parse(userData);
      if (convertData && convertData.user) {
        const authData = JSON.parse(convertData?.user);
        // console.log('autdData =>',authData)
        const userEmail = authData.email || "";
        
        // ตรวจสอบว่า userProfile.data มีค่าก่อนใช้งาน
        const firstName = userProfile?.data?.first_name_th || "";
        const lastName = userProfile?.data?.last_name_th || "";
        const fullName = await Promise.resolve(firstName && lastName ? `${firstName} ${lastName}` : () => {
          const profile = localStorage.getItem("persist:userProfile");
          const profileData = JSON.parse(JSON.parse(profile || "{}").data);
          if(profileData){
            return `${profileData.first_name_th} ${profileData.last_name_th}`;
          }
          return '';
        });
        
          // ดึงค่าปัจจุบันจากฟอร์ม
      const currentValues = form.getFieldsValue(true);
      let currentApprovers = [];
      if (B2BformData?.forms?.contractParty?.approvers && B2BformData?.forms?.contractParty?.approvers?.length > 1) {
        currentApprovers = B2BformData?.forms?.contractParty?.approvers;
      } else {
        currentApprovers = currentValues?.contractParty?.approvers.map((approver: any) => ({
          ...approver,
          userList: approver?.userList?.map((user: any) => ({
            ...user,
            fullName: user?.name || "",
            idCard: user?.id_card || "",
          })),
        }));
      }

      const filteredApprovers = await currentValues?.contractParty?.approvers?.filter(
        (_approver: any, index: number) => index === 0
      )?.map((approver: any) => ({
        ...approver,
        userList: approver?.userList?.filter(
          (_user: any, userIndex: number) => userIndex === 0
        )?.map((user: any) => ({
          email: userEmail || "",
          fullName: fullName || "",
          userName: authData?.username || "",
          accountId: authData?.id || "",
          hasCa: authData?.has_ca || false,
          isInBusiness: authData?.is_in_business || false,
          nationality: user?.nationality || "thailand",
        })),
      }));
      // console.log('filteredApprovers =>',filteredApprovers)
      // console.log('filteredApprovers[0].userList =>',filteredApprovers[0].userList)

      const updatedApprovers = currentApprovers.map((approver: any, index: number) => {
        if (index === 0) {
          return {
            ...approver,
            userList: filteredApprovers?.[0]?.userList ?? [],
          };
        }
        return {
          ...approver,
          userList: approver?.userList?.map((user: any) => ({
            ...user,
            fullName: user?.fullName || user?.name || "",
            idCard: user?.id_card || "",
          })),
        };
      });
      // console.log('updatedApprovers before set fields value 3 =>',updatedApprovers)
      // set ค่าใหม่เข้าไปใน userList[0]
      // console.log('set fields value 3')
      await form.setFieldsValue({
        ...currentValues,
        contractParty: {
          ...currentValues?.contractParty,
          approvers: updatedApprovers || []
        },
      });

      // console.log('formzzz =>',form.getFieldsValue())

      // const currentValuesAfter = form.getFieldsValue(true);
      // console.log('currentValuesAfter => ',currentValuesAfter)
        // const response = await handleSearchUserInBusiness(
        //   userEmail,
        //   "internal",
        //   ""
        // );
        // const userData = response?.data;

        // const currentValues = form.getFieldsValue(true);
        // form.setFieldsValue({
        //   ...currentValues,
        //   contractParty: {
        //     ...currentValues.contractParty,
        //     operator: {
        //       ...currentValues.contractParty?.operator,
        //       fullName: authData.fullName || "",
        //       idCard: "",
        //       email: authData.email || "",
        //       userName: authData.username, // ค่า default
        //       hasCa: userData.has_ca || false,
        //       isInBusiness: userData.is_in_business || false,
        //       accountId: authData.id || "",
        //     },
        //   },
        // });
        // console.log("form =>", form.getFieldsValue());
      }
    } catch (error) {
      console.error("❌ Validation failed:", error);
    }
  };

  const handleSearchUserInBusiness = async (
    approverType: string,
    tax_id: string,
    value: string
  ) => {
    let data: GetB2BMailUserData = {} as GetB2BMailUserData;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const checkMailType = emailPattern.test(value);
    // ถ้าเป็น mail
    if (checkMailType) {
      if (approverType === "external") {
        data = {
          tax_id,
          email: value || "",
        };
      } else {
        data = {
          email: value || "",
        };
      }
    } else {
      if (approverType === "external") {
        data = {
          tax_id,
          name: value || "",
        };
      } else {
        data = {
          name: value || "",
        };
      }
    }
    // console.log('get user data =>',data)

    try {
      const response = await dispatch(B2BSearchByEmailOrName(data)).unwrap();
      // const response = '';
      // console.log("res =>", response);
      return response;
    } catch (error: any) {
      // enqueueSnackbar(`🎯 [AccessRight] Error searching user in business: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      return null;
    }
  };

  const handleSaveUser = async (approverIndex: number, userIndex: number) => {
    try {
      // ✅ Validate เฉพาะ field ของ user ล่าสุด
      await form.validateFields([
        [
          "contractParty",
          "approvers",
          approverIndex,
          "userList",
          userIndex,
          "fullName",
        ],
        [
          "contractParty",
          "approvers",
          approverIndex,
          "userList",
          userIndex,
          "idCard",
        ],
        [
          "contractParty",
          "approvers",
          approverIndex,
          "userList",
          userIndex,
          "email",
        ],
      ]);

      const userList = (form.getFieldValue([
        "contractParty",
        "approvers",
        approverIndex,
        "userList",
      ]) || []) as ApproverUser[];

      const approverType = form.getFieldValue([
        "contractParty",
        "approvers",
        approverIndex,
        "approverType",
      ]);
      const permissionType = form.getFieldValue([
        "contractParty",
        "approvers",
        approverIndex,
        "permissionType",
      ]);
      const taxId = form.getFieldValue(["contractParty", "taxId"]);
      const noApprover = approverIndex + 1;
      if (!taxId) {
        enqueueSnackbar(`กรุณากรอก Tax ID`, { variant: "warning" });
        return;
      }

      // ตรวจสอบ field approver ก่อน
      if (!permissionType && !approverType) {
        enqueueSnackbar(
          `กรุณาเลือกรายการสิทธิ์ และเลือกประเภท ของผู้อนุมัติลำดับที่ ${noApprover}`,
          { variant: "warning", autoHideDuration: 3000 }
        );
        return;
      }

      if (!permissionType && approverType) {
        enqueueSnackbar(
          `กรุณาเลือกรายการสิทธิ์ ของผู้อนุมัติลำดับที่ ${noApprover}`,
          { variant: "warning", autoHideDuration: 3000 }
        );
        return;
      }

      if (permissionType && !approverType) {
        enqueueSnackbar(
          `กรุณาเลือกประเภท ของผู้อนุมัติลำดับที่ ${noApprover}`,
          { variant: "warning", autoHideDuration: 3000 }
        );
        return;
      }

      // ถ้า permissionType และ approverType ครบ → ผ่าน

      const user = userList[userIndex];
      const email = (user.email || "").trim();

      // เช็ก duplicate email
      const hasDuplicate = userList.some(
        (u, idx) => idx !== userIndex && u.email === email
      );
      if (hasDuplicate) {
        enqueueSnackbar("มีอีเมลนี้ ในรายการแล้ว", { variant: "error" });
        return;
      }

      // ✅ เรียก API หรือจัดการข้อมูล
      // const response: any = await handleSearchUserInBusiness(
      //   email,
      //   approverType,
      //   taxId
      // );

      // const currentUserList = [...userList];

      // if (response) {
      //   currentUserList[userIndex] = {
      //     ...currentUserList[userIndex],
      //     userName: response.data.username || "",
      //     hasCa: response.data.has_ca ?? false,
      //     isInBusiness: response.data.is_in_business ?? false,
      //     accountId: response.data.account_id ?? "",
      //     isSaved: true
      //   };
      // } else {
      //   const fieldValues =
      //     form.getFieldValue([
      //       "contractParty",
      //       "approvers",
      //       approverIndex,
      //       "userList",
      //       userIndex,
      //     ]) || {};

      //   currentUserList[userIndex] = {
      //     fullName: fieldValues.fullName || "",
      //     idCard: fieldValues.idCard || "",
      //     email: fieldValues.email || "",
      //     userName: "",
      //     hasCa: false,
      //     isInBusiness: false,
      //     accountId: "",
      //     isSaved: true
      //   };
      // }

      // // ✅ อัปเดต form
      // form.setFieldsValue({
      //   contractParty: {
      //     approvers: {
      //       [approverIndex]: { userList: currentUserList },
      //     },
      //   },
      // });

      // ✅ อัปเดต savedUserList เพื่อซ่อนปุ่มบันทึก
      setSavedUserList((prev) => ({
        ...prev,
        [`${approverIndex}-${userIndex}`]: true,
      }));

      // ✅ อัปเดต userSaveList ตาม structure ใหม่
      if (email) {
        setUserSaveList((prev) => {
          const newList = [...prev];

          // ถ้า approverIndex ยังไม่มี object ให้สร้าง
          if (!newList[approverIndex]) {
            newList[approverIndex] = { approvers: [] };
          }

          // เพิ่ม email ถ้ายังไม่มี
          if (!newList[approverIndex].approvers.includes(email)) {
            newList[approverIndex].approvers.push(email);
          }
          // console.log("newList =>", newList);
          return newList;
        });
      }
      appEmitter.emit("formB2BUpdated", { isValid: checkValidateFormB2B() });

      // console.log("userSaveList =>", userSaveList);
      // console.log("User saved:", currentUserList[userIndex].email);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const numericOnlyKeyDown = (
    allowedKeys: string[] = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ]
  ) => {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    };
  };

  const FindMailInterface: React.FC<FindMailInterfaceProps> = ({
    addUser,
    approverIndex,
  }) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [options, setOptions] = useState<any[]>([]);
    const [selectedValue, setSelectedValue] = useState<any[]>([]);
    const [showNoResults, setShowNoResults] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [userList, setUserList] = useState<any[]>([]);

    const handleChange = (value: string[]) => {
      // console.log(`selected ${value}`);
    };

    const allValues = form.getFieldsValue(true);
    const checkApproveType =
      allValues.contractParty.approvers[approverIndex].approverType;
    const checkPermissionType =
      allValues.contractParty.approvers[approverIndex].permissionType;
    const taxId = allValues.contractParty.taxId;
    const approversIndexData =
      allValues.contractParty.approvers[approverIndex].userList;
    // console.log('data =>',allValues.contractParty.approvers[approverIndex])
    // console.log('contractParty =>',allValues.contractParty)
    const getOption = () => {
      // console.log('getOption')
      let newOptions: any[] = [{ label: searchValue, value: searchValue }];
      return newOptions;
    };

    const approverTypeWarning = () => {
      messageApi.open({
        type: "warning",
        content: `กรุณาเลือกรายการสิทธิ์ ผู้อนุมัติลำดับที่ ${
          approverIndex + 1
        }`,
      });
    };
    const taxIdWarning = () => {
      messageApi.open({
        type: "warning",
        content: `กรุณากรอก TaxID`,
      });
    };
    const valueLengthWarning = () => {
      messageApi.open({
        type: "warning",
        content: `กรุณากรอกข้อมูลอย่างน้อย 3 ตัวอักษร`,
      });
    };
    const dupMailWarning = () => {
      messageApi.open({
        type: "warning",
        content: "มีอีเมลนี้ในรายการแล้ว",
      });
    };

    const handleSearchApprovers = async (query: string) => {
      try {
        if (!taxId && B2BformData.forms?.docsType == "B2B") {
          taxIdWarning();
          return;
        }
        if (!checkApproveType) {
          approverTypeWarning();
          return;
        }
        // console.log('query =>',query)

        let mailList: any = [
          //   {
          //   account_id: "xxxxxxxxxx",
          //   first_name_th: "สมชาย",
          //   last_name_th: "ใจดี",
          //   first_name_eng: "Somchai",
          //   last_name_eng: "Jaidee",
          //   email: "somchai.j@company.com",
          //   id_card: "xxxxxxxxxxxxxx"
          // },
          // {
          //   account_id: "xxxxxxxxxx",
          //   first_name_th: "ก็อต",
          //   last_name_th: "คาบ้าน",
          //   first_name_eng: "Got",
          //   last_name_eng: "CarHome",
          //   email: "Got@Got.com",
          //   id_card: "xxxxxxxxx25689"
          // }
        ];

        mailList = await handleSearchUserInBusiness(
          checkApproveType,
          taxId,
          searchValue.trim()
        );
        if (mailList === null || mailList === undefined) {
          mailList = [];
        }
        // console.log('mailList resp =>',mailList)

        setUserList(mailList);
        // console.log('mailList =>',mailList)
        let resultList = [];
        // console.log('mailList length =>',mailList.length)
        if (mailList.length > 0) {
          setIsSuccess(true);
          resultList = mailList.map((user: any) => ({
            value: user.email,
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "1.3",
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {user.first_name_th} {user.last_name_th}
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>
                  {user.email}
                </span>
              </div>
            ),
          }));
        } else {
          setIsSuccess(false);
          resultList = [
            {
              label: (
                <div>
                  <div style={{ fontWeight: 500 }}>{query}</div>
                </div>
              ),
              value: query,
            },
          ];
        }
        setOptions(resultList);
      } catch (err) {
        console.error("search error", err);
      }
    };

    const handleAddUser = (value: string) => {
      let userData: any = {};
      // console.log('value handleAddUser =>',value)
      // console.log('userList.length =>',userList.length)

      let checkMail = false;
      if (!value) return;

      const checkDupMail = approversIndexData.some(
        (item: any) => item.email === value
      );
      if (checkDupMail) {
        dupMailWarning();
        return;
      }
      const userListPath = [
        "contractParty",
        "approvers",
        approverIndex,
        "userList",
      ];
      const currentList = form.getFieldValue(userListPath) || [];
      const newIndex = currentList.length;

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailPattern.test(value)) {
        checkMail = true;
        // setIsEmail(true)
      }

      if (userList.length > 0) {
        userData = userList.find((d: any) => d.email === value);
        // console.log('userData =>',userData)
      }

      const basePath = [
        "contractParty",
        "approvers",
        approverIndex,
        "userList",
        newIndex,
      ];

      // console.log('isSuccess, checkMail =>',isSuccess, checkMail)
      addUser();
      if (!isSuccess && checkMail) {
        form.setFieldValue([...basePath, "fullName"], "");
        form.setFieldValue([...basePath, "idCard"], "");
        form.setFieldValue([...basePath, "email"], value);
        form.setFieldValue([...basePath, "nationality"], "thailand");
        form.setFieldValue([...basePath, "isSaved"], false);
      } else if (!isSuccess && !checkMail) {
        form.setFieldValue([...basePath, "fullName"], value);
        form.setFieldValue([...basePath, "idCard"], "");
        form.setFieldValue([...basePath, "email"], "");
        form.setFieldValue([...basePath, "nationality"], "thailand");
        form.setFieldValue([...basePath, "isSaved"], false);
      } else {
        let fullName;
        if (userData.first_name_th) {
          fullName = userData.first_name_th;
          if (userData.last_name_th) {
            fullName += " " + userData.last_name_th;
          }
        } else if (userData.first_name_eng) {
          fullName = userData.first_name_eng;
          if (userData.last_name_eng) {
            fullName += " " + userData.last_name_eng;
          }
        } else {
          fullName = "";
        }
        form.setFieldValue([...basePath, "fullName"], fullName);
        // form.setFieldValue([...basePath, "idCard"], userData.id_card_num == "DUMMY" ? "" : userData.id_card_num);
        form.setFieldValue([...basePath, "email"], userData.email);
        form.setFieldValue(
          [...basePath, "nationality"],
          userData.nationality || "thailand"
        );
        form.setFieldValue([...basePath, "isSaved"], false);
      }

      appEmitter.emit("formB2BUpdated", { isValid: checkValidateFormB2B() });
      setSelectedValue([]);
      setOptions([]);
      // setOptions([]);
      setShowNoResults(false);
      setOpen(false);
    };

    const onSelect = (selected: { value: string; label: string }) => {
      // console.log('selected data!!!',selected.value)
      setSearchValue("");
      setShowNoResults(false);
    };
    const onSearch = (value: string) => {
      // console.log("onSearch =>",value)
      setSearchValue(value);
      setShowNoResults(!!value.trim());
      // setOptions([]);
    };

    return (
      <>
        {contextHolder}
        {/* <div className="mb-3 mt-1 p-2 rounded-t-xl bg-[#FCFCFC]"> */}
        <div className="mb-3 mt-1 ">
          <div className="mb-2 mt-1">
            <span className="font-bold text-[#333]">เพิ่มลำดับผู้อนุมัติ</span>
          </div>
          <div>
            <span>ค้นหา</span>
          </div>
          <Select
            mode="multiple"
            labelInValue
            showSearch
            value={selectedValue}
            searchValue={searchValue}
            style={{ width: "100%" }}
            placeholder="ค้นหาด้วยชื่อ-นามสกุล หรืออีเมล"
            options={options}
            onSearch={setSearchValue}
            suffixIcon={
              <Tooltip title="ค้นหา">
                {" "}
                <SearchOutlined
                  style={{
                    color: "#0153BD",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (searchValue.trim().length < 1) return;
                    if (checkApproveType) {
                      handleSearchApprovers(searchValue.trim());
                    } else {
                      approverTypeWarning();
                    }
                  }}
                />{" "}
              </Tooltip>
            }
            onSelect={(selected) => {
              // console.log('Selected item:', selected);
              handleAddUser(selected.value);
            }}
            onInputKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const query = searchValue.trim();
                if (!query) return;
                if (searchValue.length < 3) {
                  valueLengthWarning();
                  return;
                }
                setSearchValue("");
                setTimeout(() => handleSearchApprovers(query), 70);
              }
            }}
            notFoundContent={
              searchValue ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    color: "#999",
                  }}
                >
                  กรุณากด Enter เพื่อค้นหา
                </div>
              ) : null
            }
            onDeselect={(deselected) => {
              const deselectedVal =
                typeof deselected === "string" ? deselected : deselected.value;
              setSelectedValue((prev) =>
                prev.filter((v) => v.value !== deselectedVal)
              );
            }}
          />
        </div>
      </>
    );
  };

  const UserField: React.FC<UserFieldProps & { isSaved?: boolean }> = ({
    userField,
    userIndex,
    approverIndex,
    form,
    style,
    handleSaveUser,
    handleAddNext,
    handleRemoveUser,
    isSaved = false,
  }) => {
    // console.log("approver index =>", approverIndex);
    // const allValues = form.getFieldsValue(true);
    // const emailToCheck =
    //   allValues.contractParty?.approvers?.[approverIndex]?.userList?.[userIndex]
    //     ?.email || "";
    const emailToCheck = Form.useWatch(
      [
        "contractParty",
        "approvers",
        approverIndex,
        "userList",
        userIndex,
        "email",
      ],
      form
    );

    // Watch values for dynamic rules
    const docsType = Form.useWatch("docsType", form);
    const approverType = Form.useWatch(
      ["contractParty", "approvers", approverIndex, "approverType"],
      form
    );
    const nationality = Form.useWatch(
      [
        "contractParty",
        "approvers",
        approverIndex,
        "userList",
        userIndex,
        "nationality",
      ],
      form
    );

    // Calculate dynamic idCard rules
    const idCardRules = React.useMemo(() => {
      // 🎯 If template mode, return empty rules (no validation)
      if (mode === "template") {
        return [];
      }

      const isB2C = docsType === "B2C";
      const isExternal = approverType === "external";
      // ถ้า nationality เป็น undefined หรือ null ให้ถือว่าไม่ใช่ชาวต่างชาติ (default เป็น thailand)
      const isNotForeign = nationality !== "foreign";

      if (isB2C && isExternal && isNotForeign) {
        // console.log("idCardRequired");
        return FormB2BRuleConfig.idCardRequired;
      } else if (isB2C && isExternal && !isNotForeign) {
        // console.log("passportRequired");
        return FormB2BRuleConfig.passportRequired;
      } else if (!isNotForeign) {
        // console.log("not rules");
        return [];
      } else {
        // console.log("idCard");
        return FormB2BRuleConfig.idCard;
      }
    }, [docsType, approverType, nationality, mode]);

    React.useEffect(() => {
      form.setFields([
        {
          name: [
            "contractParty",
            "approvers",
            approverIndex,
            "userList",
            userIndex,
            "idCard",
          ],
          errors: [],
        },
      ]);
    }, [form, approverIndex, userIndex, nationality]);

    return (
      <div className="p-[8px] bg-[#FCFCFC] rounde-t-xl">
        <div
          className={`${
            style === "1column"
              ? "grid grid-cols-1"
              : "flex justify-between items-center"
          }`}
        >
          <span
            className={`${
              style === "1column" ? "grid grid-cols-1 mb-2" : "flex"
            } font-bold text-[#333] gap-2`}
          >
            ลำดับที่ {userIndex + 1}
          </span>
          <div
            className={`${
              style === "1column"
                ? "grid grid-cols-1"
                : "flex items-center gap-2"
            } font-normal text-[#464646]`}
          >
            <label>สัญชาติ :</label>
            <Form.Item
              name={[userField.name, "nationality"]}
              noStyle
              initialValue="thailand"
            >
              <Radio.Group disabled={style === "1column"}>
                <Radio value="thailand">ไทย</Radio>
                <Radio value="foreign">ชาวต่างชาติ</Radio>
              </Radio.Group>
            </Form.Item>
            {/* ปุ่มลบ */}
            <Trash
              onClick={() => {
                handleRemoveUser(userIndex);
                // removeSaveUserlist(approverIndex, userIndex, emailToCheck);
              }}
              className={`${
                style === "1column" ? "hidden" : ""
              } text-[#0153BD] w-[20px] h-[20px] hover:text-red-500 cursor-pointer`}
              // className={` ${userList.length === 1 ? 'hidden' : ''} text-[#0153BD] w-[20px] h-[20px] hover:text-red-500 cursor-pointer`}
            />
          </div>
        </div>

        <div
          className={`grid ${
            style === "1column"
              ? "grid-cols-1"
              : "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3"
          } gap-4 my-2`}
        >
          <Form.Item
            name={[userField.name, "fullName"]}
            label="ชื่อ-นามสกุล"
            rules={getRules("fullName")}
            className="flex-1 !mb-0"
          >
            <Input
              placeholder="กรอกชื่อ-นามสกุล"
              disabled={style === "1column"}
            />
          </Form.Item>

          <Form.Item
            name={[userField.name, "idCard"]}
            label={
              nationality === "foreign"
                ? "เลขที่หนังสือเดินทาง"
                : "เลขบัตรประจำตัวประชาชน"
            }
            rules={idCardRules}
            className="flex-1 !mb-0"
          >
            <Input
              placeholder={
                nationality === "foreign"
                  ? "กรอกเลขที่หนังสือเดินทาง"
                  : "กรอกเลขบัตรประชาชน"
              }
              maxLength={nationality === "foreign" ? undefined : maxLength}
              disabled={style === "1column"}
              onChange={(e) => {
                if (nationality !== "foreign") {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  const trimmed = onlyNumbers.slice(0, 13);
                  e.target.value = trimmed;
                }
              }}
              onKeyDown={
                nationality === "foreign" ? undefined : numericOnlyKeyDown()
              }
            />
          </Form.Item>

          <Form.Item
            name={[userField.name, "email"]}
            label="อีเมล"
            rules={getRules("email")}
            className="flex-1 !mb-0"
          >
            <Input placeholder="กรอกอีเมล" disabled={style === "1column"} />
          </Form.Item>

          {/* ปุ่มบันทึก */}
        </div>
      </div>
    );
  };

  // const ApproverItem = ({ field, approverIndex, form, removeApprover, style, savedUserList }) => {
  //   // ✅ ใช้ useWatch ได้ถูกต้อง
  //   const checkUserList =
  //     Form.useWatch(["contractParty", "approvers", approverIndex, "userList"], form) || [];

  //   const isApproverSaved = !!savedUserList?.[`${approverIndex}-0`];
  //   const disabled = approverIndex === 0 || checkUserList.length > 0;

  //   console.log("checkUserList realtime =>", checkUserList);

  //   return (
  //     <div key={field.key} className="rounded-md mb-6">
  //       <div className="flex justify-between items-center">
  //         <div className="flex items-center space-x-2 mb-2">
  //           <span className="flex items-center font-bold text-[#333] gap-2">
  //             ผู้อนุมัติลำดับที่ {approverIndex + 1}
  //           </span>
  //         </div>
  //         <div className="flex space-x-2 items-center">
  //           {style !== "1column" && approverIndex > 0 && (
  //             <Trash
  //               className="text-[#0153BD] w-[20px] h-[20px] hover:text-red-500 cursor-pointer"
  //               onClick={() => removeApprover(field.name)}
  //             />
  //           )}
  //         </div>
  //       </div>

  //       <div
  //         className={`grid ${
  //           style == "1column"
  //             ? "grid-cols-1"
  //             : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
  //         } gap-4 my-2`}
  //       >
  //         <Form.Item
  //           {...field}
  //           label="สิทธิ์"
  //           name={[field.name, "approverType"]}
  //           className="!mb-0"
  //         >
  //           <Select placeholder="เลือกสิทธิ์" disabled={disabled}>
  //             <Option value="internal">ต้นสัญญา</Option>
  //             <Option value="external">คู่สัญญา</Option>
  //           </Select>
  //         </Form.Item>
  //       </div>
  //     </div>
  //   );
  // };

  // const DefineDocsUpload = () => [
  //   {
  //     key: "1",
  //     label: (
  //       <div className="flex gap-2">
  //         <h3 className="font-black text-[#333333]">รวมไฟล์เอกสาร</h3>
  //       </div>
  //     ),
  //     children: (
  //       <>
  //         <div>
  //           <span className="font-[600] text-[16px] text-[#333]">
  //             เอกสาร
  //           </span>
  //           <div
  //             className={`grid ${
  //               style === "1column"
  //                 ? "lg:grid-cols-1"
  //                 : isExternal
  //                 ? "lg:grid-cols-2"
  //                 : " lg:grid-cols-3"
  //             } sm:grid-cols-1 md:grid-cols-2 gap-4 my-2`}
  //           >

  //             <Form.Item
  //               label="รวมไฟล์เอกสาร"
  //               name={["docsTypeUpload", "mergedFiles"]}
  //               className="!mb-0"
  //             >
  //               <PdfMergeUpload
  //                 existingPdf={pdfObject}
  //                 onMergeComplete={(mergedPdfUrl: string, pageCount: number) => {
  //                   form.setFieldValue(['docsTypeUpload', 'mergedPdfUrl'], mergedPdfUrl);
  //                   form.setFieldValue(['docsTypeUpload', 'mergedPageCount'], pageCount);
  //                 }}
  //                 onPdfUpdate={(newPdfUrl: string, newPageCount: number) => {
  //                   // อัพเดท PDF display
  //                   if (onPdfUpdate) {
  //                     onPdfUpdate(newPdfUrl, newPageCount);
  //                   }
  //                 }}
  //               />
  //             </Form.Item>
  //           </div>
  //         </div>
  //       </>
  //     ),
  //   },
  // ];
  const DefineDocsType = () => [
    {
      key: "1",
      label: (
        <div className="flex gap-2">
          <h3 className="font-black text-[#333333]">กำหนดรูปแบบ</h3>
        </div>
      ),
      children: (
        <>
          <div>
            <span className="font-[600] text-[16px] text-[#333]">
              รายละเอียด
            </span>
            <div
              className={`grid ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : isExternal
                  ? "lg:grid-cols-2"
                  : " lg:grid-cols-3"
              } sm:grid-cols-1 md:grid-cols-2 gap-4 my-2`}
            >
              {/* <Form.Item label="รูปแบบเอกสาร" name="docsType" className="!mb-0">
                <Select disabled placeholder="เลือก">
                  <Option value="B2B">B2B</Option>
                  <Option value="B2C">B2C</Option>
                </Select>
              </Form.Item> */}
              <Form.Item name="docsType" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                label="มาตรา"
                name={["docsTypeDetail", "section"]}
                rules={getRules("section")}
                className="!mb-0"
                initialValue={B2BformData.forms?.docsTypeDetail?.section || "มาตรา 9"}
              >
                <Select
                  placeholder="เลือก"
                  onChange={(value) => {
                    form.setFieldsValue({
                      docsTypeDetail: { section: value },
                    });
                  }}
                  disabled={style === "1column"}
                >
                  <Option value="มาตรา 9">มาตรา 9</Option>
                  <Option value="มาตรา 26 และมาตรา 28">
                    มาตรา 26 และมาตรา 28 (ใช้ CA สำหรับการลงนาม)
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="ช่องทางการชำระอากรแสตมป์"
                name={["docsTypeDetail", "paymentChannel"]}
                rules={getRules("paymentChannel")}
                className="!mb-0"
              >
                <Select
                  onChange={(value) =>
                    setIsExternal(
                      value === "นอกระบบ" || value === "ไม่ชำระอากรแสตมป์"
                    )
                  }
                  placeholder="เลือก"
                  disabled={style === "1column"}
                >
                  {B2BformData.forms?.docsType == "B2B" && (
                    <Option value="ในระบบ">ในระบบ</Option>
                  )}
                  <Option value="นอกระบบ">นอกระบบ</Option>
                  <Option value="ไม่ชำระอากรแสตมป์">ไม่ชำระอากรแสตมป์</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="กำหนดผู้ชำระอากรแสตมป์"
                name={["docsTypeDetail", "stampDutyBizPayer"]}
                rules={isExternal ? [] : getRules("stampDutyBizPayer")}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Select
                  disabled={isExternal || style === "1column"}
                  placeholder="เลือก"
                >
                  <Option value="contractor">ต้นสัญญา</Option>
                  <Option value="partner">คู่สัญญา</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className={`mt-4 ${isExternal ? "hidden" : ""}`}>
            <span className="font-[600] text-[16px] text-[#333]">
              ผู้ชำระอากรแสตมป์
            </span>
            <div
              className={`grid ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              } gap-4 my-2`}
            >
              <Form.Item
                label="ชื่อ-นามสกุล"
                name={["docsTypeDetail", "stampDutyPlayer", "fullName"]}
                rules={isExternal ? [] : getRules("fullName")}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Input
                  disabled={isExternal || style === "1column"}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </Form.Item>

              {/* <Form.Item
                label="เลขบัตรประจำตัวประชาชน"
                name={["docsTypeDetail", "stampDutyPlayer", "idCard"]}
                rules={isExternal ? [] : FormB2BRuleConfig.idCard}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Input
                  disabled={isExternal || style === "1column"}
                  maxLength={maxLength}
                  placeholder="กรอกเลขบัตรประจำตัวประชาชน"
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    const trimmed = onlyNumbers.slice(0, 13);
                    e.target.value = trimmed;
                  }}
                  onKeyDown={numericOnlyKeyDown()}
                />

              </Form.Item> */}

              <Form.Item
                label="อีเมล"
                name={["docsTypeDetail", "stampDutyPlayer", "email"]}
                rules={isExternal ? [] : getRules("email")}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Input
                  disabled={isExternal || style === "1column"}
                  placeholder="กรอกอีเมล"
                />
              </Form.Item>
            </div>
          </div>
          {/* <div className="mt-4">
          <span className="font-[600] text-[16px] text-[#333]">
              วันหมดอายุเอกสาร
            </span>
            <div
              className={`grid ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              } gap-x-4 my-2`}
            >
              <Form.Item
                label="วันที่เริ่ม"
                name={["docsTypeDetail", "startDocsDate"]}
                // rules={isExternal ? [] : FormB2BRuleConfig.fullName}
                className={`!mb-0 ${isExternal ? "" : ""}`}
                getValueFromEvent={(date) => (date ? dayjs(date) : null)}
              >
              <DatePicker picker="date" disabled={style === "1column" } placeholder="ระบุวันที่เริ่ม" format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
  noStyle
  shouldUpdate={(prev, cur) =>
    prev.docsTypeDetail?.startDocsDate !== cur.docsTypeDetail?.startDocsDate
  }
>
  {({ getFieldValue }) => {
    const startDate = getFieldValue(["docsTypeDetail", "startDocsDate"]);
    return (
      <Form.Item
        label="วันที่สิ้นสุด"
        name={["docsTypeDetail", "endDocsDate"]}
      >
        <DatePicker
          placeholder="ระบุวันที่สิ้นสุด"
          style={{ width: "100%" }}
          format="YYYY-MM-DD"
          disabled={
            style === "1column" || !startDate // 🔒 disable ถ้า style เป็น 1column หรือยังไม่มี startDate
          }
          disabledDate={(current) =>
            startDate ? current && current.isBefore(startDate, "day") : false
          } // ป้องกันเลือกวันก่อนหน้า startDate
        />
      </Form.Item>
    );
  }}
</Form.Item>
              <Form.Item
                name={["docsTypeDetail", "isRenewal"]}
                // rules={isExternal ? [] : FormB2BRuleConfig.fullName},
                className={`!mb-0 ${isExternal ? "" : ""}`}
              >
              <Checkbox checked={isCheckedRenewDocs} onChange={(value)=> setIsCheckedRenewDocs(value.target.checked)}>ต่ออายุเอกสาร</Checkbox>
              </Form.Item>
            </div>
            <div className={`grid ${ isCheckedRenewDocs ? '' : 'hidden'} ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              } gap-4 my-2`}>
            <Form.Item
                label="เลขที่อ้างอิง"
                name={["docsTypeDetail", "refDocs"]}
                rules={!isCheckedRenewDocs ? [] : FormB2BRuleConfig.refDocs}
                className={`!mb-0 ${isExternal ? "" : ""}`}
              >
              <Input
                  // disabled={isExternal || style === "1column"}
                  placeholder="ระบุเลขที่อ้างอิง"
                />
              </Form.Item>
              <Form.Item
                label="แจ้งเตือนต่ออายุเอกสาร"
                name={["docsTypeDetail", "notificationRenewDocs"]}
                rules={!isCheckedRenewDocs ? [] : FormB2BRuleConfig.notificationRenewDocs}
                className={`!mb-0 ${isExternal ? "" : ""}`}
              >
                                          <Select
                              placeholder="เลือกแจ้งเตือนต่ออายุเอกสาร"
                              // disabled={approverIndex === 0 || checkUserList.length > 0}
                            >
                              <Option value="7">7 วัน</Option>
                              <Option value="14">14 วัน</Option>
                              <Option value="30">30วัน</Option>
                              <Option value="60">60 วัน</Option> 
                              <Option value="90">90 วัน</Option>
                            </Select>
              </Form.Item>
            </div>

          </div> */}
        </>
      ),
    },
  ];

  const DefineContractParty = () => [
    {
      key: "2",
      label: (
        <div className="flex gap-2">
          <h3 className="font-black text-[#333333]">ข้อมูลคู่สัญญา</h3>
        </div>
      ),
      children: (
        <>
          <div>
            {/* <span className="font-[600] text-[16px] text-[#333]">
              รายละเอียด
            </span> */}
            <div
              className={`grid ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              } gap-4 my-2`}
              // className={`grid ${
              //   currentPath[0]
              //     ? "lg:grid-cols-1"
              //     : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              // } gap-4 my-2`}
            >
              {B2BformData.forms?.docsType == "B2B" && (
                <Form.Item
                  label="TaxID"
                  name={["contractParty", "taxId"]}
                  rules={getRules("taxId")}
                  className="!mb-0"
                >
                  <Input
                    placeholder="กรอก Tax ID"
                    disabled={style === "1column"}
                  />
                </Form.Item>
              )}
            </div>
            <div className="font-semibold text-[600] mt-[12px]">
              ผู้ดำเนินการ
            </div>
            <div
              className={`grid ${
                style == "1column"
                  ? "grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
              } gap-4 my-2`}
            >
              <Form.Item
                label="ชื่อ-นามสกุล"
                name={["contractParty", "operator", "name"]}
                rules={getRules("fullName")}
                className="!mb-0"
              >
                <Input
                  placeholder="กรอกชื่อ-นามสกุล"
                  disabled={style === "1column"}
                />
              </Form.Item>
              {/*               <Form.Item
                label="เลขบัตรประจำตัวประชาชน"
                name={["contractParty", "operator", "idCard"]}
                rules={getRules("idCard")}
                className="!mb-0"
              >
                <Input maxLength={maxLength}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    const trimmed = onlyNumbers.slice(0, 13);
                    e.target.value = trimmed;
                  }}
                  onKeyDown={numericOnlyKeyDown()}
                placeholder="กรอกเลขบัตรประจำตัวประชาชน" />
              </Form.Item> */}
              <Form.Item
                label="อีเมล"
                name={["contractParty", "operator", "email"]}
                rules={getRules("email")}
                className="!mb-0"
              >
                <Input placeholder="กรอกอีเมล" disabled={style === "1column"} />
              </Form.Item>
              <Form.Item
                name={["contractParty", "operator", "userName"]}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item name={["contractParty", "operator", "hasCa"]} hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name={["contractParty", "operator", "isInBusiness"]}
                hidden
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["contractParty", "operator", "accountId"]}
                hidden
              >
                <Input />
              </Form.Item>
            </div>

            <Form.List name={["contractParty", "approvers"]}>
              {(fields, { add: addApprover, remove: removeApprover }) => {
                // เก็บ removeApprover function ไว้ใน ref
                removeApproverRef.current = removeApprover;
                return (
                  <>
                    {fields.length > 0 && (
                      <div className="flex items-center mt-6 mb-2">
                        <h3 className="font-bold text-[#333]">ผู้อนุมัติ</h3>
                      </div>
                    )}

                    {fields?.map((field, approverIndex) => {
                      // const allValues = form.getFieldsValue(true);
                      // const userList =
                      //   allValues.contractParty?.approvers?.[approverIndex]
                      //     ?.userList || [];

                      // ตรวจสอบว่าผู้ใช้ลำดับแรกถูกบันทึกหรือยัง
                      const isApproverSaved =
                        !!savedUserList[`${approverIndex}-0`];

                      // console.log("approverIndex =>", approverIndex);
                      // console.log("isApproverSaved !!! ", isApproverSaved);

                      return (
                        <div key={field.key} className="rounded-md mb-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="flex items-center font-bold text-[#333] gap-2">
                                {style !== "1column" && (
                                  <UserRound className="w-[20px] h-[20px] text-[#0153BD]" />
                                )}
                                ผู้อนุมัติลำดับที่ {approverIndex + 1}
                              </span>
                            </div>
                            <div className="flex space-x-2 items-center">
                              {style !== "1column" && approverIndex > 0 && (
                                <Trash
                                  className="text-[#0153BD] w-[20px] h-[20px] hover:text-red-500 cursor-pointer"
                                  onClick={() =>
                                    setConfirmRemoveApprover({
                                      open: true,
                                      fieldName: field.name,
                                    })
                                  }
                                />
                              )}
                            </div>
                          </div>

                          {/* ฟิลด์เลือกสิทธิ์และประเภท */}
                          <div
                            className={`grid ${
                              style == "1column"
                                ? "grid-cols-1"
                                : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                            } gap-4 my-2`}
                          >
                            {/* <Form.Item
                            {...field}
                            label="สิทธิ์"
                            name={[field.name, "approverType"]}
                            rules={getRules("approverType")}
                            className="!mb-0"
                            key={`approver-${field.key}-${approverIndex}-approverType`}
                          >
                            <Select
                              placeholder="เลือกสิทธิ์"
                              disabled={approverIndex === 0 || checkUserList.length > 0}
                            >
                              <Option value="internal">ต้นสัญญา</Option>
                              <Option value="external">คู่สัญญา</Option>
                            </Select>
                          </Form.Item> */}
                            <Form.Item
                              shouldUpdate={(prev, cur) =>
                                prev.contractParty?.approvers?.[approverIndex]
                                  ?.userList !==
                                cur.contractParty?.approvers?.[approverIndex]
                                  ?.userList
                              }
                              noStyle
                            >
                              {({ getFieldValue }) => {
                                const userList =
                                  getFieldValue([
                                    "contractParty",
                                    "approvers",
                                    approverIndex,
                                    "userList",
                                  ]) || [];
                                // const isDisabled = approverIndex === 0 || userList.length > 0;

                                return (
                                  <Form.Item
                                    {...field}
                                    label="สิทธิ์"
                                    name={[field.name, "approverType"]}
                                    rules={getRules("approverType")}
                                    className="!mb-0"
                                    key={`approver-${field.key}-${approverIndex}-approverType`}
                                  >
                                    <Select
                                      placeholder="เลือกสิทธิ์"
                                      // disabled={isDisabled}
                                    >
                                      <Option value="internal">ต้นสัญญา</Option>
                                      <Option value="external">คู่สัญญา</Option>
                                    </Select>
                                  </Form.Item>
                                );
                              }}
                            </Form.Item>

                            <Form.Item
                              {...field}
                              label="ประเภท"
                              name={[field.name, "permissionType"]}
                              rules={getRules("permissionType")}
                              className="!mb-0"
                              key={`approver-${field.key}-${
                                approverIndex + 1
                              }-approverType`}
                            >
                              <Select
                                placeholder="เลือกประเภท"
                                options={plainOptions}
                                disabled={style === "1column"}
                              />
                            </Form.Item>
                          </div>

                          {/* Form.List ของ userList */}
                          <Form.List name={[field.name, "userList"]}>
                            {(
                              userFields,
                              { add: addUser, remove: removeUser }
                            ) => {
                              // const allValues = form.getFieldsValue(true);
                              // const userList =
                              //   allValues.contractParty?.approvers?.[
                              //     approverIndex
                              //   ]?.userList || [];

                              return (
                                <>
                                  <div
                                    className={`rounded-xl p-2 ${
                                      approverIndex > 0 ? "bg-[#FCFCFC]" : ""
                                    } `}
                                  >
                                    {/* แสดง UserField */}
                                    {approverIndex > 0 && (
                                      <FindMailInterface
                                        addUser={addUser}
                                        approverIndex={approverIndex}
                                      />
                                    )}
                                    {approverIndex > 0 &&
                                      userFields?.map(
                                        (userField, userIndex) => (
                                          <UserField
                                            key={userField.key}
                                            userField={userField}
                                            userIndex={userIndex}
                                            approverIndex={approverIndex}
                                            form={form}
                                            style={style}
                                            handleSaveUser={() =>
                                              handleSaveUser(
                                                approverIndex,
                                                userIndex
                                              )
                                            }
                                            handleAddNext={() => addUser()}
                                            handleRemoveUser={(index) => {
                                              removeUser(index);
                                              // ลบจาก savedUserList ด้วย
                                              setSavedUserList((prev) => {
                                                const newList = { ...prev };
                                                delete newList[
                                                  `${approverIndex}-${index}`
                                                ];

                                                // ปรับ key ของผู้ใช้ที่อยู่หลัง index ที่ถูกลบ
                                                Object.keys(newList).forEach(
                                                  (key) => {
                                                    const [appIdx, uIdx] = key
                                                      .split("-")
                                                      .map(Number);
                                                    if (
                                                      appIdx ===
                                                        approverIndex &&
                                                      uIdx > index
                                                    ) {
                                                      newList[
                                                        `${approverIndex}-${
                                                          uIdx - 1
                                                        }`
                                                      ] = newList[key];
                                                      delete newList[key];
                                                    }
                                                  }
                                                );
                                                // console.log("newList =>", newList);
                                                return newList;
                                              });
                                            }}
                                            isSaved={
                                              !!savedUserList[
                                                `${approverIndex}-${userIndex}`
                                              ]
                                            }
                                          />
                                        )
                                      )}

                                    {/* ปุ่มอยู่ตรงกลาง */}
                                    {approverIndex !== 0 && (
                                      <div
                                        className={`flex justify-center items-center gap-4 py-2 ${
                                          userFields.length === 0
                                            ? ""
                                            : "bg-[#FCFCFC]"
                                        } rounded-b-xl`}
                                      >
                                        {/* ปุ่มบันทึกข้อมูล */}
                                        {/* {userFields.length > 0 &&
                                      userFields.some(
                                        (_, idx) =>
                                          !savedUserList[
                                            `${approverIndex}-${idx}`
                                          ]
                                      ) && (
                                        <Button
                                          type="primary"
                                          ghost
                                          loading={
                                            !!loadings[
                                              `${approverIndex}-saveBtn`
                                            ]
                                          }
                                          onClick={async () => {
                                            const nextIdx =
                                              userFields.findIndex(
                                                (_, idx) =>
                                                  !savedUserList[
                                                    `${approverIndex}-${idx}`
                                                  ]
                                              );
                                            if (nextIdx === -1) return;
                                            try {
                                              await form.validateFields([
                                                [
                                                  "contractParty",
                                                  "approvers",
                                                  approverIndex,
                                                  "userList",
                                                  nextIdx,
                                                  "fullName",
                                                ],
                                                [
                                                  "contractParty",
                                                  "approvers",
                                                  approverIndex,
                                                  "userList",
                                                  nextIdx,
                                                  "idCard",
                                                ],
                                                [
                                                  "contractParty",
                                                  "approvers",
                                                  approverIndex,
                                                  "userList",
                                                  nextIdx,
                                                  "email",
                                                ],
                                              ]);
                                            } catch (err) {
                                              return;
                                            }

                                            setLoadings((prev) => ({
                                              ...prev,
                                              [`${approverIndex}-saveBtn`]:
                                                true,
                                            }));

                                            try {
                                              await handleSaveUser(
                                                approverIndex,
                                                nextIdx
                                              ); // ต้อง await
                                            } catch (err) {
                                              console.error(err);
                                            } finally {
                                              // ปิด loading
                                              setLoadings((prev) => ({
                                                ...prev,
                                                [`${approverIndex}-saveBtn`]:
                                                  false,
                                              }));
                                            }
                                          }}
                                          className="text-[#0153BD] w-[140px] rounded-xl border-none p-1 flex items-center justify-center underline underline-offset-4"
                                        >
                                          บันทึกข้อมูล
                                        </Button>
                                      )} */}

                                        {/* ปุ่มเพิ่มลำดับ */}
                                        {/* {(
                                      <Button
                                        type="primary"
                                        ghost
                                        onClick={() =>
                                          addUser({
                                            fullName: "",
                                            idCard: "",
                                            email: "",
                                            isSaved: false,
                                          })
                                        }
                                        className={`${style === '1column' ? 'hidden': ''} text-[#0153BD] w-[140px] rounded-xl border-none p-1 flex items-center justify-center underline underline-offset-4`}
                                      >
                                        เพิ่มลำดับ
                                      </Button>
                                    )} */}
                                        {/* {userFields.every(
                                      (_, idx) =>
                                        savedUserList[`${approverIndex}-${idx}`]
                                    ) && (
                                      <Button
                                        type="primary"
                                        ghost
                                        onClick={() =>
                                          addUser({
                                            fullName: "",
                                            idCard: "",
                                            email: "",
                                            isSaved: false,
                                          })
                                        }
                                        className={`${style === '1column' ? 'hidden': ''} text-[#0153BD] w-[140px] rounded-xl border-none p-1 flex items-center justify-center underline underline-offset-4`}
                                      >
                                        เพิ่มลำดับ
                                      </Button>
                                    )} */}
                                      </div>
                                    )}
                                  </div>
                                </>
                              );
                            }}
                          </Form.List>
                        </div>
                      );
                    })}

                    {/* ปุ่มเพิ่มผู้อนุมัติ */}
                    {style !== "1column" && (
                      <div className="flex items-center justify-center w-full">
                        <Button
                          type="primary"
                          ghost
                          className="w-[140px] rounded-xl border-none"
                          onClick={() => {
                            // const currentValues = form.getFieldsValue(true); // ดึงค่าปัจจุบันทั้งหมด
                            // const currentApprovers =
                            //   currentValues.contractParty?.approvers || [];

                            // เพิ่ม approver ใหม่
                            const newApprover = {
                              approverType: undefined,
                              permissionType: undefined,
                              userList:
                                // currentApprovers.length >= 1
                                //   ? [
                                //       {
                                //         fullName: "",
                                //         idCard: "",
                                //         email: "",
                                //         userName: "",
                                //         hasCa: false,
                                //         isInBusiness: false,
                                //         isSaved: false
                                //       },
                                //     ]
                                //   :
                                [], // ถ้า index >=1 ให้มี userList เริ่มต้น
                            };

                            addApprover(newApprover); // addApprover จาก Form.List
                          }}
                        >
                          <Plus size={16} /> เพิ่มผู้อนุมัติ
                        </Button>
                      </div>
                    )}
                  </>
                );
              }}
            </Form.List>
          </div>
        </>
      ),
    },
  ];
  return (
    // name={["docsTypeDetail", "paymentChannel"]}
    <Form
      form={form}
      layout="vertical"
      className={style === "1column" ? "form-b2b-1column" : ""}
      onValuesChange={handleFormChange}
      initialValues={{
        docsType: B2BformData.forms?.docsType || "B2B",
        // docsTypeDetail: { paymentChannel : "ในระบบ"},
        docsTypeDetail: {},
        contractParty: {
          approvers: [
            {
              approverType: "internal",
              permissionType: undefined,
              userList: [
                {
                  fullName: "",
                  idCard: "",
                  email: "",
                  userName: "",
                  hasCa: false,
                  isInBusiness: false,
                  isSaved: true,
                },
              ],
            },
          ],
        },
      }}
    >
      {/* <div className="[&_.ant-collapse-content]:border-t-0">
        <Collapse
          className="bg-[#F0F6FF] border-[#F0F6FF] my-4"
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <ChevronDown
              className="bg-theme rounded-full p-1"
              size={28}
              color="white"
              style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
            />
          )}
          items={open ? DefineDocsUpload() : []}
        />
      </div> */}
      <div className="[&_.ant-collapse-content]:border-t-0">
        <Collapse
          className="bg-[#F0F6FF] border-[#F0F6FF] my-4"
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <ChevronDown
              className="bg-theme rounded-full p-1"
              size={28}
              color="white"
              style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
            />
          )}
          items={DefineDocsType()}
        />
      </div>

      <div className="[&_.ant-collapse-content]:border-t-0">
        <Collapse
          className="bg-[#F0F6FF] border-[#F0F6FF] my-4"
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <ChevronDown
              className="bg-theme rounded-full p-1"
              size={28}
              color="white"
              style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
            />
          )}
          items={DefineContractParty()}
        />
      </div>

      <ConfirmModal
        titleName="ยืนยันการลบ"
        message="คุณแน่ใจหรือไม่ที่จะลบผู้อนุมัติรายการนี้? เมื่อลบแล้วต้องวางตำแหน่งลำดับทั้งหมดใหม่"
        open={!isDocumentPath && confirmRemoveApprover.open}
        onConfirm={() => {
          if (
            confirmRemoveApprover.fieldName !== null &&
            removeApproverRef.current
          ) {
            // ลบ element mapping ทั้งหมด
            // console.log("canvasState =>", canvasState);
            if (onConfirmResetAllMapping) {
              onConfirmResetAllMapping();
            }
            // ลบผู้อนุมัติ
            removeApproverRef.current(confirmRemoveApprover.fieldName);
          }
          setConfirmRemoveApprover({ open: false, fieldName: null });
        }}
        onCancel={() =>
          setConfirmRemoveApprover({ open: false, fieldName: null })
        }
        confirmButtonText="ลบ"
      />
    </Form>
  );
};
