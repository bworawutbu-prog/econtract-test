"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Collapse,
  Select,
  Input,
  Button,
  Typography,
  Tooltip,
  message,
} from "antd";
import { ChevronDown, Trash, Plus, CircleMinus, UserRound } from "lucide-react";
import {
  SearchOutlined,
  UserAddOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { B2BSearchByEmailOrName } from "@/store/documentStore/profileB2BAPI";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { enqueueSnackbar } from "notistack";
import type { Rule } from "antd/es/form";
import { STORAGE_KEYS } from "@/store/utils/localStorage";
import { usePathname } from "next/navigation";
import { UserListData } from "@/store/types/contractB2BType";
import appEmitter from "@/store/libs/eventEmitter";
import debounce from 'lodash/debounce';

interface FormB2CProps {
  open: boolean;
  pdfPage: number;
  pdfObject: any;
  form: any; // AntD form instance จาก Modal
  style?: string;
  onPdfUpdate?: (newPdfUrl: string, newPageCount: number) => void;
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

interface GetB2CMailUserData {
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

const FormB2CRuleConfig: Record<string, Rule[]> = {
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
    {
      min: 13,
      max: 13,
      message: "เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก",
    },
  ],
  email: [
    { required: true, message: "อีเมลเป็นข้อมูลที่จำเป็น" },
    {
      type: "email",
      message: "รูปแบบอีเมลไม่ถูกต้อง",
    },
  ],
  // taxId: [{ required: true, message: "TaxID เป็นข้อมูลที่จำเป็น" }],
  approverType: [{ required: true, message: "สิทธิ์เป็นข้อมูลที่จำเป็น" }],
  permissionType: [{ required: true, message: "ประเภทเป็นข้อมูลที่จำเป็น" }],
};

export const FormB2C: React.FC<FormB2CProps> = ({
  open,
  pdfPage,
  pdfObject,
  form,
  style,
  onPdfUpdate,
}) => {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const userProfile = useAppSelector((state) => state.userProfile);
  const pathname = usePathname();
  const currentPath = pathname.split("/").filter(Boolean);
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
  const [isAddUserList, setAddUserList] = useState<boolean>(false);
  const [userSaveList, setUserSaveList] = useState<any[]>([]);
  const [savedUserList, setSavedUserList] = useState<Record<string, boolean>>(
    {}
  );
  const [loadings, setLoadings] = useState<Record<string, boolean>>({});
  const [isSuccessStatus, setIsSuccessStatus] = useState<boolean>(false);
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const B2BformData = useAppSelector((state) => state.contractB2BForm);

  useEffect(() => {
    // console.log("currpath => ");
    const currPath = pathname.split("/").filter(Boolean);

    if (currPath && currPath[0] === "document") {
      // form.resetFields();
      getUserData();
      appEmitter.emit("formB2BUpdated", { isValid: checkValidateFormB2B() });
    }
  }, [pathname]);

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

  const mapUserData = (data: any): UserListData => {
    return {
      fullName: data.name,
      idCard: data.id_card,
      email: data.email,
      userName: data.email, // ถ้าจะใช้ email เป็น userName
      hasCa: data.has_ca,
      isInBusiness: data.is_in_business,
      accountId: data.id,
    };
  };

  // Set default values from B2BformData when style is "1column"
  useEffect(() => {
    if (style === "1column" && B2BformData.forms) {
      // console.log(
      //   "🔄 Setting default values from B2BformData:",
      //   B2BformData.forms
      // );
      // console.log("🔄 Setting default values from B2BformData:", B2BformData.forms);
      // console.log("form party =>",B2BformData.forms.contractParty)
      const mappedApprovers = (
        B2BformData.forms.contractParty?.approvers || []
      ).map((approver: any) => ({
        ...approver,
        userList: (approver.userList || []).map(mapUserData),
      }));
      // console.log('mapped => ',mappedApprovers);
      const defaultValues = {
        docsType: B2BformData.forms.docsType || "B2B",
        docsTypeDetail: B2BformData.forms.docsTypeDetail || {},
        contractParty: {
          ...B2BformData.forms.contractParty,
          approvers: mappedApprovers,
        },
      };
      // console.log('final ===>',defaultValues)
      // form.setFieldsValue(B2BformData.forms);
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

  const checkValidateFormB2B = useCallback(() => {
    // console.log('checkValidateFormB2B => ')
    const values = form.getFieldsValue(true); // get all values
    // console.log('values =>',values)
    const contractParty = values.contractParty;
    const docsTypeDetail = values.docsTypeDetail;

    if (docsTypeDetail && contractParty) {
      if (
        !docsTypeDetail?.section ||
        !docsTypeDetail?.paymentChannel ||
        // !contractParty?.taxId ||
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
        const isExternalData = contractParty?.approvers;
        // const checkApprove = isExternal.some((i:any) => i.approverType === "external"); // ถ้าไม่มี "นอกระบบ" อย่างน้อย 1 รายการให้ return false;
        const checkPermission = isExternalData.every(
          (i: any) => i.permissionType && i.permissionType !== ""
        );
        if (!checkPermission) {
          return false;
        }
      }

      const checkUserList = contractParty.approvers.every(
        (approver: any, index: number) => {
          if (index === 0) return true; // ยกเว้นตัวแรก
          return approver?.userList.every(
            (user: any) =>
              user?.fullName &&
              user?.fullName.trim() !== "" &&
              user?.email &&
              user?.email.trim() !== "" &&
              // && user.idCard && user.idCard.trim() !== ""
              (user?.idCard && user?.idCard.length > 0
                ? user?.idCard.length === 13
                : true)
          );
        }
      );
    }
    return true;
  }, [form]);

  const getUserData = async () => {
    try {
      const userData =
        localStorage.getItem(STORAGE_KEYS.PERSIST_AUTH) || "no data";
      const convertData = JSON.parse(userData);
      if (convertData && convertData.user) {
        const authData = JSON.parse(convertData?.user);
        // console.log('autdData =>',authData)
        const userEmail = authData.email || "";
        // ดึงค่าปัจจุบันจากฟอร์ม
        const currentValues = form.getFieldsValue(true);

        // set ค่าใหม่เข้าไปใน userList[0]
        form.setFieldsValue({
          ...currentValues,
          contractParty: {
            ...currentValues?.contractParty,
            approvers: currentValues?.contractParty?.approvers?.map(
              (approver: any, index: number) => {
                if (index === 0) {
                  return {
                    ...approver,
                    userList: approver?.userList?.map(
                      (user: any, userIndex: number) => {
                        if (userIndex === 0) {
                          return {
                            ...user,
                            email: userEmail,
                            fullName:
                              `${userProfile?.data?.first_name_th} ${userProfile?.data?.last_name_th}` ||
                              "",
                            userName: authData?.username || "",
                            accountId: authData?.id || "",
                            hasCa: authData?.has_ca || false,
                            isInBusiness: authData?.is_in_business || false,
                          };
                        }
                        return user;
                      }
                    ),
                  };
                }
                return approver;
              }
            ),
          },
        });
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
    let data: GetB2CMailUserData = {} as GetB2CMailUserData;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const checkMailType = emailPattern.test(value);
    // ถ้าเป็น mail
    if (checkMailType) {
      if (approverType === "external") {
        data = {
          tax_id,
          email: value,
        };
      } else {
        data = {
          email: value,
        };
      }
    } else {
      if (approverType === "external") {
        data = {
          tax_id,
          name: value,
        };
      } else {
        data = {
          name: value,
        };
      }
    }

    try {
      const response = await dispatch(B2BSearchByEmailOrName(data)).unwrap();
      return response;
    } catch (error: any) {
      console.log("🎯[FormB2B] Error B2BSearchByEmailOrName");
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
          return newList;
        });
      }
      appEmitter.emit("formB2BUpdated", { isValid: checkValidateFormB2B() });
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
    const allValues = form.getFieldsValue(true);
    const checkApproveType =
      allValues.contractParty.approvers[approverIndex].approverType;
    const taxId = allValues.contractParty.taxId;
    const approversIndexData =
      allValues.contractParty.approvers[approverIndex].userList;

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
        // if (!taxId) {
        //   taxIdWarning();
        //   return;
        // }
        if (!checkApproveType) {
          approverTypeWarning();
          return;
        }

        let mailList: any = [];

        mailList = await handleSearchUserInBusiness(
          checkApproveType,
          taxId,
          searchValue.trim()
        );
        if (mailList === null || mailList === undefined) {
          mailList = [];
        }

        setUserList(mailList);
        let resultList = [];
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
        form.setFieldValue([...basePath, "isSaved"], false);
      } else if (!isSuccess && !checkMail) {
        form.setFieldValue([...basePath, "fullName"], value);
        form.setFieldValue([...basePath, "idCard"], "");
        form.setFieldValue([...basePath, "email"], "");
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
        form.setFieldValue(
          [...basePath, "idCard"],
          userData.id_card_num == "DUMMY" ? "" : userData.id_card_num
        );
        form.setFieldValue([...basePath, "email"], userData.email);
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
      setSearchValue("");
      setShowNoResults(false);
    };
    const onSearch = (value: string) => {
      setSearchValue(value);
      setShowNoResults(!!value.trim());
    };

    return (
      <>
        {contextHolder}
        <div className={`${style === "1column" ? "hidden" : "mb-3 mt-1"}`}>
          <div className="mb-2 mt-1">
            <span className="font-bold text-[#333]">ค้นหาข้อมูลผู้ลงนาม</span>
          </div>
          <Select
            mode="multiple"
            labelInValue
            showSearch
            value={selectedValue}
            searchValue={searchValue}
            style={{ width: "100%" }}
            placeholder="ระบุชื่อ หรืออีเมลผู้ลงนาม"
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
    return (
      <div className="p-[8px] bg-[#FCFCFC] rounde-t-xl">
        <div className="flex justify-between items-center">
          <span className="flex font-bold text-[#333] gap-2">
            ลำดับที่ {userIndex + 1}
          </span>
          {/* ปุ่มลบ */}
          <Trash
            onClick={() => {
              handleRemoveUser(userIndex);
            }}
            className={`${
              style === "1column" ? "hidden" : ""
            } text-[#0153BD] w-[20px] h-[20px] hover:text-red-500 cursor-pointer`}
          />
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
            rules={FormB2CRuleConfig.fullName}
            className="flex-1 !mb-0"
          >
            <Input
              placeholder="กรอกชื่อ-นามสกุล"
              disabled={style === "1column"}
            />
          </Form.Item>

          <Form.Item
            name={[userField.name, "idCard"]}
            label="เลขบัตรประชาชน"
            rules={FormB2CRuleConfig.idCard}
            className="flex-1 !mb-0"
          >
            <Input
              placeholder="กรอกเลขบัตรประชาชน"
              maxLength={maxLength}
              disabled={style === "1column"}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                const trimmed = onlyNumbers.slice(0, 13);
                e.target.value = trimmed;
              }}
              onKeyDown={numericOnlyKeyDown()}
            />
          </Form.Item>

          <Form.Item
            name={[userField.name, "email"]}
            label="อีเมล"
            rules={FormB2CRuleConfig.email}
            className="flex-1 !mb-0"
          >
            <Input placeholder="กรอกอีเมล" disabled={style === "1column"} />
          </Form.Item>
        </div>
      </div>
    );
  };
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
              <Form.Item name="docsType" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                label="มาตรา"
                name={["docsTypeDetail", "section"]}
                rules={FormB2CRuleConfig.section}
                className="!mb-0"
                initialValue="มาตรา 9"
              >
                <Select
                  placeholder="เลือก"
                  onChange={(value) => {
                    form.setFieldValue(["docsTypeDetail", "section"], value);
                  }}
                  disabled={style === "1column"}
                >
                  <Option value="มาตรา 9">มาตรา 9</Option>
                  <Option value="มาตรา 26 และมาตรา 28">
                    มาตรา 26 และมาตรา 28
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="ช่องทางการชำระอากรแสตมป์"
                name={["docsTypeDetail", "paymentChannel"]}
                rules={FormB2CRuleConfig.paymentChannel}
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
                  <Option value="ในระบบ">ในระบบ</Option>
                  <Option value="นอกระบบ">นอกระบบ</Option>
                  <Option value="ไม่ชำระอากรแสตมป์">ไม่ชำระอากรแสตมป์</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="กำหนดผู้ชำระอากรแสตมป์"
                name={["docsTypeDetail", "stampDutyBizPayer"]}
                rules={isExternal ? [] : FormB2CRuleConfig.stampDutyBizPayer}
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
                rules={isExternal ? [] : FormB2CRuleConfig.fullName}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Input
                  disabled={isExternal || style === "1column"}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </Form.Item>
              <Form.Item
                label="อีเมล"
                name={["docsTypeDetail", "stampDutyPlayer", "email"]}
                rules={isExternal ? [] : FormB2CRuleConfig.email}
                className={`!mb-0 ${isExternal ? "hidden" : ""}`}
              >
                <Input
                  disabled={isExternal || style === "1column"}
                  placeholder="กรอกอีเมล"
                />
              </Form.Item>
            </div>
          </div>
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
            <div
              className={`grid ${
                style === "1column"
                  ? "lg:grid-cols-1"
                  : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              } gap-4 my-2`}
            >
              {/* <Form.Item
                label="TaxID"
                name={["contractParty", "taxId"]}
                rules={FormB2CRuleConfig.taxId}
                className="!mb-0"
              >
                <Input
                  placeholder="กรอก Tax ID"
                  disabled={style === "1column"}
                />
              </Form.Item> */}
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
                rules={FormB2CRuleConfig.fullName}
                className="!mb-0"
              >
                <Input
                  placeholder="กรอกชื่อ-นามสกุล"
                  disabled={style === "1column"}
                />
              </Form.Item>
              <Form.Item
                label="อีเมล"
                name={["contractParty", "operator", "email"]}
                rules={FormB2CRuleConfig.email}
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
              {(fields, { add: addApprover, remove: removeApprover }) => (
                <>
                  {fields.length > 0 && (
                    <div className="flex items-center mt-6 mb-2">
                      <h3 className="font-bold text-[#333]">ผู้อนุมัติ</h3>
                    </div>
                  )}

                  {fields?.map((field, approverIndex) => {
                    // ตรวจสอบว่าผู้ใช้ลำดับแรกถูกบันทึกหรือยัง
                    const isApproverSaved =
                      !!savedUserList[`${approverIndex}-0`];

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
                                onClick={() => removeApprover(field.name)}
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
                              const isDisabled =
                                approverIndex === 0 || userList.length > 0;

                              return (
                                <Form.Item
                                  {...field}
                                  label="สิทธิ์"
                                  name={[field.name, "approverType"]}
                                  rules={FormB2CRuleConfig.approverType}
                                  className="!mb-0"
                                  key={`approver-${field.key}-${approverIndex}-approverType`}
                                >
                                  <Select
                                    placeholder="เลือกสิทธิ์"
                                    disabled={isDisabled}
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
                            rules={FormB2CRuleConfig.permissionType}
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

                        <Form.List name={[field.name, "userList"]}>
                          {(
                            userFields,
                            { add: addUser, remove: removeUser }
                          ) => {
                            return (
                              <>
                                {/* Show FindMailInterface for internal approver type */}
                                <Form.Item
                                  shouldUpdate={(prev, cur) =>
                                    prev.contractParty?.approvers?.[approverIndex]
                                      ?.approverType !==
                                    cur.contractParty?.approvers?.[approverIndex]
                                      ?.approverType
                                  }
                                  noStyle
                                >
                                  {({ getFieldValue }) => {
                                    const currentApproverType = getFieldValue([
                                      "contractParty",
                                      "approvers",
                                      approverIndex,
                                      "approverType"
                                    ]);
                                    
                                    return approverIndex > 0 && currentApproverType === "internal" ? (
                                      <FindMailInterface
                                        addUser={addUser}
                                        approverIndex={approverIndex}
                                      />
                                    ) : null;
                                  }}
                                </Form.Item>

                                {/* แสดง UserField */}
                                {approverIndex > 0 &&
                                  userFields?.map((userField, userIndex) => (
                                    <UserField
                                      key={userField.key}
                                      userField={userField}
                                      userIndex={userIndex}
                                      approverIndex={approverIndex}
                                      form={form}
                                      style={style}
                                      handleSaveUser={() =>
                                        handleSaveUser(approverIndex, userIndex)
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
                                                appIdx === approverIndex &&
                                                uIdx > index
                                              ) {
                                                newList[
                                                  `${approverIndex}-${uIdx - 1}`
                                                ] = newList[key];
                                                delete newList[key];
                                              }
                                            }
                                          );
                                          return newList;
                                        });
                                      }}
                                      isSaved={
                                        !!savedUserList[
                                          `${approverIndex}-${userIndex}`
                                        ]
                                      }
                                    />
                                  ))}
                                {approverIndex !== 0 && (
                                  <div className={`flex justify-center items-center gap-4 py-2 ${userFields.length === 0 ? '' : 'bg-[#FCFCFC]'} rounded-b-xl`}>
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

                                    {/* ปุ่มเพิ่มลำดับ - แสดงเฉพาะ external approver type */}
                                    <Form.Item
                                      shouldUpdate={(prev, cur) =>
                                        prev.contractParty?.approvers?.[approverIndex]
                                          ?.approverType !==
                                        cur.contractParty?.approvers?.[approverIndex]
                                          ?.approverType
                                      }
                                      noStyle
                                    >
                                      {({ getFieldValue }) => {
                                        const currentApproverType = getFieldValue([
                                          "contractParty",
                                          "approvers",
                                          approverIndex,
                                          "approverType"
                                        ]);
                                        
                                        return currentApproverType === "external" ? (
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
                                        ) : null;
                                      }}
                                    </Form.Item>
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
                          // เพิ่ม approver ใหม่
                          const newApprover = {
                            approverType: undefined,
                            permissionType: undefined,
                            userList: [], // ถ้า index >=1 ให้มี userList เริ่มต้น
                          };

                          addApprover(newApprover); // addApprover จาก Form.List
                        }}
                      >
                        <Plus size={16} /> เพิ่มผู้อนุมัติ
                      </Button>
                    </div>
                  )}
                </>
              )}
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
        docsType: "B2C",
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
    </Form>
  );
};
