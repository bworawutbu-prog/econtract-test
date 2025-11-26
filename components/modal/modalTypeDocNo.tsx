
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTypeDocNo, selectTypeDocNo } from "@/store/slices/mappingSlice";
import { Button, Modal, Select } from "antd";
import { X } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { getDocumentType } from "@/store/documentStore/documentAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import router from "next/router";
import { detectApiError } from "@/utils/errorHandler";
interface detailEstampModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DetailStampModal: React.FC<detailEstampModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '',
}) => {
  const dispatch = useAppDispatch();
  const [docsType, setDocsType] = useState<any>([]);
  const hasFetched = useRef(false); // ป้องกัน double fetch
  const currentBusinessId = useRef<string>('');
  
  // การเชื่อมต่อกับ Redux store
  const typeDocNoFromStore = useAppSelector(selectTypeDocNo);
  const { selectedBusinessId } = useSelector((state: RootState) => state.business);
  
  const fetchDocumentTypes = useCallback(async () => {
    try {      
      const businessId = selectedBusinessId || ""; // Default fallback
      const response = await dispatch(getDocumentType(businessId) as any).unwrap()
      // console.log('response getType =>',response)
      const data = response?.map((d:any)=>{
        return {
          label: d.name,
          value: d._id,
          // key: d._id,
        };
      })
      // console.log('data =>',data)
      setDocsType(data)
    } catch (error) {
      const apiError = detectApiError(error);
      if (apiError.errorType === 'network_error') {
        router.replace("/login");
      } else if (apiError.errorType === 'unauthorized') {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      // setDocsType(typeDocNoOptions)
      // if (error instanceof Error) {
      //   console.error('Error fetching document types:', error.message, error);
      // } else {
      //   console.error('Error fetching document types:', String(error));
      // }
    }
  }, [selectedBusinessId, dispatch]);

  useEffect(() => {
    // ป้องกัน double fetch และ fetch ซ้ำสำหรับ businessId เดียวกัน
    if (isOpen && selectedBusinessId) {
      if (currentBusinessId.current === selectedBusinessId && hasFetched.current) {
        return; // ถ้าเป็น businessId เดิม และ fetch แล้ว ไม่ต้อง fetch ซ้ำ
      }
      
      hasFetched.current = true;
      currentBusinessId.current = selectedBusinessId;
      fetchDocumentTypes();
    }
    
    // Reset เมื่อปิด modal
    if (!isOpen) {
      hasFetched.current = false;
    }
  }, [isOpen, selectedBusinessId, fetchDocumentTypes]);

  // ใช้ state จาก Redux
  const [selectedTypeDocNo, setSelectedTypeDocNo] = useState<string>(typeDocNoFromStore || "");
  const [isError, setIsError] = useState<boolean>(false);
  // ตัวอย่าง options สำหรับ Select
  const typeDocNoOptions = [
    { label: "สัญญารักษาความลับ", value: "TVOP-ETC#1" },
    { label: "สัญญาพัฒนาระบบงาน", value: "TVOP-ITE#2" },
    { label: "สัญญาว่าจ้างออกบูทข้าวไข่เจียว กุ๊ก", value: "TVOP-MKT#3" },
    { label: "Contract Blanket Order ซื้อขายอะไหล่ เครื่องจักร", value: "TVOP-SER1#4" },
    { label: "Service Contract PM", value: "TVOP-SER2#5" },
    { label: "สัญญาว่าจ้างงานก่อสร้างจ้างทำของ (แบบไม่มี BG งวด1)", value: "TVOP-SSG#6" },
  ];

  const handleTypeDocNoChange = (value: string, option: any) => {
    setSelectedTypeDocNo(value);

    // ส่งค่าไปยัง Redux store
    dispatch(setTypeDocNo(value));
  };

  // useEffect สำหรับ sync กับ Redux store เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      // โหลดข้อมูลจาก Redux store
      setSelectedTypeDocNo(typeDocNoFromStore || "");
    }
  }, [isOpen, typeDocNoFromStore]);

  // const resetDocNo = () => {
  //   setSelectedTypeDocNo(undefined);
  //   dispatch(setTypeDocNo(undefined as any));
  // };

  // ฟังก์ชันสำหรับ handle confirm
  const handleConfirm = () => {
    // console.log('handleConfirm - selectedTypeDocNo:', selectedTypeDocNo);
    // บันทึกค่าไปยัง Redux store ก่อนปิด modal (เฉพาะเมื่อมีค่าที่เลือก)
    if (selectedTypeDocNo) {
      // console.log('selectedTypeDocNo =>',selectedTypeDocNo)
      dispatch(setTypeDocNo(selectedTypeDocNo));
      // เรียก onConfirm callback
      setIsError(false);
      onConfirm();
    } else {
      console.log('No selectedTypeDocNo, setting error');
      setIsError(true);
    }
  };


  return (
    <div>
      <Modal
        open={isOpen}
        onCancel={onClose}
        // afterClose={resetDocNo}
        title={
          <div className="text-center text-theme font-extrabold w-full text-lg">
            {title}
          </div>
        }
        centered
        closeIcon={
          <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
            <X size={20} />
          </span>
        }
        className="[&_.ant-modal-content]:rounded-[24px]"
        footer={
          <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_8px_-2px_rgba(78,115,248,0.04)] py-4 rounded-b-[24px]">
            <div className="flex w-full justify-center items-center gap-6">
              <Button
                type="text"
                className="w-24 text-theme btn py-4"
                onClick={onClose}
              >
                ยกเลิก
              </Button>
              <button className="btn-theme w-24" onClick={handleConfirm}>
                ตกลง
              </button>
            </div>

          </div>
        }
      >
        <div className="flex-col mt-8 mb-20">
          <div className="mt-4 px-6">
            <Select
              value={selectedTypeDocNo}
              onChange={handleTypeDocNoChange}
              placeholder="เลือกประเภทเอกสาร"
              className="w-full"
              options={docsType}
              size="large"
              status={isError && !selectedTypeDocNo ? "error" : ""}
            />
            {isError && !selectedTypeDocNo && (
              <div className="text-red-500 text-sm mt-2">
                กรุณาเลือกประเภทเอกสาร
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
