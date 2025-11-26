"use client";

import React, {useEffect} from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Modal, Form } from "antd";
import { addSubmittedForm } from "@/store/documentStore/B2BForm";
import { DocsSetting } from "@/store/types/contractB2BType";
// import { FormB2B } from "@/components/mappingComponents/FormComponents/FormB2B";
import { FormB2B } from "@/components/mappingComponents/FormComponents/FormB2BDocument/FormB2B";
import { UndoIcon } from "lucide-react";

export default function ManageContract() {
  const dispatch = useAppDispatch();
  const B2BformData = useAppSelector((state) => state.contractB2BForm.forms)
  const [form] = Form.useForm<DocsSetting>();

  useEffect(() => {
    if (B2BformData) {
      form.setFieldsValue(B2BformData);
      // console.log('B2BformData =>',form.getFieldsValue())
    }
  }, [B2BformData, form]);

  return (
    <>
       {/* <FormB2B pdfPage={0} pdfObject={0} form={form} /> */}
    </>
  );
}
