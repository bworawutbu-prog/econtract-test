"use client";

import React, { useEffect, useState } from "react";
import { Upload, Input, Button, Tabs, Progress } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadedFile,
  getMessage,
  postCreateMessage,
  deleteMessage,
  deleteMoreFile,
  downloadFile,
} from "@/store/frontendStore/transactionAPI";
import appEmitter from "@/store/libs/eventEmitter";
import { useSearchParams } from "next/navigation";
// 🎯 **Redux Imports สำหรับ mappingMoreFile**
import {
  addFileToStep,
  selectMappingMoreFileData,
  selectIsUploading,
  setIsUploading,
  setError,
  removeFileFromStep,
  setMappingMoreFileData,
} from "@/store/slices/mappingSlice";
import { loginBusiness } from "@/store/frontendStore/biz";
import {
  FileText,
  Building2,
  User,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  Check,
  CircleCheck,
  Loader2,
  AlertCircle,
  X,
  Clock as ClockIcon2,
  Download,
} from "lucide-react";
import type { UploadProps } from "antd";
import router from "next/router";
import { enqueueSnackbar } from "notistack";
import { ModalMoreFile } from "@/components/modal/modalMoreFile";

const { TextArea } = Input;

interface DeleteMoreFilePayload {
  business_id: string;
  file_path: string;
}
// 💬 **Message Types**
interface MessageData {
  message_id: string; // ใช้ message_id แทน _id
  message_data: {
    created_by: string;
    created_at: string;
    message: string;
    message_id: string;
  };
  type: "public" | "private";
  message: string;
  created_at: string;
  created_by: string; // เป็น string แทน object
}

// 📥 **API Response Types**
interface MessageResponse {
  status: boolean;
  message: string;
  data: MessageData[];
}

interface MessagePayload {
  transaction_id: string;
  message_data: {
    type: "public" | "private";
    message: string;
  };
}

// Type for new approver format
interface ApproverInfo {
  name: string;
  email: string;
  position: string;
}

interface ApproverItem {
  level: number;
  status: "pending" | "approved" | "rejected" | "W" | "Y" | "R" | "N";
  approver: ApproverInfo;
  approved_at?: string;
}

// Type for legacy approver format
interface LegacyApprover {
  name: string;
  email?: string;
  position: string;
  status?: "pending" | "approved" | "rejected" | "W" | "Y" | "R" | "N";
  approved_at?: string;
}

interface LegacyApprovers {
  level1: LegacyApprover[];
  level2: LegacyApprover[];
  level3: LegacyApprover[];
}

// Union type to support both formats
type ApproversData = ApproverItem[] | LegacyApprovers;

interface FileTypeData {
  type_index: number;
  type_name: string;
  type: string[];
  is_required: boolean;
  file_data: any[];
  is_embedded: boolean;
  file_size: number;
}

interface AttachFileData {
  step_index: number;
  type_data: FileTypeData[];
}

interface FileUploadState {
  [key: string]: {
    isUploading: boolean;
    progress: number;
    status: "uploading" | "success" | "error" | "idle";
    error?: string;
  };
}
interface DocumentDetailsProps {
  company: string;
  documentName: string;
  documentId: string;
  transactionId: string;
  sender: string;
  sentDate: string;
  sentTime: string;
  mappingFormDataId: string;
  business_id: string;
  obj_box: object;
  approvers: ApproversData;
  formDataFlow?: any[]; // 🎯 NEW: Form data flow from flow_data
  currentUserStepIndex?: string; // 🎯 NEW: Current user's step index for validation
  onAddApprover?: (level: number) => void;
  onUploadFile?: (file: File) => void;
  onAddNote?: (note: string) => void;
  onUploadFormData?: (formData: FormData) => void;
  attachFileStatus: boolean;
  attachFileData: AttachFileData[];
  statusFormDataFlow: string;
}
interface FileDataPath {
  file_index: number;
  file_name: string;
  file_path: string;
}
interface FileTypeDataPayload {
  type_index: number;
  file_data: FileDataPath[];
}
interface MappingMoreFilePayload {
  step_index: number;
  type_data: FileTypeDataPayload[];
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  company,
  documentName,
  documentId,
  transactionId,
  sender,
  sentDate,
  sentTime,
  mappingFormDataId,
  business_id,
  obj_box,
  approvers,
  formDataFlow, // 🎯 NEW: Form data flow from flow_data
  currentUserStepIndex, // 🎯 NEW: Current user's step index for validation
  // onAddApprover,
  onUploadFile,
  onAddNote,
  onUploadFormData,
  attachFileStatus,
  attachFileData,
  statusFormDataFlow,
}) => {
  const dispatch = useDispatch();
  // 🎯 **Redux State - แทนที่ local state ด้วย Redux**
  const mappingMoreFileData = useSelector(selectMappingMoreFileData);
  const isUploadingRedux = useSelector(selectIsUploading);

  // 👤 **User Information จาก Auth State**
  const user = useSelector((state: any) => state.auth?.user);
  const currentUserName =
    user?.name || sessionStorage.getItem("guestName") || "ผู้ใช้";
  const currentUserEmail =
    user?.email || sessionStorage.getItem("guestEmail") || "user@example.com";

  // 🏢 **Business Name State**
  const [businessName, setBusinessName] = useState<string>("");
  const [isLoadingBusinessName, setIsLoadingBusinessName] =
    useState<boolean>(false);

  // 📋 **Local State ที่เหลือ**
  const [activeTabKey, setActiveTabKey] = useState<string>(
    attachFileStatus ? "1" : "2"
  );
  const [uploadStates, setUploadStates] = useState<FileUploadState>({});
  const [localAttachFileData, setLocalAttachFileData] =
    useState<AttachFileData[]>(attachFileData);
  const [isUploading, setIsUploading] = useState(false);

  // 💬 **Message State**
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"public" | "private">(
    "public"
  );
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [moreFileUrl, setMoreFileUrl] = useState<string | null>(null);
  const [isOpenMoreFileUrl, setIsOpenMoreFileUrl] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [mainType, setMainType] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [nameFile, setNameFile] = useState<string | null>(null);

  // ❌ **ลบ local state mappingMoreFilePayload - ใช้ Redux แทน**
  // const [mappingMoreFilePayload, setMappingMoreFilePayload] = useState<MappingMoreFilePayload[]>([]);

  // 🏢 **Function to get business name from business_id**
  const getBusinessName = (businessId: string): string => {
    if (!user?.role || !Array.isArray(user.role)) {
      return company || "ไม่ระบุ";
    }

    const businessRole = user.role.find(
      (role: any) => role.business_id === businessId
    );
    return (
      businessRole?.business_name_th ||
      businessRole?.business_name_eng ||
      company ||
      "ไม่ระบุ"
    );
  };

  // 🏢 **Function to call loginBusiness API (for future use)**
  const callLoginBusiness = async (businessId: string) => {
    setIsLoadingBusinessName(true);
    try {
      const result = await dispatch(loginBusiness(businessId) as any);
      return result;
    } catch (error) {
      enqueueSnackbar(`🏢 [DocumentDetails] loginBusiness error: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return null;
    } finally {
      setIsLoadingBusinessName(false);
    }
  };

  // 🏢 **Effect to set business name when business_id changes**
  useEffect(() => {
    if (business_id) {
      const name = getBusinessName(business_id);
      setBusinessName(name);
      callLoginBusiness(business_id);
    } else {
      enqueueSnackbar(
        `🏢 [DocumentDetails] No business_id provided, using company: ${company}`,
        {
          variant: "info",
          autoHideDuration: 3000,
        }
      );
      setBusinessName(company || "ไม่ระบุ");
    }
  }, [business_id, user?.role, company]);

  // 🔄 **ตัวอย่างการใช้ Redux Actions**
  const handleAddFileToRedux = (
    stepIndex: number,
    typeIndex: number,
    fileData: any
  ) => {
    dispatch(
      addFileToStep({
        stepIndex,
        typeIndex,
        fileData: {
          file_index: Date.now(), // ใช้ timestamp เป็น unique id
          file_name: fileData.file_name,
          file_path: fileData.file_path,
        },
      })
    );
  };

  const loadMessages = async (type: "public" | "private" = "public") => {
    if (!transactionId) return;

    setIsLoadingMessages(true);
    try {
      // API call: /message/{transaction_id}/{type}
      const result = await dispatch(
        getMessage(`${transactionId}/${type}`) as any
      );
    //  console.log('ddd', result)
      // 🔧 **Safe response structure checking**
      if (result?.payload) {
        // กรณี response เป็น object ที่มี status และ data (MessageResponse structure)
        if (
          result.payload.status !== undefined &&
          Array.isArray(result.payload.message_data)
        ) {
          setMessages(result.payload.message_data);
        }
        // กรณี response เป็น array โดยตรง
        else if (Array.isArray(result.payload)) {
          setMessages(result.payload);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
      enqueueSnackbar(`🏢 [DocumentDetails] loadMessages error: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 📤 **Send New Message**
  const sendMessage = async () => {
    if (!newMessage.trim() || !transactionId || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const payload: MessagePayload = {
        transaction_id: transactionId,
        message_data: {
          type: messageType,
          message: newMessage.trim(),
        },
      };

      const result = await dispatch(postCreateMessage(payload) as any);

      if (result.payload) {
        // เพิ่ม message ใหม่ใน state
        const newMessageData: MessageData = {
          message_id: result.payload.message_id || `temp_${Date.now()}`, // ใช้ message_id จาก response หรือสร้าง temp id
          type: messageType,
          message_data: {
            message: newMessage.trim(),
            created_by: currentUserName,
            created_at: new Date().toISOString(),
            message_id: result.payload.message_id || `temp_${Date.now()}`,
          },
          created_at: new Date().toISOString(),
          created_by: currentUserName,
          message: newMessage.trim(),
        };

        setMessages((prev) => [...prev, newMessageData]);
        setNewMessage(""); // ล้าง input

        // โหลดข้อความใหม่เพื่อให้แน่ใจว่าข้อมูลตรงกับ server
        setTimeout(() => {
          loadMessages(messageType);
        }, 500);
      }
    } catch (error) {
      enqueueSnackbar(`🏢 [DocumentDetails] sendMessage error: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 🗑️ **Delete Message**
  const handleDeleteMessage = async (messageId: string) => {
    if (!transactionId) return;

    try {
      // API call: /message/{transaction_id}/{message_id}
      await dispatch(deleteMessage(`${transactionId}/${messageId}`) as any);

      // ลบ message จาก state
      setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));
    } catch (error) {
      enqueueSnackbar(
        `🏢 [DocumentDetails] handleDeleteMessage error: ${error}`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      loadMessages(messageType);
    }
  };

  // 🔄 **Refresh Messages**
  const refreshMessages = () => {
    if (documentId) {
      loadMessages(messageType);
    }
  };

  // 🧹 **Clear All Messages (Local Only)**
  const clearAllMessages = () => {
    setMessages([]);
  };

  // ⌨️ **Handle Enter Key Press**
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔄 **Load messages เมื่อ component mount หรือ filter เปลี่ยน**
  useEffect(() => {
    if (documentId) {
      // เปลี่ยนจากการใช้ commentFilter เป็นการ load ทั้ง public และ private
      loadMessages("public"); // โหลด public messages เป็นค่าเริ่มต้น
    }
  }, [documentId]);

  // 🔄 **Load messages เมื่อ messageType เปลี่ยน**
  useEffect(() => {
    if (documentId && activeTabKey === "2") {
      loadMessages(messageType);
    }
  }, [messageType, activeTabKey]);
  //  useEffect(() => {
  //   appEmitter.on("approveClicked", handleCustomEvent);
  //   return () => {
  //     appEmitter.off("approveClicked", handleCustomEvent);
  //   };
  //  }, []);
  const handleCustomEvent = () => {
    // Send mappingMoreFileData back to PDFTemplate for approve process
    appEmitter.emit("mappingMoreFileForApprove", mappingMoreFileData);
  };
  useEffect(() => {
    // 🎯 Emit mappingMoreFileForApprove event เมื่อ mappingMoreFileData เปลี่ยน
    if (mappingMoreFileData && mappingMoreFileData.length > 0) {
      appEmitter.emit("mappingMoreFileForApprove", mappingMoreFileData);
    }
  }, [mappingMoreFileData]);
  // Handle file upload with both File object and FormData
  const handleFileUpload = async (
    file: File,
    step_index: number = 0,
    fileType?: any,
    indexStep: number = 0,
    type_index: number = 0
  ) => {
    const uploadKey = `${file.name}-${Date.now()}`;

    // Set uploading state for button
    setIsUploading(true);

    // Initialize upload state
    setUploadStates((prev) => ({
      ...prev,
      [uploadKey]: {
        isUploading: true,
        progress: 0,
        status: "uploading",
      },
    }));

    try {
      // Create FormData and call uploadedFile API
      const formData = new FormData();
      formData.append("files", file);
      formData.append("step_index", step_index.toString());
      formData.append("type_index", type_index.toString());
      // formData.append('file_name', file.name);
      // formData.append('business_id', business_id);
      formData.append("form_data_id", mappingFormDataId);
      // Call API with businessId
      const result = await dispatch(uploadedFile({ 
        formData, 
        businessId: business_id 
      }) as any);
      const mappingMoreFiles = await result.payload.map((item: any) => {
        return {
          step_index: item.step_index,
          type_data: item.type_data.map((type: any) => {
            return {
              type_index: type.type_index,
              file_data: type.file_data.map((file: any, index: number) => {
                return {
                  file_index: index,
                  file_name: file.file_name,
                  file_path: file.file_path,
                };
              }),
            };
          }),
        };
      });
      if (result.payload.length > 0) {
        // mappingMoreFiles.forEach((item: any) => {
        //   dispatch(removeFileFromStep({
        //     stepIndex: item.step_index,
        //     typeIndex: item.type_data[0].type_index,
        //     fileIndex: item.type_data[0].file_data[0].file_index
        //   }));
        // });
        mappingMoreFiles.forEach((newItem: any) => {
          // หา existing item ที่มี step_index ตรงกัน
          const existingItemIndex = mappingMoreFileData.findIndex(
            (existingItem: any) =>
              existingItem.step_index === newItem.step_index
          );

          if (existingItemIndex !== -1) {
            // มี step_index ตรงกัน ตรวจสอบ type_index
            const existingItem = mappingMoreFileData[existingItemIndex];
            const existingTypeIndex = existingItem.type_data?.findIndex(
              (type: any) =>
                type.type_index === newItem.type_data?.[0]?.type_index
            );

            if (existingTypeIndex !== -1) {
              // มี type_index ตรงกัน เพิ่ม file_data ใหม่
              const updatedMappingData = mappingMoreFileData.map(
                (item: any, index: number) => {
                  if (index === existingItemIndex) {
                    return {
                      ...item,
                      type_data: item.type_data.map(
                        (typeItem: any, typeIndex: number) => {
                          if (typeIndex === existingTypeIndex) {
                            // คำนวณ file_index ใหม่เริ่มจากหมายเลขถัดไป
                            const currentMaxFileIndex = Math.max(
                              ...(typeItem.file_data || []).map(
                                (file: any) => file.file_index || 0
                              ),
                              -1
                            );

                            // เพิ่ม file_data ใหม่พร้อม file_index ที่รันต่อเนื่อง
                            const newFileData = (
                              newItem.type_data?.[0]?.file_data || []
                            ).map((file: any, fileIdx: number) => ({
                              ...file,
                              file_index: currentMaxFileIndex + 1 + fileIdx,
                            }));

                            return {
                              ...typeItem,
                              file_data: [
                                ...(typeItem.file_data || []),
                                ...newFileData,
                              ],
                            };
                          }
                          return typeItem;
                        }
                      ),
                    };
                  }
                  return item;
                }
              );
              dispatch(setMappingMoreFileData(updatedMappingData));
            } else {
              // มี step_index แต่ไม่มี type_index ตรงกัน เพิ่ม type_data ใหม่
              const updatedMappingData = mappingMoreFileData.map(
                (item: any, index: number) => {
                  if (index === existingItemIndex) {
                    // เพิ่ม type_data ใหม่พร้อม file_index ที่เริ่มจาก 0
                    const newTypeData = (newItem.type_data || []).map(
                      (typeItem: any) => ({
                        ...typeItem,
                        file_data: (typeItem.file_data || []).map(
                          (file: any, fileIdx: number) => ({
                            ...file,
                            file_index: fileIdx,
                          })
                        ),
                      })
                    );

                    return {
                      ...item,
                      type_data: [...(item.type_data || []), ...newTypeData],
                    };
                  }
                  return item;
                }
              );
              dispatch(setMappingMoreFileData(updatedMappingData));
            }
          } else {
            // ไม่มี step_index ตรงกัน เพิ่ม item ใหม่ทั้งหมดพร้อม file_index ที่ถูกต้อง
            const processedNewItem = {
              ...newItem,
              type_data: (newItem.type_data || []).map((typeItem: any) => ({
                ...typeItem,
                file_data: (typeItem.file_data || []).map(
                  (file: any, fileIdx: number) => ({
                    ...file,
                    file_index: fileIdx,
                  })
                ),
              })),
            };

            dispatch(
              setMappingMoreFileData([...mappingMoreFileData, processedNewItem])
            );
          }
        });
      }
      // Set success status
      setUploadStates((prev) => ({
        ...prev,
        [uploadKey]: {
          ...prev[uploadKey],
          progress: 100,
          status: "success",
          isUploading: false,
        },
      }));

      // Add file to attachFileData on success
      setLocalAttachFileData((prevData) => {
        const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone
        if (newData[indexStep] && newData[indexStep].type_data[type_index]) {
          newData[indexStep].type_data[type_index].file_data.push({
            ...file,
            uploadKey,
            file: {
              size: file.size,
              date: file.lastModified,
            },
          });
        }
        return newData;
      });

      // Call original callbacks if provided
      onUploadFormData?.(formData);
      onUploadFile?.(file);
    } catch (error: any) {
      enqueueSnackbar(`🏢 [DocumentDetails] handleFileUpload error: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });

      // Set error status
      setUploadStates((prev) => ({
        ...prev,
        [uploadKey]: {
          ...prev[uploadKey],
          progress: 0,
          status: "error",
          isUploading: false,
          error: "การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง",
        },
      }));
    } finally {
      // Reset uploading state for button
      setIsUploading(false);
    }
  };
  const handleDeleteFile = async (uploadKey: DeleteMoreFilePayload) => {
    const payload = {
      uploadKey: uploadKey,
    };
    await dispatch(deleteMoreFile(payload) as any);
  };

  // Handle file retry
  const handleRetryUpload = (file: File, uploadKey: string) => {
    // Reset upload state and retry
    setUploadStates((prev) => ({
      ...prev,
      [uploadKey]: {
        isUploading: true,
        progress: 0,
        status: "uploading",
      },
    }));

    // Retry the upload
    handleFileUpload(file);
  };

  // Handle file remove
  const handleRemoveFile = (uploadKey: string) => {
    // Remove from upload states
    setUploadStates((prev) => {
      const newStates = { ...prev };
      delete newStates[uploadKey];
      return newStates;
    });

    // Remove from localAttachFileData
    setLocalAttachFileData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));

      // Find and remove the file with matching uploadKey
      newData.forEach((stepData: any) => {
        stepData.type_data.forEach((typeData: any) => {
          typeData.file_data = typeData.file_data.filter(
            (file: any) => file.uploadKey !== uploadKey
          );
        });
      });

      return newData;
    });
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      handleFileUpload(file);
      return false; // ป้องกันการอัพโหลดอัตโนมัติ
    },
  };

  const renderFormattedDate = (dateValue: any = "") => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      // It's a valid Date object
      try {
        return dateValue.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        });
      } catch (error) {
        enqueueSnackbar(
          `🏢 [DocumentDetails] handleRetryUpload error: ${error}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        return "รูปแบบวันที่ผิดพลาด"; // Error in formatting
      }
    } else if (typeof dateValue === "string") {
      // If it's still a string, try to parse it (as a fallback)
      try {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("th-TH");
        } else {
          return "-"; // Invalid date string
        }
      } catch (error) {
        enqueueSnackbar(
          `🏢 [DocumentDetails] handleRetryUpload error: ${error}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        return "ข้อผิดพลาดในการแปลงวันที่";
      }
    }
    return "ไม่มีข้อมูลวันที่"; // Fallback for null, undefined, or other invalid types
  };
  const getStatusText = (status?: string): string => {
    if (!status || status === "W") return "รอดำเนินการ";
    if (status === "Y") return "เสร็จสิ้น";
    if (status === "R" || status === "rejected") return "ปฏิเสธ";
    if (status === "N") return "ยังไม่เริ่ม";
    return "รอการอนุมัติ";
  };

  const getStatusIcon = (status?: string) => {
    if (status === "Y")
      return <CircleCheck size={16} className="text-green-500" />;
    if (status === "R" || status === "rejected")
      return <X size={16} className="text-red-500" />;
    if (status === "N")
      return <ClockIcon2 size={16} className="text-gray-300" />;
    // W or other pending statuses
    return <ClockIcon2 size={16} className="text-orange-400" />;
  };

  // Time utility functions - สามารถย้ายไปใน utils file ได้
  /**
   * แสดงเวลาที่ผ่านมาในรูปแบบ "X ชั่วโมงที่แล้ว", "X นาทีที่แล้ว" เป็นต้น
   * @param date - วันที่ที่ต้องการเปรียบเทียบ
   * @returns string - เวลาที่ผ่านมาในภาษาไทย
   */
  const timeSince = (date: any) => {
    if (!date) return "";

    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 30) {
      return "เมื่อสักครู่";
    }

    const intervals = [
      { value: 31536000, label: "ปี" },
      { value: 2592000, label: "เดือน" },
      { value: 86400, label: "วัน" },
      { value: 3600, label: "ชั่วโมง" },
      { value: 60, label: "นาที" },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.value);
      if (count >= 1) {
        return `${count} ${interval.label}ที่แล้ว`;
      }
    }

    return "เมื่อสักครู่";
  };

  /**
   * ตรวจสอบว่าวันที่ที่ให้มาเป็นวันนี้หรือไม่
   */
  const isToday = (date: any) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };

  /**
   * ตรวจสอบว่าวันที่ที่ให้มาเป็นเมื่อวานหรือไม่
   */
  const isYesterday = (date: any) => {
    if (!date) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = new Date(date);
    return checkDate.toDateString() === yesterday.toDateString();
  };

  /**
   * จัดรูปแบบวันที่สำหรับแสดงใน message header
   * @param date - วันที่ที่ต้องการจัดรูปแบบ
   * @returns "วันนี้" | "เมื่อวาน" | "วันที่ในภาษาไทย"
   */
  const formatMessageDate = (date: any) => {
    if (!date) return "";

    if (isToday(date)) {
      return "วันนี้";
    } else if (isYesterday(date)) {
      return "เมื่อวาน";
    } else {
      return new Date(date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getFileIcon = (fileType: string[], fileName?: string) => {
    if (fileType.includes("microsoft_pdf") || fileName?.endsWith(".pdf")) {
      return { bg: "bg-red-500", text: "PDF" };
    } else if (
      fileType.includes("image_file") ||
      fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
    ) {
      return { bg: "bg-blue-500", text: "IMG" };
    } else {
      return { bg: "bg-gray-500", text: "FILE" };
    }
  };

  // 🔧 ฟังก์ชันสำหรับจัดการชื่อไฟล์ให้สั้นและอ่านง่าย
  const getDisplayFileName = (file: any, fileType: any) => {
    try {
      // หาชื่อไฟล์จากหลายแหล่ง
      const fileName =
        file?.uploadKey?.split("-")[0] ||
        file?.file_name ||
        `${fileType.type_name}.pdf`;

      // ถ้าชื่อไฟล์ยาวเกินไป ให้ตัดและแสดงส่วนท้าย
      if (fileName.length > 30) {
        const extension = fileName.substring(fileName.lastIndexOf("."));
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

        // แสดง 20 ตัวแรก + ... + ส่วนท้ายที่มีนามสกุล
        return nameWithoutExt.substring(0, 20) + "..." + extension;
      }

      return fileName;
    } catch (error) {
      enqueueSnackbar(
        `🏢 [DocumentDetails] handleRetryUpload error: ${error}`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      return "Unknown file";
    }
  };
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);

    // 💬 โหลด messages เมื่อเปลี่ยนไป message tab
    if (key === "2" && documentId) {
      loadMessages(messageType);
    }
  };

  // Ensure activeTabKey is valid when attachFileStatus changes
  React.useEffect(() => {
    if (!attachFileStatus && activeTabKey === "1" && statusFormDataFlow != "Y") {
      setActiveTabKey("2");
    }
  }, [attachFileStatus, activeTabKey]);

  // Get approvers as array safely
  const getApproversArray = (): ApproverItem[] => {
    // Check if approvers exists and is an array
    if (Array.isArray(approvers)) {
      return approvers;
    }

    // Handle legacy format (object with level1, level2, level3)
    if (
      approvers &&
      typeof approvers === "object" &&
      !Array.isArray(approvers)
    ) {
      const legacyApprovers = approvers as LegacyApprovers;

      // Convert legacy format to new format
      const result: ApproverItem[] = [];

      // Convert each level to the new format
      if (legacyApprovers.level1) {
        legacyApprovers.level1.forEach((approver) => {
          result.push({
            level: 1,
            status: approver.status || "pending",
            approver: {
              name: approver.name,
              email: approver.email || "",
              position: approver.position,
            },
            approved_at: approver.approved_at,
          });
        });
      }

      if (legacyApprovers.level2) {
        legacyApprovers.level2.forEach((approver) => {
          result.push({
            level: 2,
            status: approver.status || "pending",
            approver: {
              name: approver.name,
              email: approver.email || "",
              position: approver.position,
            },
            approved_at: approver.approved_at,
          });
        });
      }

      if (legacyApprovers.level3) {
        legacyApprovers.level3.forEach((approver) => {
          result.push({
            level: 3,
            status: approver.status || "pending",
            approver: {
              name: approver.name,
              email: approver.email || "",
              position: approver.position,
            },
            approved_at: approver.approved_at,
          });
        });
      }

      return result;
    }

    // Return empty array as fallback
    return [];
  };

  // Get approvers array
  const approversArray = getApproversArray();

  // Group approvers by level
  const getApproversByLevel = (level: number) => {
    return approversArray.filter((approver) => approver.level === level);
  };

  // Get unique levels
  const uniqueLevels = [
    ...new Set(approversArray.map((approver) => approver.level)),
  ].sort((a, b) => a - b);

  const handleDownloadFile = async (file: any) => {
    const response = await dispatch(downloadFile(file.file_path) as any);
    if (response.meta.requestStatus === "fulfilled" && response.payload.moreFileUrl) {
          // response is a blob    
          setMoreFileUrl(response.payload.moreFileUrl);
          setMimeType(response.payload.mimeType);
          setMainType(response.payload.mainType);
          setType(response.payload.type);
          setNameFile(file.file_name);
          if (response.payload.mainType === 'office') {
            setPdfUrl(response.payload.pdfUrl);
          }
          setIsOpenMoreFileUrl(true);
    }
  }

  return (
    <div className="min-w-fit w-full bg-white shadow-theme h-full min-h-screen py-6 px-4 overflow-y-auto space-y-4">
      {/* รายละเอียดเอกสาร */}
      <div className="rounded-lg">
        <h2 className="text-lg font-semibold px-4 py-2 rounded-t-lg bg-[#F0F6FF] text-theme">
          รายละเอียดเอกสาร
        </h2>
        <div className="space-y-4 py-4 px-3 border border-[#F5F5F5] rounded-b-lg">
          <div className="flex items-center gap-1">
            <Building2 size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">บริษัท : </p>
              <div className="flex items-center gap-2">
                {isLoadingBusinessName ? (
                  <div className="flex items-center gap-1">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">กำลังโหลด...</span>
                  </div>
                ) : (
                  <p className="font-medium">{businessName || company}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">ชื่อเอกสาร : </p>
              <p className="font-medium">
                {documentName.length > 20 ? documentName.substring(0, 16) +
                  "..." +
                  documentName.substring(documentName.indexOf(".pdf") - 4)
                : documentName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">เลขที่เอกสาร : </p>
              <p className="font-medium">{documentId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <User size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">สร้างโดย : </p>
              <p className="font-medium">{sender}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">ส่งเมื่อ : </p>
              <p className="font-medium">{sentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={18} className="text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-gray-500">เวลา : </p>
              <p className="font-medium">{sentTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ติดตามเอกสาร */}
      <div className="rounded-lg">
        <h2 className="text-lg font-semibold px-4 py-2 rounded-t-lg bg-[#F0F6FF] text-theme">
          ติดตามเอกสาร
        </h2>
        <div className="py-1 border border-[#F5F5F5] rounded-b-lg pb-4">
          {uniqueLevels.map((level) => {
            // Get the first approver for this level to determine the level's status
            const levelApprovers = getApproversByLevel(level);
            const levelStatus =
              levelApprovers.length > 0 ? levelApprovers[0].status : "W";

            return (
              <div key={`level-${level}`}>
                <h3 className="font-medium text-sm px-3 py-2 rounded-md flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(levelStatus)}
                    <p>ลำดับที่ {level + 1}</p>
                  </div>
                  <div
                    className={`${
                      levelStatus === "Y"
                        ? "bg-[#EAF8EF] text-[#00C45A] px-2 py-1"
                        : levelStatus === "W"
                        ? "bg-[#FFF4EB] text-[#FC9240] px-2 py-1"
                        : levelStatus === "R"
                        ? "bg-[#FFEBEE] text-[#F44336] px-2 py-1"
                        : levelStatus === "N"
                        ? "bg-[#F5F5F5] text-[#9CA3AF] px-2 py-1"
                        : "bg-gray-500 text-white px-2 py-1"
                    } rounded-full`}
                  >
                    {getStatusText(levelStatus)}
                  </div>
                </h3>
                {getApproversByLevel(level).map((approverItem, index) => (
                  <div
                    key={`approver-${approverItem.level}-${index}`}
                    className="flex items-start gap-3 min-h-fit"
                  >
                    <div className="flex flex-col items-center h-full pl-[1.13rem] min-w-4">
                      <div className="w-0.5 h-8 bg-gray-200"></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pr-3 flex-1">
                      <div className="flex items-center gap-2 flex-1 pb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            approverItem.status === "Y"
                              ? "bg-green-500"
                              : approverItem.status === "R"
                              ? "bg-red-500"
                              : approverItem.status === "N"
                              ? "bg-gray-500"
                              : "bg-theme"
                          }`}
                        >
                          {approverItem.approver.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {approverItem.approver.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {approverItem.approver.email}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        {approverItem.approved_at
                          ? timeSince(approverItem.approved_at)
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {approversArray.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              ไม่มีข้อมูลผู้อนุมัติ
            </p>
          )}
        </div>
      </div>

      {/* ข้อมูลเพิ่มเติม */}
      <div className="rounded-lg">
        <h2 className="text-lg font-semibold px-4 py-2 rounded-t-lg bg-[#F0F6FF] text-theme">
          ข้อมูลเพิ่มเติม
        </h2>
        <div className="py-4 px-3 border border-[#F5F5F5] rounded-b-lg">
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            items={[
              ...(attachFileStatus || statusFormDataFlow == "Y"
                ? [
                    {
                      key: "1",
                      label: (
                        <span className="flex items-center gap-2">
                          <Paperclip size={16} className="text-gray-400" />
                          <span>แนบไฟล์</span>
                        </span>
                      ),
                      children: (
                        <div className="space-y-6 ">
                          {/* Display all file types */}
                          {localAttachFileData &&
                            localAttachFileData.length > 0 &&
                            localAttachFileData.map((stepData, indexStep) =>
                              stepData.type_data.map((fileType, typeIndex) => (
                                <div
                                  key={`${indexStep}-${typeIndex}`}
                                  className="border-dashed border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                      {fileType.type_name} {statusFormDataFlow === "Y" && `(ลำดับที่ ${Number(stepData.step_index) + 1})`}
                                      {fileType.is_required && (
                                        <span className="text-red-500">*</span>
                                      )}
                                    </h4>
                                    {statusFormDataFlow === "W" && (
                                      <button
                                        className="text-[#3B82F6] hover:text-[#2563EB] underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={
                                          isUploading ||
                                          Object.values(uploadStates).some(
                                            (state) => state.isUploading
                                          ) ||
                                          // 🎯 NEW: Validate step_index with currentUserStepIndex
                                          !!(currentUserStepIndex && stepData.step_index.toString() !== currentUserStepIndex)
                                        }
                                        onMouseEnter={() => {
                                          // 🎯 DEBUG: Log validation info
                                          // console.log("🔍 [DocumentDetails] Upload button validation:", {
                                          //   stepDataStepIndex: stepData.step_index,
                                          //   currentUserStepIndex,
                                          //   isDisabled: currentUserStepIndex && stepData.step_index.toString() !== currentUserStepIndex,
                                          //   statusFormDataFlow
                                          // });
                                        }}
                                        title={
                                          // 🎯 NEW: Show tooltip when disabled due to step validation
                                          currentUserStepIndex && stepData.step_index.toString() !== currentUserStepIndex
                                            ? `คุณสามารถอัปโหลดไฟล์ได้เฉพาะในขั้นตอนที่ ${parseInt(currentUserStepIndex) + 1} เท่านั้น`
                                            : undefined
                                        }
                                        onClick={() => {
                                          const input =
                                            document.createElement("input");
                                          input.type = "file";
                                          input.accept = fileType.type.includes(
                                            "microsoft_pdf"
                                          )
                                            ? ".pdf"
                                            : fileType.type.includes(
                                                "image_file"
                                              )
                                            ? "image/*"
                                            : fileType.type.includes(
                                                "microsoft_office"
                                              )
                                            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                            : fileType.type.includes(
                                                "audio_file"
                                              )
                                            ? "audio/*"
                                            : fileType.type.includes(
                                                "video_file"
                                              )
                                            ? "video/*"
                                            : //  fileType.type.includes('other') ? 'application/pdf' :
                                            fileType.type.includes(
                                                "document_text_code"
                                              )
                                            ? "text/plain"
                                            : fileType.type.includes(
                                                "compressed_file"
                                              )
                                            ? "application/zip, application/x-7z-compressed, application/x-rar-compressed, application/x-tar, application/x-gzip, application/x-bzip2, application/x-lzma, application/x-xz, application/x-zstd"
                                            : "*";
                                          input.onchange = (e) => {
                                            const file = (
                                              e.target as HTMLInputElement
                                            ).files?.[0];
                                            if (file) {
                                              handleFileUpload(
                                                file,
                                                stepData.step_index,
                                                fileType,
                                                indexStep,
                                                typeIndex
                                              );
                                            }
                                          };
                                          input.click();
                                        }}
                                      >
                                        {isUploading ? (
                                          <>
                                            <Loader2
                                              size={14}
                                              className="animate-spin"
                                            />
                                            <span>กำลังอัปโหลด...</span>
                                          </>
                                        ) : (
                                          "อัปโหลด"
                                        )}
                                      </button>
                                    )}
                                    {/* {statusFormDataFlow === "Y" && (
                                      <button
                                        className="text-[#3B82F6] hover:text-[#2563EB] underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        onClick={() => {
                                          handleDownloadFile(fileType.file_data);
                                        }}
                                      >
                                        ดาวน์โหลด
                                      </button>
                                    )} */}
                                  </div>

                                  {/* File list */}
                                  <div className="space-y-0">
                                    {/* Display uploaded files */}
                                    {fileType.file_data.length > 0 &&
                                      fileType.file_data.map((file, index) => {
                                        const uploadKey = file.uploadKey;
                                        const uploadState =
                                          uploadStates[uploadKey];
                                        return (
                                          <div
                                            key={index}
                                            className="py-4 border-b border-gray-200 last:border-b-0"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                {(() => {
                                                  const icon = getFileIcon(
                                                    fileType.type,
                                                    file.name
                                                  );
                                                  return (
                                                    <div
                                                      className={`w-8 h-8 ${icon.bg} rounded flex items-center justify-center relative`}
                                                    >
                                                      {uploadState?.isUploading ? (
                                                        <Loader2
                                                          size={16}
                                                          className="text-white animate-spin"
                                                        />
                                                      ) : uploadState?.status ===
                                                        "error" ? (
                                                        <AlertCircle
                                                          size={16}
                                                          className="text-white"
                                                        />
                                                      ) : (
                                                        <span className="text-white text-xs font-bold">
                                                          {icon.text}
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                })()}
                                                <div className="flex-1">
                                                  <p
                                                    className="text-sm font-medium text-gray-900 mb-1"
                                                    style={{
                                                      display: "inline-block",
                                                      width: "100px",
                                                      whiteSpace: "nowrap",
                                                      overflow:
                                                        "hidden !important",
                                                      textOverflow: "ellipsis",
                                                    }}
                                                  >
                                                    {getDisplayFileName(
                                                      file,
                                                      fileType
                                                    )}
                                                  </p>
                                                  <div className="flex items-center gap-2">
                                                    {/* <p className="text-xs text-gray-500">
                                                      {file?.file?.size
                                                        ? `${(
                                                            file.file.size /
                                                            (1024 * 1024)
                                                          ).toFixed(1)} MB`
                                                        : ""}{" "}
                                                      {file?.file?.date
                                                        ? timeSince(new Date())
                                                        : file?.file_size}
                                                    </p> */}
                                                    {uploadState?.status ===
                                                      "success" && (
                                                      <Check
                                                        size={12}
                                                        className="text-green-500"
                                                      />
                                                    )}
                                                    {uploadState?.status ===
                                                      "error" && (
                                                      <button
                                                        onClick={() =>
                                                          handleRetryUpload(
                                                            file,
                                                            uploadKey
                                                          )
                                                        }
                                                        className="text-xs text-blue-500 hover:underline"
                                                      >
                                                        ลองใหม่
                                                      </button>
                                                    )}
                                                  </div>
                                                  {uploadState?.status ===
                                                    "error" &&
                                                    uploadState.error && (
                                                      <p className="text-xs text-red-500 mt-1">
                                                        {uploadState.error}
                                                      </p>
                                                    )}
                                                </div>
                                              </div>
                                              {statusFormDataFlow === "Y" && (
                                                <button
                                                  className="text-[#3B82F6] hover:text-[#2563EB] underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                  onClick={() => {
                                                    handleDownloadFile(file);
                                                  }}
                                                >
                                                  <Download size={16} className="text-gray-500" />
                                                </button>
                                              )}
                                              {statusFormDataFlow === "W" && (
                                                <button
                                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
                                                  disabled={
                                                    uploadState?.isUploading
                                                  }
                                                  onClick={() => {
                                                    if (
                                                      file.file_path !==
                                                        undefined &&
                                                      file.file_path !== ""
                                                    ) {
                                                      const dataTemp = {
                                                        business_id:
                                                          business_id,
                                                        file_path:
                                                          file.file_path,
                                                      };
                                                      handleDeleteFile(
                                                        dataTemp
                                                      );
                                                    }
                                                    handleRemoveFile(uploadKey);
                                                  }}
                                                >
                                                  <X
                                                    size={16}
                                                    className="text-gray-500"
                                                  />
                                                </button>
                                              )}
                                            </div>

                                            {/* Progress bar */}
                                            {uploadState?.isUploading && (
                                              <div className="mt-3 ml-11">
                                                <div className="flex items-center gap-2">
                                                  <div className="flex-1">
                                                    <Progress
                                                      percent={
                                                        uploadState.progress
                                                      }
                                                      showInfo={false}
                                                      strokeColor={{
                                                        "0%": "#3B82F6",
                                                        "100%": "#10B981",
                                                      }}
                                                      size="small"
                                                    />
                                                  </div>
                                                  <span className="text-xs text-gray-500 min-w-[40px]">
                                                    {Math.round(
                                                      uploadState.progress
                                                    )}
                                                    %
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              ))
                            )}

                          {/* Show fallback content if no attachFileData */}
                          {/* {(!localAttachFileData || localAttachFileData.length === 0) && (
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  ไฟล์เอกสาร
                                  <span className="text-red-500">*</span>
                                </h4>
                                <button 
                                  className="text-[#3B82F6] hover:text-[#2563EB] underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  disabled={isUploading || Object.values(uploadStates).some(state => state.isUploading)}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = '.pdf,image/*';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                    };
                                    input.click();
                                  }}
                                >
                                  {isUploading ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" />
                                      <span>กำลังอัปโหลด...</span>
                                    </>
                                  ) : (
                                    'อัปโหลด'
                                  )}
                                </button>
                              </div>
                            </div>
                          )} */}
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                key: "2",
                label: (
                  <span className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span>บันทึกข้อความ</span>
                  </span>
                ),
                children: (
                  <div className="mt-3 space-y-4">
                    {/* 💬 Message Type & Filter Controls */}
                    <div className="flex items-center justify-between">
                      {/* Message Type Toggle */}
                      <div className="flex bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => setMessageType("public")}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            messageType === "public"
                              ? "bg-[#3B82F6] text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          ทุกคน
                        </button>
                        <button
                          onClick={() => setMessageType("private")}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            messageType === "private"
                              ? "bg-[#3B82F6] text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          เฉพาะฉัน
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* <Button
                          type="text"
                          size="small"
                          className="text-gray-500 hover:text-blue-500"
                          onClick={refreshMessages}
                          loading={isLoadingMessages}
                        >
                          🔄 รีเฟรช
                        </Button> */}
                        {/* <Button
                          type="text"
                          size="small"
                          className="text-gray-500 hover:text-red-500"
                          onClick={clearAllMessages}
                        >
                          ล้างทั้งหมด
                        </Button> */}
                      </div>
                    </div>

                    {/* 💬 Messages Container */}
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
                      {isLoadingMessages ? (
                        // Loading State
                        <div className="flex items-center justify-center py-8">
                          <Loader2
                            size={24}
                            className="animate-spin text-gray-400"
                          />
                          <span className="ml-2 text-gray-500">
                            กำลังโหลดข้อความ...
                          </span>
                        </div>
                      ) : messages.length === 0 ? (
                        // Empty State
                        <div className="text-center py-8">
                          <MessageSquare
                            size={48}
                            className="mx-auto text-gray-300 mb-3"
                          />
                          <p className="text-gray-500 text-sm">
                            ยังไม่มีข้อความ{" "}
                            {messageType === "public"
                              ? "สำหรับทุกคน"
                              : "สำหรับเฉพาะฉัน"}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            เริ่มต้นการบันทึกข้อความแรก
                          </p>
                        </div>
                      ) : (
                        // Messages List
                        messages.map((message, index) => {
                          // แสดง date header เมื่อเปลี่ยนวัน
                          const showDateHeader =
                            index === 0 ||
                            formatMessageDate(new Date(message.message_data?.created_at)) !==
                              formatMessageDate(
                                new Date(messages[index - 1]?.message_data?.created_at)
                              );

                          return (
                            <div key={message.message_id}>
                              {/* Date Header */}
                              {showDateHeader && (
                                <div className="text-center my-4">
                                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                                    {formatMessageDate(
                                      new Date(message.message_data?.created_at || '')
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Message Bubble */}
                              <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                {/* Avatar */}
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                                    message.type === "public"
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
                                  }`}
                                >
                                  {message.message_data?.created_by?.charAt(0)?.toUpperCase() || '-'}
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 min-w-0">
                                  {/* Header */}
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {message.message_data?.created_by || '-'}
                                    </span>
                                    {/* <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      message.type === "public" 
                                        ? "bg-blue-100 text-blue-600" 
                                        : "bg-purple-100 text-purple-600"
                                    }`}>
                                      {message.type === "public" ? "🌍" : "🔒"}
                                    </span> */}
                                    <span className="text-xs text-gray-500">
                                      {timeSince(new Date(message.message_data?.created_at))}
                                    </span>
                                  </div>

                                  {/* Message Text */}
                                  <div className="text-sm text-gray-700 break-words">
                                    {message.message_data?.message}
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() =>
                                    handleDeleteMessage(message.message_data.message_id)
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                                  title="ลบข้อความ"
                                >
                                  <X size={14} className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* 💬 Message Input Area */}
                    <div className="space-y-3">
                      {/* Type Indicator */}
                      {/* <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          messageType === "public" 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-purple-100 text-purple-600"
                        }`}>
                          {messageType === "public" ? "🌍 ส่งข้อความสาธารณะ" : "🔒 ส่งข้อความส่วนตัว"}
                        </span>
                      </div> */}

                      {/* Input */}
                      <div className="relative">
                        <TextArea
                          rows={3}
                          placeholder={`พิมพ์ข้อความ${
                            messageType === "public" ? "ทุกคน" : "เฉพาะฉัน"
                          }...`}
                          className="pr-12 resize-none"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onPressEnter={(e) => {
                            if (e.shiftKey) return; // Shift + Enter = new line
                            e.preventDefault();
                            sendMessage();
                          }}
                          disabled={isSendingMessage}
                        />
                        <Button
                          type="primary"
                          loading={isSendingMessage}
                          disabled={!newMessage.trim() || isSendingMessage}
                          onClick={sendMessage}
                          icon={
                            !isSendingMessage && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                                  fill="currentColor"
                                />
                              </svg>
                            )
                          }
                          className="absolute right-2 bottom-2 bg-[#3B82F6] border-[#3B82F6] hover:bg-[#2563EB] w-8 h-8 min-w-8 p-0 flex items-center justify-center"
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* More File Url */}
      <ModalMoreFile
        open={isOpenMoreFileUrl}
        onClose={() => setIsOpenMoreFileUrl(false)}
        moreFileUrl={moreFileUrl || ""}
        memeType={mimeType || ""}
        mainType={mainType || ""}
        type={type || ""}
        nameFile={nameFile || ""}
        pdfUrl={pdfUrl || ""}
      />
    </div>
  );
};

export default DocumentDetails;
