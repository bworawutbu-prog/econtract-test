import { getDetailTransactionSlip } from "@/store/backendStore/stampAPI";
import { useAppDispatch } from "@/store/hooks";
import {
  PostalTradeAddress,
  TransactionDetail,
} from "@/store/types/estampTypes";
import { buildingPropertyTypeList, conditionForPowerOfAttorneyList, conditionForSecurityList, landPropertyTypeList, movablePropertyTypeList } from "@/store/types/othersPropertiesType";
import { Button, Modal } from "antd";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatNumber } from "../utils/convert";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface detailEstampModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionID: string;
}

export const DetailStampModal: React.FC<detailEstampModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  transactionID,
}) => {
  const dispatch = useAppDispatch();
  const [transEtampDetail, setTransEstampDetail] =
    useState<TransactionDetail>();
  const [addressDetail, setAddressDetail] = useState<string>("ไม่ระบุ");
  const getEstampTypeDetail = async ({ id }: { id: string }) => {
    if (typeof id === "string") {
      const res = await dispatch(getDetailTransactionSlip(id) as any);
      setTransEstampDetail(res.payload.data);
      const address: PostalTradeAddress =
        res.payload.data.eform_data[0].instInfo[0].party.postalTradeAddress;
      const addrDetail = `${address?.buildingNumber} ${address?.moo} ${address?.streetName} ${address?.citySubDivisionName} ${address?.cityName} ${address?.countrySubDivisionName} ${address?.postCode}`;
      setAddressDetail(addrDetail);
    }
  };

  useEffect(() => {
    getEstampTypeDetail({
      id: transactionID as string,
    });
  }, [transactionID]);

  const formatThaiDate = (date?: string | Date | null) => {
    if (!date || date === null || date === undefined) return "ไม่ระบุ";
    return dayjs(date).locale("th").format("DD/MM/BBBB");
  };

  const dataDetail = () => {
    if (transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode == "1") {
      return (<span>
        {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.arrayDetail.map((item) => {
          if (item.attType == "1") {
            if (item.attActionType1 == "1") {
              return (<span>
                ประเภท {item.attActionType2 == "6" ? item.attDetail5 : landPropertyTypeList.find((el) => el.value == item.attActionType2)?.label}, เลขที่ {item.attDetail1}, เลขที่ที่ดิน {item.attDetail6}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
              </span>)
            }
            if (item.attActionType1 == "2") {
              return (<span>
                ประเภท {item.attActionType2 == "6" ? item.attDetail5 : buildingPropertyTypeList.find((el) => el.value == item.attActionType2)?.label}, เลขที่ {item.attDetail1}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
              </span>)
            }
            if (item.attActionType1 == "3") {
              return (<span>
                {item.attDetail5} {item.attDetail1}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
              </span>)
            }
            if (item.attActionType1 == "4") {
              return (<span>
                แพเลขที่ {item.attDetail1}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
              </span>)
            }
          }
        })}
        {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.arrayDetail.map((item) => {
          if (item.attType == "2") {
            if (item.attActionType1 == "1") {
              return (<span>
                เงินค่าเช่าเดือนละ {formatNumber(item.attAmount1 || 0)} บาท, จำนวน {item.attNumber1} เดือน, เงินกินเปล่า {formatNumber(item.attAmount2 || 0)} บาท, รวมเป็นเงิน {formatNumber(item.attAmount3 || 0)} บาท
              </span>)
            }
            if (item.attActionType1 == "2") {
              return (<span>
                เงินค่าเช่าเป็นรายปี {formatNumber(item.attAmount1 || 0)} บาท, จำนวน {item.attNumber1} ปี, เงินกินเปล่า {formatNumber(item.attAmount2 || 0)} บาท, รวมเป็นเงิน {formatNumber(item.attAmount3 || 0)} บาท
              </span>)
            }
            if (item.attActionType1 == "3") {
              return (<span>
                {item.attDetail1} ประมาณการค่าเช่าผันแปร {formatNumber(item.attAmount1 || 0)} บาท, เงินกินเปล่า {formatNumber(item.attAmount2 || 0)} บาท, รวมเป็นเงิน {formatNumber(item.attAmount3 || 0)} บาท
              </span>)
            }
            if (item.attActionType1 == "4") {
              return (<span>
                ค่าเช่าตลอดอายุสัญญาเช่า {formatNumber(item.attAmount1 || 0)} บาท, เงินกินเปล่า {formatNumber(item.attAmount2 || 0)} บาท, รวมเป็นเงิน {formatNumber(item.attAmount3 || 0)} บาท
              </span>)
            }
          }
        })}
      </span>)
    }
    if (transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode == "3") {
      return <span>
        <span>
          เช่าทรัพสินประเภท{transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.actionType == "1" ? "อสังหาริมทรัพย์" : "สังหาริมทรัพย์"},
        </span>
        <span>
          {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.arrayDetail.map((item) => {
            if (transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.actionType == "1") {
              if (item.attActionType1 == "1") {
                return <span>
                  ประเภท {item.attActionType2 == "6" ? item.attDetail5 : landPropertyTypeList.find((el) => el.value == item.attActionType2)?.label}, เลขที่ {item.attDetail1}, เลขที่ที่ดิน {item.attDetail6}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
                </span>
              }
              if (item.attActionType1 == "2") {
                return <span>
                  ประเภท {item.attActionType2 == "6" ? item.attDetail5 : buildingPropertyTypeList.find((el) => el.value == item.attActionType2)?.label}, เลขที่ {item.attDetail1}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
                </span>
              }
              if (item.attActionType1 == "3") {
                return <span>
                  {item.attDetail5} {item.attDetail1}, {item.attDetail2} {item.attDetail3} {item.attDetail4}
                </span>
              }
            } else if (transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.actionType == "2") {
              if (item.attActionType1 == "1") {
                return <span>
                  {movablePropertyTypeList.find((el) => el.value == item.attActionType1)?.label}, ยี่ห้อ {item.attDetail1}, รุ่น {item.attDetail2}{item.attDetail3 ? `, ${item.attDetail3}` : ""}, เลขที่เครื่องยนต์ {item.attDetail4}, เลขที่ตัวถัง {item.attDetail5}, สี {item.attDetail6}
                </span>
              }
              if (item.attActionType1 == "2") {
                return <span>
                  {movablePropertyTypeList.find((el) => el.value == item.attActionType1)?.label}, ยี่ห้อ {item.attDetail1}, รุ่น {item.attDetail2}, เลขทะเบียน {item.attDetail3}, เลขที่เครื่องยนต์ {item.attDetail4}, เลขที่ตัวถัง {item.attDetail5}, สี {item.attDetail6}
                </span>
              }
              if (item.attActionType1 == "3") {
                return <span>
                  {movablePropertyTypeList.find((el) => el.value == item.attActionType1)?.label}, ยี่ห้อ {item.attDetail1}, รุ่น {item.attDetail2}{item.attDetail3 ? `, ${item.attDetail3}` : ""}, เลขที่เครื่องยนต์ {item.attDetail4}, เลขที่ตัวถัง {item.attDetail5}, สี {item.attDetail6}
                </span>
              }
              if (item.attActionType1 == "4") {
                return <span>
                  {movablePropertyTypeList.find((el) => el.value == item.attActionType1)?.label}, ยี่ห้อ {item.attDetail1}, รุ่น {item.attDetail2}, เลขทะเบียน {item.attDetail3}, เลขที่เครื่องยนต์ {item.attDetail4}, เลขที่ตัวถัง {item.attDetail5}, สี {item.attDetail6}
                </span>
              }
              if (item.attActionType1 == "5") {
                return <span>
                  ชื่อประเภทสังหาริมทรัพย์ {item.attDetail6}, ประเภททรัพย์สิน {item.attDetail4}{item.attDetail1 ? `, ${item.attDetail1}` : ""}{item.attDetail2 ? `, รุ่น ${item.attDetail2}` : ""}{item.attDetail3 ? `, เลขทะเบียน ${item.attDetail3}` : ""}{item.attDetail5 ? `, อื่นๆ ${item.attDetail5}` : ""}
                </span>
              }
            }
          })}
        </span>
        <br />
        <span>
          ราคาทุนทรัพย์/ราคาเงินสด {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.amount || 0)} บาท, ดอกผลตามสัญญาเช่าซื้อ {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.amount1 || 0)} บาท, ค่างวดเช่าซื้อ {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.amount2 || 0)} บาท, จำนวนงวด {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.number || 0)} งวด
        </span>
      </span>
    }
    if (transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode == "4") {
      return <span>
        รับจ้างทำงาน {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.detail1}, จำนวนงวด {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.number || 0)}{transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.amount1 ? `, จำนวนเงินค้ำประกันตามสัญญา ${formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.amount1 || 0)}` : ""}
      </span>
    }
    if (transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode == "7") {
      return <span>
        การมอบอำนาจ {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.detail1} โดยมีเงื่อนไขคือ {conditionForPowerOfAttorneyList.find((el) => el.value == transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.actionType)?.label}
      </span>
    }
    if (transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode == "17") {
      return <span>
        เจ้าหนี้/ผู้ว่าจ้าง {(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.relateContract) ? transEtampDetail?.eform_data?.[0]?.instInfo[0]?.relateContract[0]?.name : "ไม่ระบุ"}, เงื่อนไขการค้ำประกัน {conditionForSecurityList.find((el) => el.value == transEtampDetail?.eform_data?.[0]?.instInfo[0]?.attachDetail?.actionType)?.label}
      </span>
    }
  }
  return (
    <div>
      <Modal
        open={isOpen}
        onCancel={onClose}
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
              {/* <Button
                type="text"
                className="w-24 text-theme btn py-4"
                onClick={onClose}
              >
                ยกเลิก
              </Button> */}
              <button className="btn-theme w-24" onClick={onConfirm}>
                ปิด
              </button>
            </div>
          </div>
        }
      >
        <div className="flex-col mb-20 rounded-xl border border-[#F0F6FF]">
          <div className="flex justify-between mb-4 bg-[#f0f6ff] px-4 py-2 rounded-t-xl">
            <span className="font-bold text-[#0153BD]">
              {transEtampDetail?.name || "ไม่ระบุ"}
            </span>
            <span>
              <span className="text-gray-500">เลขที่สัญญา :</span>{" "}
              {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.contractNo ||
                "ไม่ระบุ"}
            </span>
          </div>
          <div className="flex-col space-y-4 my-4 gap-4 px-6">
            <div className="flex justify-between">
              <span>
                <span className="text-gray-500">
                  หมายเลขอ้างอิงตราสารอิเล็กทรอนิกส์ :{" "}
                </span>
                {transEtampDetail?.eform_data?.[0]?.instInfo[0]?.party
                  ?.specifiedTaxRegistration?.id || "ไม่ระบุ"}
              </span>
              <span>
                <span className="text-gray-500">วันที่ : </span>
                {formatThaiDate(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.creationDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                <span className="text-gray-500">วันที่เริ่มต้นสัญญา : </span>
                {formatThaiDate(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.effectiveDate)}
              </span>
              <span>
                <span className="text-gray-500">
                  วันที่เริ่มสิ้นสุดสัญญา :{" "}
                </span>
                {formatThaiDate(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.expireDate)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">รายละเอียด : </span>
              {dataDetail() || "ไม่ระบุ"}
            </div>
            {transEtampDetail?.eform_data?.[0]?.documentDetail?.typeCode !== "7" && (<div>
              <span className="text-gray-500">มูลค่า : </span>
              {formatNumber(transEtampDetail?.eform_data?.[0]?.instInfo[0]?.instAmount || 0) ||
                "0"}
            </div>)}
            <div>
              <span className="text-gray-500">ข้อมูลคู่สัญญา :</span>
              {addressDetail || "ไม่ระบุ"}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
