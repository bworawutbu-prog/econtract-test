"use client";

import React, { useState, useEffect, useRef } from "react";
import { Form, Select, Button, Collapse, Switch, Input, Divider } from "antd";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import AccessRight from "./FormComponents/AccessRight";
import { mockCompany } from "@/store/mockData/mockCompany";
import appEmitter from "@/store/libs/eventEmitter";
import { getApprover } from "@/store/token";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { citizenGetAll } from "@/store/backendStore/citizenAPI";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { enqueueSnackbar } from "notistack";

const { TextArea } = Input;

// Define form values type
interface FormSettings {
  title: string;
  documentId: string;
  version: string;
  status: "draft" | "published" | "archived";
  approvers: ApproverConfig[];
  typeCode: string;
}

interface EntityObject {
  id: string | null;
  name: string;
  email?: string;
  department?: string;
}

interface ApproverConfig {
  index: number;
  role: string;
  permission: string;
  section: string;
  validateType: string;
  validateData: string;
  entityType: string;
  entities: EntityObject[]; // Array of objects with id and name
  selfieVideo?: boolean;
  selfieMessage?: string;
  validateKey?: string;
}

interface SettingDocumentProps {
  formId?: string | null;
  documentId?: string;
  formTitle?: string;
  existingWorkflowData?: {
    approvers: {
      index: number;
      role: string;
      permission: string;
      section: string;
      validateType: string;
      validateData: string;
      entityType: string;
      entities: {
        id: string | null;
        name: string;
        email: string;
      }[];
      selfieVideo: boolean;
      selfieMessage: string;
    }[];
    formId: string;
    documentId: string | undefined;
  } | null;
  onClose?: () => void;
  onValidationChange?: (isValid: boolean) => void; // 🎯 เพิ่ม callback สำหรับส่ง validation status
  typeCode: string;
  onDocumentTypeChange?: (typeCode: string) => void; // 🎯 เพิ่ม callback สำหรับส่ง typeCode กลับ
  onFormDataChange?: (formData: any) => void; // 🎯 เพิ่ม callback สำหรับส่งข้อมูลฟอร์ม
  type?: string; // draft or create
}

interface ConvertedUser {
  id: string | null;
  name: string;
  email: string;
  department: string;
}

const panelStyle: React.CSSProperties = {
  marginBottom: 24,
  background: "#F0F6FF",
  borderRadius: "12px",
  border: "solid",
  borderWidth: "1px",
  borderColor: "#E6F0FF",
};

// Convert API response to the format expected by AccessRight
const convertApiDataToUsers = (apiData: any[]): ConvertedUser[] => {
  return apiData?.map((user) => ({
    id: user.id,
    name: `${user.first_name_th} ${user.last_name_th} ?? ""`,
    email: user.email ?? "",
    department: user.department ?? "",
  }));
};

const SettingDocument: React.FC<SettingDocumentProps> = ({
  formId, // Used for form identification
  documentId,
  formTitle = "แบบฟอร์มไม่มีชื่อ",
  existingWorkflowData,
  onClose,
  onValidationChange, // 🎯 รับ callback สำหรับส่ง validation status
  typeCode,
  onDocumentTypeChange, // 🎯 รับ callback สำหรับส่ง typeCode กลับ
  onFormDataChange, // 🎯 รับ callback สำหรับส่งข้อมูลฟอร์ม
  type,
}) => {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const citizenStoreData = useAppSelector((state) => state.citizen.data);
  const [form] = Form.useForm<FormSettings>();
  const initialDataSentRef = useRef(false); // Track if initial data has been sent
  const [approvers, setApprovers] = useState<ApproverConfig[]>(() => {
    // ถ้ามี existingWorkflowData ให้ใช้ข้อมูลจากนั้น
    if (
      existingWorkflowData?.approvers &&
      existingWorkflowData.approvers.length > 0
    ) {
      return existingWorkflowData.approvers;
    }

    // ถ้าไม่มี ให้ใช้ค่าเริ่มต้น
    return [
      {
        index: 1,
        role: "Creator",
        permission: "approver",
        section: "มาตรา 9",
        validateType: "",
        validateData: "",
        entityType: "sender",
        entities: [
          {
            id: getApprover()?.id || "",
            name: getApprover()?.email || "",
            email: getApprover()?.email || "",
          },
        ],
        selfieVideo: false,
        selfieMessage: "",
      },
    ];
  });
  const [convertedUsers, setConvertedUsers] = useState<ConvertedUser[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string;}>({});
  const [allCitizenData, setAllCitizenData] = useState<any[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>(["0"]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState<{ value: string; label: string }[]>([
    { value: "1", label: "หนังสือสัญญาเช่า" },
    { value: "2", label: "เอกสารใบรับรองแพทย์" },
    { value: "3", label: "เอกสารตรวจสอบทรัพย์สิน" },
    { value: "4", label: "กำหนดเอง" },
  ]);
  const [newDocumentType, setNewDocumentType] = useState<string>("");
  const [hasEmittedInitialData, setHasEmittedInitialData] = useState<boolean>(false);

  // Fetch citizen data when component mounts
  useEffect(() => {
      dispatch(citizenGetAll())
      .unwrap()
      .then((response) => {
        const users = convertApiDataToUsers(response);
        setConvertedUsers(users);
        setAllCitizenData(response); // Store raw API data for search
      })
      .catch((error: Error) => {
        // console.log(error);
        // If API fails, set empty array
        setConvertedUsers([]);
        setAllCitizenData([]);
      });
  }, [dispatch]);

  // Update approvers when existingWorkflowData changes
  useEffect(() => {
    if (existingWorkflowData?.approvers && existingWorkflowData.approvers.length > 0) {
      
      setApprovers(existingWorkflowData.approvers);
      // Update active keys to expand all panels when loading existing data
      const newActiveKeys = existingWorkflowData?.approvers?.map((_, index) => index.toString());
      setActiveKeys(newActiveKeys);
      
      // 🎯 FIXED: Only emit once when component first loads with existing data
      if (!hasEmittedInitialData) {
        appEmitter.emit("userSettingMapping", existingWorkflowData.approvers);
        setHasEmittedInitialData(true);
      }
    } else {

      const initialApprovers = [
        {
          index: 1,
          role: "Creator",
          permission: "approver",
          section: "มาตรา 9",
          validateType: "",
          validateData: "",
          entityType: "sender",
          entities: [
            {
              id: getApprover()?.id ?? "",
              name: getApprover()?.email ?? "",
              email: getApprover()?.email ?? "",
            },
          ],
          selfieVideo: false,
          selfieMessage: "",
        },
      ];
      // Emit the initial approvers data
      appEmitter.emit("userSettingMapping", initialApprovers);
    }
  }, [existingWorkflowData, hasEmittedInitialData]);

  // Validate all approvers when component mounts or approvers change
  useEffect(() => {
    const errors: { [key: number]: string } = {};
    
    approvers.forEach((approver, index) => {
      // Validate validateData input with proper validation
      if (approver.validateType === "Confirm OTP") {
        const phoneError = validatePhoneNumber(approver.validateData ?? "");
        if (phoneError) {
          errors[index] = phoneError;
        }
      } else if (approver.validateType === "Confirm Password") {
        const passwordError = validatePassword(approver.validateData ?? "");
        if (passwordError) {
          errors[index] = passwordError;
        }
      }
      
      // 🎯 NEW: Validate AccessRight selection for approvers (except first approver who is creator)
      if (approver.index !== 1) {
        if (approver.entityType === "personal" && 
            (!approver.entities || approver.entities.length === 0)) {
          errors[index] = "กรุณาเลือกผู้ใช้สำหรับผู้อนุมัติรายนี้";
        } else if (approver.entityType === "department" && 
                   (!approver.entities || approver.entities.length === 0)) {
          errors[index] = "กรุณาเลือกแผนกสำหรับผู้อนุมัติรายนี้";
        }
      }
    });
    
    setValidationErrors(errors);
  }, [form]);

  // 🎯 ส่ง validation status กลับไปยัง parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onValidationChange) {
      const isValid = isFormValid();
      if (type === "draft") {
        onValidationChange(true);
      } else {
        onValidationChange(isValid);
      }
    }
  }, [validationErrors, approvers]); // Remove onValidationChange from dependencies

  // Set initial values when form mounts or approvers change
  useEffect(() => {
    const formData = {
      approvers: approvers?.map((approver) => ({
        permission: approver.permission,
        section: approver.section,
        validateType: approver.validateType,
        entityType: approver.entityType,
        entities: approver.entities,
        selfieVideo: approver.selfieVideo,
        selfieMessage: approver.selfieMessage,
      })),
    };
    
    form.setFieldsValue(formData);
    
  }, [form, approvers]);

  // 🎯 ส่งค่าเริ่มต้น typeCode และ form data เมื่อ component mount
  useEffect(() => {
    // Only send initial data once
    if (!initialDataSentRef.current) {
      const initialDocumentType = typeCode || "1";
      
      // ส่ง typeCode เริ่มต้น
      if (onDocumentTypeChange) {
        onDocumentTypeChange(initialDocumentType);
      }
      
      // ส่งข้อมูลฟอร์มเริ่มต้น
      if (onFormDataChange) {
        const formData = {
          typeCode: initialDocumentType,
          approvers: approvers,
          formTitle: formTitle,
          documentId: documentId,
        };
        onFormDataChange(formData);
      }
      
      initialDataSentRef.current = true; // Mark as sent
    }
  }, [typeCode, formTitle, documentId]); // Remove callback functions from dependencies

  // 🎯 ส่งข้อมูลฟอร์มเมื่อ approvers เปลี่ยนแปลง
  useEffect(() => {
    // Only send if initial data has been sent
    if (initialDataSentRef.current && onFormDataChange) {
      const formData = {
        typeCode: form.getFieldValue('typeCode') || typeCode || "1",
        approvers: approvers,
        formTitle: formTitle,
        documentId: documentId,
      };
      
      // Use setTimeout to avoid infinite loops
      setTimeout(() => {
        onFormDataChange(formData);
      }, 0);
    }
  }, [approvers]); // Only watch approvers changes

  const handleFormSubmit = async (values: FormSettings): Promise<boolean> => {
    try {
      // จำลองการบันทึกข้อมูลไปยัง API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // สำเร็จ - ปิด modal โดยไม่มีการ redirect
      if (onClose) {
        onClose();
      }

      return true;
    } catch (error) {
      enqueueSnackbar(`🎯 [SettingDocument] Error saving settings: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
  };

  // Function to add a new approver
  const addApprover = () => {
    // Check if any existing approver has selected "มาตรา 26 และมาตรา 28"
    const hasPreviousSection26 = approvers.some(
      approver => approver.section === "มาตรา 26 และมาตรา 28" 
    );
    
    // Set the default section based on previous approvers
    const defaultSection = hasPreviousSection26 ? "มาตรา 26 และมาตรา 28" : "มาตรา 9";
    
    const newApprover: ApproverConfig = {
      index: approvers.length + 1,
      role: "",
      permission: "approver",
      section: defaultSection,
      validateType: "",
      entityType: "personal",
      entities: [],
      validateKey: "",
      validateData: "",
      selfieVideo: false,
      selfieMessage: "",
    };

    const updatedApprovers = [...approvers, newApprover];
    
    setApprovers(updatedApprovers);
    appEmitter.emit("userSettingMapping", updatedApprovers);
    
    // Update active keys to expand all panels
    const newActiveKeys = updatedApprovers?.map((_, index) => index.toString());
    setActiveKeys(newActiveKeys);
    
    // Update form fields with all approvers (including the new one)
    const updatedFormApprovers = updatedApprovers?.map((approver) => ({
      permission: approver.permission ?? "",
      section: approver.section ?? "มาตรา 9",
      validateType: approver.validateType ?? "",
      entityType: approver.entityType ?? "",
      entities: approver.entities ?? [],
      validateKey: approver.validateKey ?? "",
      validateData: approver.validateData ?? "",
      selfieVideo: approver.selfieVideo ?? false,
      selfieMessage: approver.selfieMessage ?? "",
    }));
    
    form.setFieldsValue({
      approvers: updatedFormApprovers,
    });
  };

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber: string): string | null => {
    // Remove all spaces and special characters
    const cleanedPhone = phoneNumber.replace(/\s+/g, '');
    
    // Check if empty
    if (!cleanedPhone.trim()) {
      return "กรุณากรอกหมายเลขโทรศัพท์";
    }
    
    // Check if contains only numbers
    if (!/^\d+$/.test(cleanedPhone)) {
      return "หมายเลขโทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
    }
    
    // Check length (Thai phone numbers are typically 9-10 digits)
    if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
      return "หมายเลขโทรศัพท์ต้องมี 9-10 หลัก";
    }
    
    // Check for repeated digits (like 0000000000, 1111111111)
    if (/^(\d)\1+$/.test(cleanedPhone)) {
      return "หมายเลขโทรศัพท์ไม่สามารถเป็นเลขซ้ำทั้งหมด";
    }
    
    // Check for sequential numbers
    const isSequential = (str: string) => {
      for (let i = 0; i < str.length - 1; i++) {
        if (parseInt(str[i]) + 1 !== parseInt(str[i + 1])) {
          return false;
        }
      }
      return true;
    };
    
    if (isSequential(cleanedPhone) || isSequential(cleanedPhone.split('').reverse().join(''))) {
      return "หมายเลขโทรศัพท์ไม่สามารถเป็นเลขเรียงต่อกัน";
    }
    
    return null;
  };

  // Function to validate password
  const validatePassword = (password: string): string | null => {
    if (!password.trim()) {
      return "กรุณากรอกรหัสผ่าน";
    }
    
    // Check minimum length
    if (password.length < 8) {
      return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว";
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว";
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*(),.?\":{}|<>)";
    }
    
    // Check for repeated characters (like 111, aaa, etc.)
    if (/(.)\1{2,}/.test(password)) {
      return "รหัสผ่านไม่สามารถมีตัวอักษรซ้ำกันเกิน 2 ตัวติดกัน";
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', 'password123', '12345678', 'qwerty123', 'abc123456',
      '11111111', '22222222', '33333333', '44444444', '55555555',
      '66666666', '77777777', '88888888', '99999999', '00000000'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      return "รหัสผ่านนี้ใช้งานง่ายเกินไป กรุณาเลือกรหัสผ่านที่ปลอดภัยกว่านี้";
    }
    
    return null;
  };

  // Function to validate validateData input
  const validateData = (approverIndex: number, value: string, validateType: string) => {
    const errors = { ...validationErrors };
    
    if (validateType === "Confirm OTP") {
      const phoneError = validatePhoneNumber(value);
      if (phoneError) {
        errors[approverIndex] = phoneError;
      } else {
        delete errors[approverIndex];
      }
    } else if (validateType === "Confirm Password") {
      const passwordError = validatePassword(value);
      if (passwordError) {
        errors[approverIndex] = passwordError;
      } else {
        delete errors[approverIndex];
      }
    } else {
      delete errors[approverIndex];
    }
    
    setValidationErrors(errors);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    
    // Check if any approver with validateType has validation errors
    for (const approver of approvers) {
      if (approver.validateType === "Confirm OTP") {
        const phoneError = validatePhoneNumber(approver.validateData || "");
        if (phoneError) {
          return false;
        }
      } else if (approver.validateType === "Confirm Password") {
        const passwordError = validatePassword(approver.validateData || "");
        if (passwordError) {
          return false;
        }
      }
      
      // 🎯 NEW: Check AccessRight selection for non-creator approvers
      if (approver.index !== 1) {
        if (approver.entityType === "personal" && 
            (!approver.entities || approver.entities.length === 0)) {
          return false;
        } else if (approver.entityType === "department" && 
                   (!approver.entities || approver.entities.length === 0)) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Function to toggle selfie video
  const handleSelfieVideoToggle = (checked: boolean, index: number) => {
    // Update our local state
    const updatedApprovers = [...approvers];
    updatedApprovers[index].selfieVideo = checked;

    // If turning off, clear the message
    if (!checked) {
      updatedApprovers[index].selfieMessage = "";
    } else {
      updatedApprovers[index].selfieMessage = "";
    }

    // Set the updated approvers
    
    setApprovers(updatedApprovers);
  };

  // Function to delete an approver
  const handleDeleteApprover = (index: number) => {
    // Cannot delete the first approver (creator)
    if (index === 0) return;

    // Get current approvers
    const updatedApprovers = [...approvers];

    // Remove the approver at the specified index
    updatedApprovers.splice(index, 1);

    // Update index numbers for all approvers after deletion
    updatedApprovers.forEach((approver, idx) => {
      approver.index = idx + 1;
    });

    // After deletion, check if any approver still has "มาตรา 26 และมาตรา 28"
    // If not, reset all approvers to "มาตรา 9"
    const hasSection26 = updatedApprovers.some(
      approver => approver.section === "มาตรา 26 และมาตรา 28"
    );
    
    if (!hasSection26) {
      // Reset all approvers to "มาตรา 9"
      updatedApprovers.forEach((approver) => {
        approver.section = "มาตรา 9";
      });
    } else {
      // If still has "มาตรา 26 และมาตรา 28", update subsequent approvers
      for (let i = 0; i < updatedApprovers.length; i++) {
        if (updatedApprovers[i].section === "มาตรา 26 และมาตรา 28") {
          // Update all subsequent approvers to have the same section
          for (let j = i + 1; j < updatedApprovers.length; j++) {
            updatedApprovers[j].section = "มาตรา 26 และมาตรา 28";
          }
          break;
        }
      }
    }

    // Update state and form
    setApprovers(updatedApprovers);
    appEmitter.emit("userSettingMapping", updatedApprovers);
    
    // Update active keys to reflect the new approver count
    const newActiveKeys = updatedApprovers.map((_, idx) => idx.toString());
    setActiveKeys(newActiveKeys);

    // Update form fields
    form.setFieldsValue({
      approvers: updatedApprovers?.map((approver) => ({
        permission: approver.permission ?? "",
        section: approver.section ?? "มาตรา 9",
        validateType: approver.validateType ?? "",
        entityType: approver.entityType ?? "",
        entities: approver.entities ?? [],
        validateKey: approver.validateKey ?? "",
        validateData: approver.validateData ?? "",
        selfieVideo: approver.selfieVideo ?? false,
        selfieMessage: approver.selfieMessage ?? "",
      })),
    });
  };

  // Update the department handling code
  const handleDepartmentSelection = (
    company: string,
    departments: string[]
  ) => {
    return departments.map((dept) => ({
      id: `${company}-${dept}`,
      name: dept,
    }));
  };

  // Function to get available section options based on previous approvers
  const getAvailableSectionOptions = (currentIndex: number) => {
    // For the first approver (creator), return all options
    if (currentIndex === 0) {
      return [
        { value: "มาตรา 9", label: "มาตรา 9" },
        { value: "มาตรา 26 และมาตรา 28", label: "มาตรา 26 และมาตรา 28" }
      ];
    }

    // Check if any previous approver has selected "มาตรา 26 และมาตรา 28"
    const hasPreviousSection26 = approvers
      .slice(0, currentIndex)
      .some(approver => approver.section === "มาตรา 26 และมาตรา 28");

    // If any previous approver selected "มาตรา 26 และมาตรา 28", 
    // current approver can only select "มาตรา 26 และมาตรา 28"
    if (hasPreviousSection26) {
      return [
        { value: "มาตรา 26 และมาตรา 28", label: "มาตรา 26 และมาตรา 28" }
      ];
    }

    // Otherwise, return all options
    return [
      { value: "มาตรา 9", label: "มาตรา 9" },
      { value: "มาตรา 26 และมาตรา 28", label: "มาตรา 26 และมาตรา 28" }
    ];
  };

  // Helper function to handle AccessRight changes
  const handleAccessRightChange = (index: number, type: "users" | "departments" | "accessType", value: any) => {
    const updatedApprovers = [...approvers];
    
    if (type === "accessType") {
      updatedApprovers[index].entityType = value === "private" ? "personal" : "department";
      updatedApprovers[index].entities = [];
      
      // Update form field
      form.setFieldValue(
        ["approvers", index, "entityType"],
        value === "private" ? "personal" : "department"
      );
      form.setFieldValue(["approvers", index, "entities"], []);
    } else if (type === "users") {
      const selectedEntities: EntityObject[] =
        value === "all"
          ? []
          : value?.map((user: any) => ({
              id: user.id, // Keep the original id (can be null)
              name: user.name ?? "",
              email: user.email ?? "",
              department: user.department ?? "",
            }));

      updatedApprovers[index].entities = selectedEntities;
      
      // Update form field
      form.setFieldValue(["approvers", index, "entities"], selectedEntities);
      
      // Clear validation error when user selects entities
      if (selectedEntities.length > 0) {
        const errors = { ...validationErrors };
        delete errors[index];
        setValidationErrors(errors);
      }
    } else if (type === "departments") {
      const departmentEntities: EntityObject[] = 
        value !== "all" 
          ? Object.entries(value).flatMap(([company, depts]) =>
              (depts as string[])?.map((dept) => ({
                id: `${company}-${dept}`,
                name: dept,
                email: `${company}-${dept}`,
              }))
            )
          : [];

      updatedApprovers[index].entities = departmentEntities;
      
      // Update form field
      form.setFieldValue(["approvers", index, "entities"], departmentEntities);
      
      // Clear validation error when user selects departments
      if (departmentEntities.length > 0) {
        const errors = { ...validationErrors };
        delete errors[index];
        setValidationErrors(errors);
      }
    }
    
    setApprovers(updatedApprovers);
  };

  // Generate Collapse items for approvers
  const getCollapseItems = () => {
    return approvers?.map((approver, index) => ({
      key: index.toString(),
      label: (
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center w-full justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <p>ผู้อนุมัติลำดับที่ {approver.index}</p>

              {approver.index === 1 && (
                <div className="flex items-center gap-2">
                  <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">
                    ผู้สร้างเอกสาร
                  </p>
                </div>
              )}
            </div>
            {approver.index !== 1 && (
              <button
                className="text-theme bg-white rounded-md p-2"
                onClick={() => handleDeleteApprover(index)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ),
      children: (
        <div className="pt-4">
          {/* For first approver (creator), show only section dropdown */}
          {approver.index === 1 ? (
            <Form.Item
              label="มาตรา"
              name={["approvers", index, "section"]}
              className="w-full !mb-0"
            >
              <Select
                suffixIcon={<ChevronDown size={20} />}
                value={approver.section}
                disabled={getAvailableSectionOptions(index).length === 1}
                onChange={(value) => {
                  const newApprovers = [...approvers];
                  newApprovers[index].section = value;
                  
                  // If "มาตรา 26 และมาตรา 28" is selected, 
                  // update all subsequent approvers to have the same section
                  if (value === "มาตรา 26 และมาตรา 28") {
                    for (let i = index + 1; i < newApprovers.length; i++) {
                      newApprovers[i].section = "มาตรา 26 และมาตรา 28";
                    }
                  } else if (value === "มาตรา 9") {
                    // If changing back to "มาตรา 9", check if no previous approvers have "มาตรา 26 และมาตรา 28"
                    const previousApproversHaveSection26 = newApprovers
                      .slice(0, index)
                      .some(approver => approver.section === "มาตรา 26 และมาตรา 28");
                    
                    // If no previous approvers have "มาตรา 26 และมาตรา 28", 
                    // subsequent approvers can also change to "มาตรา 9"
                    if (!previousApproversHaveSection26) {
                      for (let i = index + 1; i < newApprovers.length; i++) {
                        newApprovers[i].section = "มาตรา 9";
                      }
                    }
                  }
                  
                  setApprovers(newApprovers);
                  
                  // Update form values
                  const updatedFormApprovers = newApprovers?.map((approver) => ({
                    permission: approver.permission ?? "",
                    section: approver.section ?? "มาตรา 9",
                    validateType: approver.validateType ?? "",
                    entityType: approver.entityType ?? "",
                    entities: approver.entities ?? [],
                    validateKey: approver.validateKey ?? "",
                    validateData: approver.validateData ?? "",
                    selfieVideo: approver.selfieVideo ?? false,
                    selfieMessage: approver.selfieMessage ?? "",
                  }));
                  
                  form.setFieldsValue({
                    approvers: updatedFormApprovers,
                  });
                }}
                options={getAvailableSectionOptions(index)}
              />
            </Form.Item>
          ) : (
            // For other approvers, show all fields
            <>
              <div className="bg-[#FCFCFC] p-4 rounded-xl">
                <div className="flex w-full flex-wrap gap-4">
                  <div className="flex-1 min-w-[100px]">
                    <Form.Item
                      label="สิทธิ์"
                      name={["approvers", index, "permission"]}
                      className="w-full !mb-0"
                    >
                      <Select
                        suffixIcon={<ChevronDown size={20} />}
                        onChange={(value) => {
                          const newApprovers = [...approvers];
                          newApprovers[index].permission = value;
                          setApprovers(newApprovers);
                        }}
                        options={[
                          { value: "signer", label: "Signer" },
                          { value: "approver", label: "Approver" },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <Form.Item
                      label="มาตรา"
                      name={["approvers", index, "section"]}
                      className="w-full !mb-0"
                    >
                      <Select
                        suffixIcon={<ChevronDown size={20} />}
                        value={approver.section}
                        disabled={getAvailableSectionOptions(index).length === 1}
                        onChange={(value) => {
                          const newApprovers = [...approvers];
                          newApprovers[index].section = value;
                          
                          // If "มาตรา 26 และมาตรา 28" is selected, 
                          // update all subsequent approvers to have the same section
                          if (value === "มาตรา 26 และมาตรา 28") {
                            for (let i = index + 1; i < newApprovers.length; i++) {
                              newApprovers[i].section = "มาตรา 26 และมาตรา 28";
                            }
                          } else if (value === "มาตรา 9") {
                            // If changing back to "มาตรา 9", check if no previous approvers have "มาตรา 26 และมาตรา 28"
                            const previousApproversHaveSection26 = newApprovers
                              .slice(0, index)
                              .some(approver => approver.section === "มาตรา 26 และมาตรา 28");
                            
                            // If no previous approvers have "มาตรา 26 และมาตรา 28", 
                            // subsequent approvers can also change to "มาตรา 9"
                            if (!previousApproversHaveSection26) {
                              for (let i = index + 1; i < newApprovers.length; i++) {
                                newApprovers[i].section = "มาตรา 9";
                              }
                            }
                          }
                          
                          setApprovers(newApprovers);
                          
                          // Update form values
                          const updatedFormApprovers = newApprovers?.map((approver) => ({
                            permission: approver.permission ?? "",
                            section: approver.section ?? "มาตรา 9",
                            validateType: approver.validateType ?? "",
                            entityType: approver.entityType ?? "",
                            entities: approver.entities ?? [],
                            validateKey: approver.validateKey ?? "",
                            validateData: approver.validateData ?? "",
                            selfieVideo: approver.selfieVideo ?? false,
                            selfieMessage: approver.selfieMessage ?? "",
                          }));
                          
                          form.setFieldsValue({
                            approvers: updatedFormApprovers,
                          });
                        }}
                        options={getAvailableSectionOptions(index)}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <Form.Item
                      label="Validate Type"
                      name={["approvers", index, "validateType"]}
                      className="w-full !mb-0"
                    >
                      <Select
                        suffixIcon={<ChevronDown size={20} />}
                        onChange={(value) => {
                          const newApprovers = [...approvers];
                          newApprovers[index].validateType = value;
                          setApprovers(newApprovers);
                          // Clear validation error when changing type
                          const errors = { ...validationErrors };
                          delete errors[index];
                          setValidationErrors(errors);
                        }}
                        options={[
                          { value: "", label: "ไม่ได้ตั้งค่า" },
                          { value: "Confirm OTP", label: "Confirm OTP" },
                          { value: "Confirm Password", label: "Confirm Password" },
                        ]}
                      />
                    </Form.Item>
                  </div>
                  {["Confirm OTP", "Confirm Password"].includes(
                    approver.validateType
                  ) && (
                    <div className="flex-1 min-w-[100px]">
                      <Form.Item
                        label={
                          approver.validateType === "Confirm OTP"
                            ? "Phone No."
                            : "Confirm Password"
                        }
                        // name={["approvers", index, "validateData"]}
                        className="w-full !mb-2"
                        validateStatus={validationErrors[index] ? "error" : ""}
                        help={
                          approver.validateType === "Confirm Password" 
                            ? "ประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ"
                            : approver.validateType === "Confirm OTP"
                            ? ""
                            : undefined
                        }
                      >
                        {approver.validateType === "Confirm Password" ? (
                          <Input.Password
                            value={approvers[index].validateData}
                            onChange={(e) => {
                              const newApprovers = [...approvers];
                              newApprovers[index].validateData = e.target.value;
                              setApprovers(newApprovers);
                              // Validate on change
                              validateData(index, e.target.value, approver.validateType);
                            }}
                            onBlur={(e) => {
                              // Validate on blur as well
                              validateData(index, e.target.value, approver.validateType);
                            }}
                            placeholder="กรอกรหัสผ่าน"
                            status={validationErrors[index] ? "error" : ""}
                            visibilityToggle={true}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={approvers[index].validateData}
                            onChange={(e) => {
                              // Only allow numbers for phone input
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              const newApprovers = [...approvers];
                              newApprovers[index].validateData = numericValue;
                              setApprovers(newApprovers);
                              // Validate on change
                              validateData(index, numericValue, approver.validateType);
                            }}
                            onBlur={(e) => {
                              // Validate on blur as well
                              validateData(index, e.target.value, approver.validateType);
                            }}
                            onKeyPress={(e) => {
                              // Prevent non-numeric characters
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="กรอกหมายเลขโทรศัพท์"
                            status={validationErrors[index] ? "error" : ""}
                            maxLength={10}
                          />
                        )}
                        {validationErrors[index] && (
                          <div className="text-red-500 text-sm mt-1">
                            {validationErrors[index]}
                          </div>
                        )}
                      </Form.Item>
                    </div>
                  )}
                  {/* {approver.validateType !== "" && (
                    <div className="flex-1 min-w-[100px]">
                      <Form.Item
                        label={
                          approvers[index].validateType === "Confirm OTP"? "Phone No."
                        : approvers[index].validateType === "Confirm Password"? "Confirm Password": ""
                        }
                        // name={["approvers", index, "validateKey"]}
                        className="w-full"
                      >
                        <Input
                          value={approvers[index].validateKey}
                          onChange={(e) => {
                            const newApprovers = [...approvers];
                            newApprovers[index].validateKey = e.target.value;
                            setApprovers(newApprovers);
                          }}
                        />
                      </Form.Item>
                    </div>
                  )} */}
                </div>

                <div className="w-full mt-4">
                  <div className="flex items-center min-w-[100px]">
                    <Switch
                      checked={approver.selfieVideo}
                      onChange={(checked) =>
                        handleSelfieVideoToggle(checked, index)
                      }
                    />
                    <p className="ml-2">Selfie Video</p>
                  </div>

                  {approver.selfieVideo && (
                    <div className="mt-3">
                      <Form.Item
                        name={["approvers", index, "selfieMessage"]}
                        className="w-full"
                      >
                        <TextArea
                          rows={3}
                          placeholder="เรียนคณะกรรมการทุกท่าน ....."
                          onChange={(e) => {
                            const newApprovers = [...approvers];
                            newApprovers[index].selfieMessage = e.target.value;
                            setApprovers(newApprovers);
                          }}
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </div>

              {/* Access Right component for approvers from index 2 and up */}
              <div className="mt-6">
                <AccessRight
                  accessType={
                    approver.entityType === "department"
                      ? "department"
                      : "private"
                  }
                  users={
                    approver.entityType === "personal"
                      ? approver.entities?.map((entity) => ({
                          id: entity.id || null,
                          name: entity.name,
                          email: entity.email || "",
                          department: entity.department || "",
                        }))
                      : []
                  }
                  departments={
                    approver.entityType === "department"
                      ? approver.entities.reduce(
                          (acc: { [company: string]: string[] }, entity) => {
                            if (entity.id) {
                              const [company, dept] = entity.id.split("-");
                              if (!acc[company]) acc[company] = [];
                              acc[company].push(dept);
                            }
                            return acc;
                          },
                          {}
                        )
                      : "all"
                  }
                  hideRoleDropdown={true}
                                    onAccessTypeChange={(type) => {
                    handleAccessRightChange(index, "accessType", type);
                  }}
                  onUsersChange={(users) => {
                    handleAccessRightChange(index, "users", users);
                  }}
                  onDepartmentsChange={(departments) => {
                    handleAccessRightChange(index, "departments", departments);
                  }}
                  showTypeSelector={true}
                  title="ประเภท"
                  isSettingDocument={true}
                  addUserText="เพิ่มรายชื่อผู้มีสิทธิ์การเข้าถึง"
                />
                
                {/* 🎯 NEW: Show validation error for AccessRight */}
                {validationErrors[index] && 
                 (validationErrors[index].includes("ผู้ใช้") || validationErrors[index].includes("แผนก")) && (
                  <div className="text-red-500 text-sm">
                    {validationErrors[index]}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ),
      style: panelStyle,
      className: "custom-collapse-panel",
    }));
  };

  return (
    <div className="h-full w-full px-8 py-8 pb-12 bg-[#F6F8FA]">
      <style jsx global>{`
        .custom-collapse-panel .ant-collapse-header {
          align-items: center !important;
          background-color: #e6f0ff !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          padding: 12px 16px !important;
        }

        .custom-collapse-panel .ant-collapse-content,
        .custom-collapse-panel .ant-collapse-content-box {
          background-color: #ffffff !important;
          border-color: #e6f0ff !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }
      `}</style>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: formTitle,
          documentId: documentId || "",
          typeCode: typeCode || "1",
          version: "1.0",
          status: "draft",
          approvers: approvers?.map((approver) => ({
            permission: approver.permission ?? "",
            section: approver.section ?? "มาตรา 9",
            validateType: approver.validateType ?? "",
            entityType: approver.entityType ?? "",
            entities: approver.entities ?? [],
            validateKey: approver.validateKey ?? "",
            validateData: approver.validateData ?? "",
            selfieVideo: approver.selfieVideo ?? false,
            selfieMessage: approver.selfieMessage ?? "",
          })),
        }}
        onFinish={async (values) => {
          // Prevent default behavior and redirects
          await handleFormSubmit({
            title: formTitle,
            documentId: documentId || "",
            typeCode: values.typeCode || "1",
            version: "1.0",
            status: "draft",
            approvers: approvers,
          });
          return false; // Prevent form submission to avoid redirects
        }}
      >
        <div className="document-settings rounded-xl bg-white shadow-sm px-6 py-8">
          <div className="document-type mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">กำหนดประเภทเอกสาร</h2>
            </div>
            <div>
            {/* <label className="block mb-2 font-medium">ประเภทเอกสาร</label> */}

              <Form.Item
                label="ประเภทเอกสาร"
                name="typeCode"
                className="w-full"
              >
                <Select
                  suffixIcon={<ChevronDown size={20} />}
                  className="w-full"
                  options={documentTypeOptions}
                  showSearch
                  placeholder="เลือกหรือเพิ่มประเภทเอกสาร"
                  filterOption={(input, option) =>
                    ((option?.label as string) || "").toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    // Use setTimeout to avoid infinite loops
                    setTimeout(() => {
                      if (onDocumentTypeChange) {
                        onDocumentTypeChange(value);
                      }
                      // Trigger form data change as well
                      if (onFormDataChange) {
                        const formData = {
                          typeCode: value,
                          approvers: approvers,
                          formTitle: formTitle,
                          documentId: documentId,
                        };
                        onFormDataChange(formData);
                      }
                    }, 0);
                  }}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      {/* <Divider style={{ margin: "8px 0" }} />
                      <div className="flex items-center gap-2 px-2 pb-2">
                        <Input
                          placeholder="เพิ่มประเภทเอกสารใหม่"
                          value={newDocumentType}
                          onChange={(e) => setNewDocumentType(e.target.value)}
                          onPressEnter={() => {
                            const value = newDocumentType.trim();
                            if (!value) return;
                            if (!documentTypeOptions.some((opt) => opt.value === value)) {
                              setDocumentTypeOptions([...documentTypeOptions, { value, label: value }]);
                            }
                            form.setFieldValue("typeCode", value);
                            setNewDocumentType("");
                          }}
                        />
                        <Button
                          type="text"
                          onClick={() => {
                            const value = newDocumentType.trim();
                            if (!value) return;
                            if (!documentTypeOptions.some((opt) => opt.value === value)) {
                              setDocumentTypeOptions([...documentTypeOptions, { value, label: value }]);
                            }
                            form.setFieldValue("typeCode", value);
                            setNewDocumentType("");
                          }}
                          disabled={!newDocumentType.trim()}
                        >
                          เพิ่ม
                        </Button> 
                      </div>*/}
                    </>
                  )}
                />
              </Form.Item>

            </div>
          </div>
          <div className="document-approvers mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">ผู้อนุมัติเอกสาร</h2>
            </div>

            <Collapse
              bordered={false}
              activeKey={activeKeys}
              expandIcon={({ isActive }) => (
                <ChevronRight
                  className="bg-theme rounded-full p-1"
                  size={28}
                  color="white"
                  style={{
                    transform: `rotate(${isActive ? 90 : 0}deg)`,
                  }}
                />
              )}
              style={{ background: "transparent" }}
              items={getCollapseItems()}
              onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys : [keys])}
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="text"
              icon={<Plus size={16} />}
              onClick={addApprover}
              disabled={approvers.length >= 5}
              className="text-theme"
            >
              เพิ่มผู้อนุมัติ
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SettingDocument;
