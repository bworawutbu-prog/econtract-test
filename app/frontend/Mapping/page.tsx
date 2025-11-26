"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getApprover } from "@/store/token";
import { transactions } from "@/store/frontendStore/transactionAPI";
import { listTransactionSchema } from "@/store/types/mappingTypes";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import type { listTransaction } from "@/store/frontendStore/transactionAPI";
import type { FormItem } from "@/store/types";
import { FlowDataItem } from "@/store/types/PDFTemplateTypes";
import {
  STYLE_CONSTANTS,
  getDefaultElementSize,
  convertApiToElementStyle,
  getCompleteElementConfig,
} from "@/components/mappingComponents/FormUtils/defaultStyle";
import {
  buildBasePayload,
  processCoordinates,
  processPosition,
} from "@/components/mappingComponents/FormUtils/payloadUtils";
import { Loader2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { getCookie } from "cookies-next/client";

// Lazy-load heavy PDFTemplate to keep initial /frontend chunk small
const PDFTemplate = dynamic(
  () => import("@/components/mappingComponents/PDFTemplate"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-600">กำลังโหลดเครื่องมือจัดการเอกสาร...</p>
        </div>
      </div>
    ),
  }
);

// 🎯 SIMPLIFIED INTERFACES - Only keep what's actually used
interface MoreFileItem {
  id: string;
  type: string;
  label: string;
  step_index: string;
  pageNumber: number;
}

// 🎯 HELPER FUNCTIONS - Centralized utility functions
export const getFlowDataIndex = (data: listTransactionSchema, isGuest: boolean, guestEmail?: string, guestEmail2?: string): string[] => {
  const reEmail = /[@]/;
  // console.log("flowData filter",data.flow_data.filter(
  //   (flow) =>
  //     flow?.status === "W" 
  //     &&
  //     flow?.entity
  //       ?.map((e: any) => e.email)
  //       .includes(getApprover()?.email || guestEmail || guestEmail2 || "")
  // ))
  // console.log('SDSD', data, getApprover())
  if (data?.contract_type === 'b2b') {
    return data?.flow_data
        .filter(
          (flow) =>
            flow?.status === "W" &&
            (flow?.entity
              ?.map((e: any) => e.email)
              .includes(getApprover()?.email || "")
            ||
            flow?.entity
              ?.map((e: any) => e.id)
              .includes(getApprover()?.id || "")
            )
        )
        .map((flow) => flow?.index?.toString());

} else {
  if(isGuest){
    return data?.flow_data
      .filter(
        (flow) =>
          flow?.status === "W" &&
          flow?.entity.map((e: any) => e.email).includes(guestEmail || guestEmail2 || "")
      )
      .map((flow) => flow?.index?.toString());
  } else {
    return data?.flow_data
    .filter(
    (flow) =>
      flow?.status === "W" &&
      flow?.entity
        ?.map((e: any) => e.email)
        .includes(guestEmail?.search(reEmail) !== -1
        ? guestEmail
        : guestEmail2 || "")
  )
      .map((flow) => flow?.index.toString());
    }
  }
  // return isGuest
  // ? data?.flow_data
  //     // .filter(
  //     //   (flow) =>
  //     //     flow?.status === "W" &&
  //     //     flow?.entity
  //     //       ?.map((e: any) => e.name)
  //     //       .includes(
  //     //         guestEmail?.search(reEmail) !== -1
  //     //           ? guestEmail
  //     //           : guestEmail2 || ""
  //     //       )
  //     // )
  //     .filter(
  //       (flow) =>
  //         flow?.status === "W" &&
  //         flow?.entity
  //           ?.map((e: any) => e.email)
  //           .includes(
  //             guestEmail?.search(reEmail) !== -1
  //               ? guestEmail
  //               : guestEmail2 || ""
  //           )
  //     )
  //     .map((flow) => flow?.index.toString())
  // // : data?.flow_data
  // //     .filter(
  // //       (flow) =>
  // //         flow?.status === "W" &&
  // //         flow?.entity
  // //           ?.map((e: any) => e.name)
  // //           .includes(getApprover()?.email || guestEmail || guestEmail2 || "")
  // //     )
  // : data?.flow_data
  //   .filter(
  //   (flow) =>
  //     flow?.status === "W" &&
  //     flow?.entity
  //       ?.map((e: any) => e.email)
  //       .includes(guestEmail?.search(reEmail) !== -1
  //       ? guestEmail
  //       : guestEmail2 || "")
  // )
  //     .map((flow) => flow?.index.toString());
  //   }
  }

const buildFormDataFlow = (data: listTransactionSchema): any[] => {
  const formDataFlow: any[] = [];
  data.flow_data.flatMap(
    ({ approved_at, index, status, type_entity, entity, section }) =>
      entity.forEach((e: any) => {
        const approverInfo = {
          approved_at,
          level: index,
          status,
          type_entity,
          approver: {
            email: e.name || "",
            name: `${e.first_name_th || ""} ${e.last_name_th || ""}`,
            id: e.id || "",
          },
          section : section || "",
        };
        formDataFlow.push(approverInfo);
      })
  );
  return formDataFlow;
};

const createFormItemFromApiData = (
  apiData: any,
  type: string,
  stepIndex: string,
  pageNumber: number,
  index: number = 0
): FormItem => {
  // 🎯 CENTRALIZED: Use centralized functions for consistent processing
  const mockFormItem = {
    step_index: stepIndex,
    pageNumber,
    position: { x: parseInt(apiData.left || apiData.scale_X || "0"), y: parseInt(apiData.top || apiData.scale_Y || "0") },
    coordinates: apiData.llx && apiData.lly && apiData.urx && apiData.ury ? {
      llx: parseFloat(apiData.llx),
      lly: parseFloat(apiData.lly),
      urx: parseFloat(apiData.urx),
      ury: parseFloat(apiData.ury),
    } : { llx: 0, lly: 0, urx: 0, ury: 0 }
  } as FormItem;

  const coordinates = processCoordinates(mockFormItem);

  return {
    id: apiData[`${type}_id`] || `${type}-${index}`,
    type: type as any,
    label: apiData.text || apiData[`${type}_name`] || type,
    step_index: stepIndex,
    pageNumber,
    position: {
      x: parseInt(apiData.left || apiData.scale_X || "0"),
      y: parseInt(apiData.top || apiData.scale_Y || "0"),
    },
    value: apiData.value || (type === "checkbox" || type === "radio" ? false : ""),
    config: {
      required: apiData.required === true || apiData.required === "true",
      maxLength: type === "text" ? parseInt(apiData.max_characters || "100") : 0,
      placeholder: type === "text" ? `Enter ${apiData.text || type}` : "",
    },
    style: convertApiToElementStyle(apiData, type),
    coordinates: coordinates.llx !== "0" ? {
      llx: parseFloat(coordinates.llx),
      lly: parseFloat(coordinates.lly),
      urx: parseFloat(coordinates.urx),
      ury: parseFloat(coordinates.ury),
    } : { llx: 0, lly: 0, urx: 0, ury: 0 },
    ...(type === "checkbox" && { checkboxOptions: [apiData.checkbox_name || apiData.text || ""] }),
    ...(type === "radio" && { radioOptions: [apiData.radio_name || apiData.text || ""] }),
  };
};

export default function Page() {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get("documentId");
  const pdfUrl = searchParams.get("pdfUrl");
  const title = searchParams.get("title");
  const user = useAppSelector((state: RootState) => state.auth?.user);
  const transactionData = useAppSelector(
    (state) => state.transaction
  ) as listTransaction;
  const [loading, setLoading] = useState(true);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string>("");
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [mappingFormDataId, setMappingFormDataId] = useState<string>("");
  const [transactionPayload, setTransactionPayload] = useState<any>({});
  const [formDataFlow, setFormDataFlow] = useState<any>([]);
  const [flowDataIndex, setFlowDataIndex] = useState<string>("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // ป้องกัน double fetch จาก React Strict Mode
  const hasFetchedTransaction = useRef(false);
  const currentDocumentId = useRef<string>('');
  // 🎯 CENTRALIZED: Convert base64 to URL function
  const convertBase64ToUrl = (base64String: string): string => {
    try {
      if (!base64String || typeof base64String !== "string") {
        enqueueSnackbar(`Invalid base64 string: ${base64String}`, { variant: "error", autoHideDuration: 3000 });
        return "";
      }

      const byteCharacters = atob(base64String.split(",")[1] || base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (error) {
      enqueueSnackbar(`Error converting base64 to URL: ${error}`, { variant: "error", autoHideDuration: 3000 });
      return "";
    }
  };

  // Cleanup function for URL
  useEffect(() => {
    return () => {
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [convertedPdfUrl]);

  // Map transaction data to form items
  const mapTransactionToFormItems = (
    data: listTransactionSchema
  ): FormItem[] => {
    const isGuest =
      typeof window !== "undefined" &&
      sessionStorage.getItem("isGuest") === "true";
    
    // 🎯 รองรับทั้ง B2B และ B2C flow
    const transactionType = sessionStorage.getItem("transactionType");
    const guestEmail = sessionStorage.getItem("guestName");
    const guestEmail2 = sessionStorage.getItem("guestEmail");
    
    // สำหรับ B2B จะใช้ข้อมูลจาก user context
    const b2bUserContext = sessionStorage.getItem("b2bUserContext");
    const businessContext = sessionStorage.getItem("businessContext");
    
    // console.log('🔍 [Mapping] Flow context:', {
    //   transactionType,
    //   isGuest,
    //   guestEmail,
    //   guestEmail2,
    //   b2bUserContext,
    //   businessContext
    // });
    const items: FormItem[] = [];

    // 🎯 CENTRALIZED: Use helper functions
    const formDataFlow = buildFormDataFlow(data);
    setFormDataFlow(formDataFlow);
    // console.log('data =>',data)
    
    // 🎯 กำหนด email ที่จะใช้ตาม transaction type
    const effectiveEmail = transactionType === "b2b" ? b2bUserContext : guestEmail || user?.email;
    const effectiveEmail2 = transactionType === "b2b" ? "" : guestEmail2;
    // const isEffectiveGuest = transactionType === "b2c" || isGuest;
    const isEffectiveGuest = isGuest;

    
    const flow_data_index = getFlowDataIndex(data, isEffectiveGuest, effectiveEmail || "", effectiveEmail2 || "");
    // console.log('flow_data_index =>',flow_data_index)
    // const mappingDataIndex = flow_data_index.length > 0 ? "W" : "Y";
    let mappingDataIndex = "";
    // console.log('flow_data_index.length =>',flow_data_index)
    if(data){
      // console.log('data.status =>',data.status)
      if(data && data.status === "N"){
        mappingDataIndex = "N";
        setFlowDataIndex(mappingDataIndex);
      } else if (data && data.status === "Y"){
        mappingDataIndex = "Y";
        setFlowDataIndex(mappingDataIndex);
      } else if (data && data.status === "D"){
        mappingDataIndex = "D";
        setFlowDataIndex(mappingDataIndex);
      } else if (data && data.status === "C"){
        mappingDataIndex = "C";
        setFlowDataIndex(mappingDataIndex);
      } else if (data && data.status === "R"){
        mappingDataIndex = "R";
        setFlowDataIndex(mappingDataIndex);
      } else if (data && data.status === "W"){
        mappingDataIndex = "W";
        setFlowDataIndex(mappingDataIndex);
      }
    }
    // console.log('flow_data_index =>',flowDataIndex)
    const mappingId = data.mapping_form_data_id._id?.toString() || "";
    setMappingFormDataId(mappingId);

    // 🎯 CENTRALIZED: Map text fields using helper function
    if (data.mapping_form_data_id?.mapping_text) {
      data.mapping_form_data_id.mapping_text.forEach((text, index) => {
        const stepIndex = (text.step_index !== undefined && text.step_index !== null && text.step_index !== "") ? text.step_index.toString() : "MISSING";
        const isInFlow = flow_data_index.includes(text.step_index?.toString() || "");

        if (isInFlow) {
          const formItem = createFormItemFromApiData(text, "text", stepIndex, text.pageNumber || 1, index);
          formItem.id = `text-${text.index}`;
          formItem.config = {
            required: text.required === "true",
            maxLength: parseInt(text.max_characters || "100"),
            placeholder: `Enter ${text.text}`,
          };
          items.push(formItem);
        }
      });
    }

    // 🎯 CENTRALIZED: Map signature fields using helper function
    if (data.mapping_form_data_id?.mapping_signature) {
      data.mapping_form_data_id.mapping_signature.forEach((signature, i) => {
        const stepIndex = (signature.step_index !== undefined && signature.step_index !== null && signature.step_index !== "") ? signature.step_index.toString() : "";
        const isInFlow = flow_data_index.includes(signature.step_index?.toString() || "");

        if (isInFlow) {
          const formItem = createFormItemFromApiData(signature, "signature", stepIndex, signature.pageNumber || 1, i);
          formItem.id = `signature-${signature.index}`;
          formItem.value = "";
          formItem.label = signature.text || `คนที่ ${(signature.index || i) + 1}`; // 🎯 FIXED: Use text from API
          formItem.config = {
            required: signature.required === "true",
          };
          formItem.label = signature.text || `คนที่ ${(signature.index || i) + 1}`;
          formItem.style = {
            ...formItem.style,
            fontWeight: signature.signatureType || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
          };
          items.push(formItem);
        }
      });
    }

    // 🎯 CENTRALIZED: Map more_file fields
    if (data.mapping_form_data_id?.mapping_more_file) {
      data.mapping_form_data_id.mapping_more_file.forEach((moreFile: any, index: number) => {
        const isInFlow = flow_data_index.includes(moreFile.step_index?.toString() || "");

        if (isInFlow) {
          const itemToMoreFile: MoreFileItem = moreFile;
          items.push(itemToMoreFile);
        }
      });
    }

    // 🎯 CENTRALIZED: Map checkbox fields using helper function
    if (data.mapping_form_data_id?.mapping_checkbox) {
      data.mapping_form_data_id.mapping_checkbox.forEach((checkboxGroup: any, groupIndex: number) => {
        if (checkboxGroup.option_elements) {
          const groupStepIndex = (checkboxGroup.step_index !== undefined && checkboxGroup.step_index !== null && checkboxGroup.step_index !== "") ? checkboxGroup.step_index.toString() : "";
          const groupPageNumber = checkboxGroup.pageNumber || 1;
          const isInFlow = flow_data_index.includes(groupStepIndex);

          if (isInFlow) {
            checkboxGroup.option_elements.forEach((checkboxElement: any, elementIndex: number) => {
              const formItem = createFormItemFromApiData(checkboxElement, "checkbox", groupStepIndex, groupPageNumber, elementIndex);
              formItem.id = checkboxElement.checkbox_id || `checkbox-${groupIndex}-${elementIndex}`;
              formItem.checkboxOptions = [checkboxElement.checkbox_name || checkboxElement.text || ""];
              formItem.parentId = checkboxGroup.group_timestamp || `checkbox-group-${groupIndex}`;
              formItem.optionIndex = elementIndex;
              items.push(formItem);
            });
          }
        }
      });
    }

    // 🎯 CENTRALIZED: Map radio fields using helper function
    if (data.mapping_form_data_id?.mapping_radiobox) {
      data.mapping_form_data_id.mapping_radiobox.forEach((radioGroup: any, groupIndex: number) => {
        if (radioGroup.option_elements) {
          const groupStepIndex = (radioGroup.step_index !== undefined && radioGroup.step_index !== null && radioGroup.step_index !== "") ? radioGroup.step_index.toString() : "";
          const groupPageNumber = radioGroup.pageNumber || 1;
          const isInFlow = flow_data_index.includes(groupStepIndex);

          if (isInFlow) {
            radioGroup.option_elements.forEach((radioElement: any, elementIndex: number) => {
              const formItem = createFormItemFromApiData(radioElement, "radio", groupStepIndex, groupPageNumber, elementIndex);
              formItem.id = radioElement.radio_id || `radio-${groupIndex}-${elementIndex}`;
              formItem.radioOptions = [radioElement.radio_name || radioElement.text || ""];
              formItem.parentId = radioGroup.group_timestamp || `radio-group-${groupIndex}`;
              formItem.optionIndex = elementIndex;
              items.push(formItem);
            });
          }
        }
      });
    }

    // 🎯 CENTRALIZED: Map date fields using helper function
    if (data.mapping_form_data_id?.mapping_date_time) {
      data.mapping_form_data_id.mapping_date_time.forEach((dateGroup: any, groupIndex: number) => {
        if (dateGroup.date_elements) {
          const groupPageNumber = dateGroup.pageNumber || 1;
          const groupStepIndex = (dateGroup.step_index !== undefined && dateGroup.step_index !== null && dateGroup.step_index !== "") ? dateGroup.step_index.toString() : "";
          const isInFlow = flow_data_index.includes(groupStepIndex);

          if (isInFlow) {
            dateGroup.date_elements.forEach((dateElement: any, elementIndex: number) => {
              if (!dateElement || typeof dateElement !== "object") {
                console.warn(`Skipping invalid date element at index ${elementIndex}:`, dateElement);
                return;
              }

              const validDateType = dateElement.date_type && ["days", "months", "years"].includes(dateElement.date_type)
                ? dateElement.date_type
                : "days";

              const formItem = createFormItemFromApiData(dateElement, validDateType, groupStepIndex, groupPageNumber, elementIndex);
              formItem.id = dateElement.date_element_id || `date-${groupIndex}-${validDateType}-${elementIndex}`;
              formItem.type = validDateType as "days" | "months" | "years";
              formItem.config = {
                required: dateElement.required === true || dateElement.required === "true",
                maxLength: validDateType === "days" ? 2 : validDateType === "months" ? 2 : 4,
                placeholder: validDateType === "days" ? "DD" : validDateType === "months" ? "MM" : "YYYY",
                dateFormat: dateGroup.format || "EU",
              };
              formItem.dateTimeType = "date";
              items.push(formItem);
            });
          }
        }
      });
    }

    return items;
  };

  // State for current user's step index
  const [currentUserStepIndex, setCurrentUserStepIndex] = useState<string>("");
  // State for creator/sender status
  const [isCreatorOrSender, setIsCreatorOrSender] = useState<boolean>(false);
  // State for current user's action (signer or approver)
  const [currentUserAction, setCurrentUserAction] = useState<string>("approver");
  console.log('currentUserAction =>',currentUserAction)

  // 🎯 NEW: Callback to handle form items changes from PDFTemplate
  const handleFormItemsChange = useCallback((updatedFormItems: FormItem[]) => {
    setFormItems(updatedFormItems);
  }, []);

  // 🎯 CENTRALIZED: Main data fetching effect
  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      // ป้องกัน double fetch
      if (currentDocumentId.current === documentId && hasFetchedTransaction.current) {
        return; // ถ้าเป็น documentId เดิมและ fetch แล้ว ไม่ต้อง fetch ซ้ำ
      }

      try {
        setLoading(true);
        hasFetchedTransaction.current = true;
        currentDocumentId.current = documentId;
        
        const result = await dispatch(transactions(documentId));
        if (result.payload?.error) {
          if(result.payload?.status === 403) {
            enqueueSnackbar("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาลองใหม่อีกครั้ง", { variant: "error", autoHideDuration: 3000 });
            router.replace("/frontend");
          } else {

          }
        }
        const flowData = result.payload?.flow_data as FlowDataItem[];

        const isGuest = sessionStorage.getItem("isGuest") === "true";
        const transactionType = sessionStorage.getItem("transactionType") || sessionStorage.getItem("pendingType");
        const guestName = sessionStorage.getItem("guestName")?.trim();
        const b2bUserContext = sessionStorage.getItem("b2bUserContext");
        
        // 🎯 กำหนด username ตาม flow type
        let currentUsername = "";
        if (transactionType === "b2b" && !isGuest) {
          // B2B flow - ใช้ b2bUserContext หรือ user email
          currentUsername = b2bUserContext || user?.email || "";
        } else if (transactionType === "b2c" && !isGuest) {
          // B2C contract flow - ใช้ b2bUserContext หรือ user email
          currentUsername = b2bUserContext || user?.email || "";
        } else if (transactionType === "b2c" || isGuest) {
          // B2C flow - ใช้ guest information
          currentUsername = guestName || "";
        } else {
          // Legacy flow
          currentUsername = isGuest ? guestName || "" : user?.email || "";
        }
        
        // console.log('👤 [Mapping] Current user context:', {
        //   transactionType,
        //   isGuest,
        //   currentUsername,
        //   userEmail: user?.email,
        //   guestName,
        //   b2bUserContext
        // });

        // 🎯 CENTRALIZED: Find current user's step
        const userSteps = (flowData || []).filter((item) =>
          item.entity?.some((e: any) => e.name === currentUsername)
        );
        userSteps.sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
        const matchedStep = userSteps.find((step) => step.status === "W") || userSteps[0];
        
        // 🎯 CENTRALIZED: Handle validation logic
        const validateType = matchedStep?.validate_type;
        const typeEntity = matchedStep?.type_entity;
        const alreadyValidated = documentId && sessionStorage.getItem(`validated_${documentId}`) === "true";
        const isValidatedParam = searchParams.get("validated") === "true";
        const isCreatorOrSenderLocal = typeEntity === "sender";
        
        // 🎯 Set creator/sender status for StickyTopBar
        setIsCreatorOrSender(isCreatorOrSenderLocal);

        if (!isCreatorOrSenderLocal && validateType === "otp" && !isValidatedParam && !alreadyValidated) {
          setShouldRedirect(true);
          router.replace(`/frontend/Mapping/checkValidate?from=otp&documentId=${documentId}`);
          return;
        } else if (!isCreatorOrSenderLocal && validateType === "password" && !isValidatedParam && !alreadyValidated) {
          setShouldRedirect(true);
          router.replace(`/frontend/Mapping/checkValidate?from=password&documentId=${documentId}`);
          return;
        }

        // 🎯 CENTRALIZED: Process PDF and form data
        if (result.payload?.pdf_base64) {
          const url = convertBase64ToUrl(result.payload.pdf_base64);
          if (url) setConvertedPdfUrl(url);
        }

        if (result.payload) {
          setTransactionPayload(result.payload);
          const mappedItems = mapTransactionToFormItems(result.payload);
          setFormItems(mappedItems);

          // 🎯 CENTRALIZED: Set current user step index ด้วยข้อมูลที่ถูกต้อง
          const effectiveEmail = transactionType === "b2b" ? currentUsername : guestName || currentUsername;
          const effectiveEmail2 = transactionType === "b2b" ? "" : sessionStorage.getItem("guestEmail");
          
          const currentUserFlowData = getFlowDataIndex(
            result.payload, 
            // (transactionType === "b2c") || isGuest,  // ถือว่าเป็น guest หาก B2C หรือ isGuest = true
            isGuest,
            effectiveEmail, 
            effectiveEmail2 || ""
          );
          const currentUserFlowDataObjects = result.payload.flow_data.filter((flow: any) => 
            currentUserFlowData.includes(flow.index.toString())
          );
          
          if (currentUserFlowDataObjects.length > 0) {
            const firstFlow = currentUserFlowDataObjects[0];
            setCurrentUserStepIndex(firstFlow.index.toString());
            // 🎯 NEW: Set current user action from flow_data
            setCurrentUserAction(firstFlow.action || "approver");
          } else {
            setCurrentUserStepIndex("0");
            setCurrentUserAction("approver");
          }
        }
      } catch (error) {
        // enqueueSnackbar(`Error fetching transaction data: ${error}`, { variant: "error", autoHideDuration: 3000 });
        // localStorage.clear();
        // sessionStorage.clear();
        // router.replace("/login");
        console.log('error =>',error)
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]); // dispatch ไม่ควรอยู่ใน dependencies

  // 🎯 CENTRALIZED: Extract PDF data with memoization
  const pdfData = React.useMemo(() => {
    if (!transactionData || !transactionData.data) {
      return {
        pdfUrl: "",
        title: title || "Untitled Document",
        documentId: "",
      };
    }
    
    const rawData = transactionData.data;
    const data = Array.isArray(rawData) ? rawData[0] : rawData;
    
    return {
      pdfUrl: convertedPdfUrl || ((data && data.path_pdf) ? `${process.env.NEXT_PUBLIC_API_URL}${data.path_pdf}` : ""),
      title: (data && data.pdf_name) || title || "Untitled Document",
      documentId: (data && data.document_id) || "",
    };
  }, [transactionData, title, convertedPdfUrl]);

  if (shouldRedirect) {
    return <></>; // Prevents PDF/UI from rendering while redirecting
  }

  if (loading) {
    return (
      <div className="flex gap-2 justify-center items-center min-h-[80vh]">
        <Loader2 size={24} className="animate-spin text-theme" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <PDFTemplate
      hasStickyTopBar={true}
      hasFormSidebar={true}
      hasPDFThumbnail={true}
      hasDocumentDetail={true}
      isEditable={false}
      isViewMode={true}
      initialPdfUrl={pdfData?.pdfUrl || ""}
      initialTitle={pdfData?.title || ""}
      documentId={documentId || ""}
      mappingFormDataId={mappingFormDataId || ""}
      documentData={transactionPayload}
      documentStatus={flowDataIndex}
      onBack={() => router.back()}
      formItems={formItems}
      formDataFlow={formDataFlow}
      currentUserStepIndex={currentUserStepIndex}
      currentUserAction={currentUserAction || "approver"} // 🎯 NEW: Pass current user action (signer/approver)
      onFormItemsChange={handleFormItemsChange}
      isCreatorOrSender={isCreatorOrSender} // 🎯 NEW: Pass creator/sender status
    />
  );
}
