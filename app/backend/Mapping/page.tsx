"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { FormItem } from "@/store/types/index";
import { processCoordinates, processPosition } from "@/components/mappingComponents/FormUtils/payloadUtils";
import { convertApiToElementStyle } from "@/components/mappingComponents/FormUtils/defaultStyle";

// 🎯 Lazy-load heavy PDFTemplate to keep initial /backend chunk small
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

// 🎯 Helper function to convert API mapping data to FormItem format
const createFormItemFromMapping = (
  mappingItem: any,
  type: string,
  index: number
): FormItem => {
  const stepIndex = mappingItem.step_index && mappingItem.step_index !== ""
    ? mappingItem.step_index.toString()
    : "0";

  const pageNumber = mappingItem.pageNumber || 1;

  const mockFormItem = {
    step_index: stepIndex,
    pageNumber,
    position: {
      x: parseInt(mappingItem.left || mappingItem.scale_X || "0"),
      y: parseInt(mappingItem.top || mappingItem.scale_Y || "0")
    },
    coordinates: mappingItem.llx && mappingItem.lly && mappingItem.urx && mappingItem.ury ? {
      llx: parseFloat(mappingItem.llx),
      lly: parseFloat(mappingItem.lly),
      urx: parseFloat(mappingItem.urx),
      ury: parseFloat(mappingItem.ury),
    } : { llx: 0, lly: 0, urx: 0, ury: 0 }
  } as FormItem;

  const coordinates = processCoordinates(mockFormItem);
  const position = processPosition(mockFormItem);

  return {
    id: type === "stamp" ? `${type}-${mappingItem.section}-${mappingItem.stampType === "ต้นสัญญา" ? "0" : "1"}-${mappingItem.index || index}` : `${type}-${mappingItem.index || index}`,
    type: type as any,
    label: mappingItem.text || mappingItem[`${type}_name`] || type,
    step_index: stepIndex,
    pageNumber,
    position: {
      x: parseInt(mappingItem.left || mappingItem.scale_X || "0"),
      y: parseInt(mappingItem.top || mappingItem.scale_Y || "0"),
    },
    value: mappingItem.value || (type === "checkbox" || type === "radio" ? false : ""),
    config: {
      required: mappingItem.required === true || mappingItem.required === "true",
      maxLength: type === "text" ? parseInt(mappingItem.max_characters || "100") : 0,
      placeholder: type === "text" ? `Enter ${mappingItem.text || type}` : "",
    },
    style: convertApiToElementStyle(mappingItem, type),
    coordinates: coordinates.llx !== "0" ? {
      llx: parseFloat(coordinates.llx),
      lly: parseFloat(coordinates.lly),
      urx: parseFloat(coordinates.urx),
      ury: parseFloat(coordinates.ury),
    } : { llx: 0, lly: 0, urx: 0, ury: 0 },
    ...(type === "checkbox" && { checkboxOptions: [mappingItem.checkbox_name || mappingItem.text || ""] }),
    ...(type === "radio" && { radioOptions: [mappingItem.radio_name || mappingItem.text || ""] }),
    ...(type === "signature" && {
      actorId: mappingItem.actorId || stepIndex,
      signatureType: mappingItem.signatureType || "normal",
    }),
  };
};

function Page() {
  const searchParams = useSearchParams();
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
  // 🎯 FIXED: Use state to read sessionStorage (avoid hydration issues and cache)
  const [typeForms, setTypeForms] = useState<string>("create");

  // Get URL params for document details (if any)
  const documentId = searchParams.get("documentId");
  const pdfUrl = searchParams.get("pdfUrl") || "/pdf/กระดาษรายงาน.pdf";
  const title = searchParams.get("title") || "Untitled.pdf";
  const workspaceId = searchParams.get("workspaceId") || "";
  const folderId = searchParams.get("folderId") || "";
  const docType = searchParams.get("docType") || "";
  const docTypeId = searchParams.get("docTypeId") || ""; // 🎯 NEW: Document type ID for template mode
  const formId = searchParams.get("formId") || ""; // 🎯 NEW: Form ID for template mode
  
  // 🎯 FIXED: Read type from URL first, then check sessionStorage (avoid cache issues)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Priority: URL > sessionStorage > default
    const urlType = searchParams.get("type");
    const sessionData = sessionStorage.getItem("templateFormData");
    const typeFormData = sessionStorage.getItem("typeForm");
    // 🎯 FIXED: Check !== null (sessionStorage.getItem returns null, not undefined)
    // If URL has type, use it. Otherwise, check sessionStorage for useDocument mode
    const finalType = typeFormData || urlType || "create";
    
    console.log("🔍 [Mapping/page] Type Debug:", {
      urlType: urlType,
      sessionData: sessionData !== null ? "exists" : "null",
      sessionDataLength: sessionData?.length || 0,
      finalType: finalType,
      fullURL: window.location.href,
      allSearchParams: searchParams.toString(),
      timestamp: new Date().toISOString(), // 🎯 Add timestamp to verify fresh reads
    });
    
    setTypeForms(finalType);
  }, [searchParams]); // 🎯 FIXED: Only depend on searchParams, not sessionStorage

  // 🎯 Load template form data from sessionStorage if type is "template" or "useDocument"
  useEffect(() => {
    // console.log("Params:", Object.fromEntries(searchParams.entries()));
    console.log("🔍 [Mapping/page] typeForms in useEffect:", typeForms);
    // console.log('formId =>',formId)
    // console.log('typeof window =>',typeof window)
    const templateFormDataStr = sessionStorage.getItem("templateFormData");
    // const convertData = JSON.parse(templateFormDataStr);
    // console.log('convertData =>',convertData)

    if ((typeForms === "template" || typeForms === "useDocument") && formId && typeof window !== "undefined") {
      setIsLoadingTemplate(true);
      try {
        
        // console.log('templateFormDataStr =>',templateFormDataStr)
        if (templateFormDataStr) {
          const templateFormData = JSON.parse(templateFormDataStr);
          const mapping = templateFormData.mapping || {};
          const items: FormItem[] = [];

          // Convert mapping data to FormItems
          if (mapping.mapping_text) {
            mapping.mapping_text.forEach((text: any, index: number) => {
              items.push(createFormItemFromMapping(text, "text", index));
            });
          }

          if (mapping.mapping_signature) {
            mapping.mapping_signature.forEach((signature: any, index: number) => {
              items.push(createFormItemFromMapping(signature, "signature", index));
            });
          }

          if (mapping.mapping_date_time) {
            mapping.mapping_date_time.forEach((dateTime: any, index: number) => {
              items.push(createFormItemFromMapping(dateTime, "date_time", index));
            });
          }

          if (mapping.mapping_checkbox) {
            mapping.mapping_checkbox.forEach((checkbox: any, index: number) => {
              items.push(createFormItemFromMapping(checkbox, "checkbox", index));
            });
          }

          if (mapping.mapping_radiobox) {
            mapping.mapping_radiobox.forEach((radio: any, index: number) => {
              items.push(createFormItemFromMapping(radio, "radio", index));
            });
          }

          if (mapping.mapping_doc_no) {
            mapping.mapping_doc_no.forEach((docNo: any, index: number) => {
              items.push(createFormItemFromMapping(docNo, "doc_no", index));
            });
          }

          if (mapping.mapping_more_file) {
            mapping.mapping_more_file.forEach((moreFile: any, index: number) => {
              items.push(createFormItemFromMapping(moreFile, "more_file", index));
            });
          }

          if (mapping.mapping_eseal) {
            mapping.mapping_eseal.forEach((eseal: any, index: number) => {
              items.push(createFormItemFromMapping(eseal, "eseal", index));
            });
          }

          if (mapping.mapping_stamp) {
            mapping.mapping_stamp.forEach((stamp: any, index: number) => {
              items.push(createFormItemFromMapping(stamp, "stamp", index));
            });
          }
          console.log("mapping items =>",items)
          setFormItems(items);
        }
      } catch (error) {
        console.error("Error loading template form data:", error);
      } finally {
        setIsLoadingTemplate(false);
      }
    }else{
      console.log('Do not have templateData')
    }
  }, [typeForms, formId]);

  // Derive a document ID from the PDF fitypeFormslename if none is provided
  const derivedDocumentId = React.useMemo(() => {
    if (documentId) return documentId;

    // Extract filename from URL
    const filename = (pdfUrl.split('/').pop() || "").toLowerCase();

    // Map common PDF filenames to document IDs that match defaultFormItems
    if (filename.includes("camry")) return "1";
    if (filename.includes("honda") || filename.includes("accord")) return "4";
    if (filename.includes("atto3")) return "3";
    if (filename.includes("sealion")) return "5";
    if (filename.includes("price")) return "1";

    return documentId || "";
  }, [documentId, pdfUrl]);

  const handleFormItemsChange = React.useCallback((updatedItems: FormItem[]) => {
    setFormItems(updatedItems);
  }, []);
  
  // 🎯 DEBUG: Log final typeForms value before render
  console.log("🔍 [Mapping/page] Final typeForms before render:", typeForms);
  
  // 🎯 FIXED: Create unique key from searchParams to force re-render when params change
  // This prevents Next.js router cache from showing stale data
  const uniqueKey = useMemo(() => {
    const params = {
      pdfUrl,
      title,
      type: typeForms,
      documentId: derivedDocumentId,
      workspaceId,
      folderId,
      docType,
      docTypeId,
      formId,
    };
    return JSON.stringify(params);
  }, [pdfUrl, title, typeForms, derivedDocumentId, workspaceId, folderId, docType, docTypeId, formId]);
  
  return (
    <PDFTemplate
      key={uniqueKey} // 🎯 FIXED: Force re-render when searchParams change (prevent router cache)
      hasStickyTopBar={true}
      hasFormSidebar={true}
      hasPDFThumbnail={true}
      hasDocumentDetail={false}
      isEditable={typeForms === "template" ? false : true} // 🎯 Template mode is view-only
      isViewMode={typeForms === "template"} // 🎯 Template mode is view-only
      initialPdfUrl={pdfUrl}
      initialTitle={title}
      documentId={derivedDocumentId}
      formItems={formItems.length > 0 ? formItems : []} // 🎯 Pass formItems if loaded from template
      onFormItemsChange={handleFormItemsChange}
      type={typeForms}
      workspaceId={workspaceId}
      folderId={folderId}
      docType={docType}
      docTypeId={docTypeId} // 🎯 NEW: Pass document type ID for template mode
    />
  );
}

export default Page;
