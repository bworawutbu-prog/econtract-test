"use client";

import { ChevronDown, ChevronLeft, FileTextIcon } from "lucide-react";
import { Collapse, Divider, Input, Modal, type CollapseProps } from "antd";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  getTransactionSlip,
  getDetailTransactionSlip,
  getQrCodeTransaction,
} from "@/store/backendStore/stampAPI";
import PromptpayIcon from "@/assets/image/icon/promptpay.webp";
import MobileBankingIcon from "@/assets/webp/mobile_bankings.webp";
import DetailIcon from "@/assets/webp/stamp/detail.webp";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store";
import type { AnyAction } from "@reduxjs/toolkit";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin, Alert } from "antd";
import { enqueueSnackbar } from "notistack";

// ✅ Dynamic imports สำหรับ Modals (lazy load เมื่อเปิด modal)
const QrCodeModal = dynamic(
  () => import("@/components/modal/modalQrcode").then(mod => ({ default: mod.QrCodeModal })),
  {
    loading: () => <Spin size="large" />,
    ssr: false,
  }
);

const PayinSlipModal = dynamic(
  () => import("@/components/modal/modalPayinSlip").then(mod => ({ default: mod.PayinSlipModal })),
  {
    loading: () => <Spin size="large" />,
    ssr: false,
  }
);
// 🎯 CENTRALIZED: Import types and functions from estampTypes.ts
import {
  TransactionData,
  DisplayDataItem,
  documentTypeOptions,
  getDocumentTypeLabel,
  getPartyRelationshipLabel,
  transformApiDataToDisplayData,
} from "@/store/types/estampTypes";
import { convertFormatDate } from "@/components/utils/convert";
function PaymentStampDuty() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isQrcodeModalVisible, setIsQrcodeModalVisible] =
    useState<boolean>(false);
  const [isPayinModalVisible, setIsPayinModalVisible] =
    useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payinUrl, setPayinUrl] = useState<string | null>(null);
  const [trxId, setTrxId] = useState<string | null>("");
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const [qrError, setQrError] = useState<boolean>(false);
  const [slipError, setSlipError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  useEffect(() => {
    const fetchData = async () => {
      const transaction_estamp_id = searchParams.get("transaction_estamp_id");
      setTrxId(transaction_estamp_id);
      if (!transaction_estamp_id) return;

      try {
        // เรียก detail transaction slip
        const estamp_transaction = await dispatch(
          getDetailTransactionSlip(transaction_estamp_id)
        ).unwrap();

        // เก็บข้อมูล transaction
        if (estamp_transaction.status && estamp_transaction.data) {
          setTransactionData(estamp_transaction.data);
        }
      } catch (error) {
        // enqueueSnackbar(`🎯 [Payment Stamp Duty] Error fetching data: ${error}`, {
        //   variant: "error",
        //   autoHideDuration: 3000,
        // });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (payinUrl) {
        URL.revokeObjectURL(payinUrl);
      }
    };
  }, [payinUrl]);

  const handleOpenPayinSlip = async () => {
    setPayinUrl(null);
    setSlipError(false);
    setIsPayinModalVisible(true);
    setLoading(true);

    try {
      const trxData = await dispatch(getTransactionSlip(trxId ?? "")).unwrap();

      if (trxData.success && trxData.blob) {
        const blobUrl = URL.createObjectURL(trxData.blob);
        setPayinUrl(blobUrl);
      } else {
        setTimeout(() => {
          setSlipError(true);
        }, 1000);
      }
    } catch (err) {
      // enqueueSnackbar(`🎯 [Payment Stamp Duty] Error fetching Slip: ${err}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      setSlipError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQrCode = async () => {
    setQrUrl(null);
    setQrError(false);
    setIsQrcodeModalVisible(true);
    setLoading(true);

    try {
      const qrData = await dispatch(getQrCodeTransaction(trxId ?? "")).unwrap();

      if (qrData.success && qrData.base64Url) {
        setQrUrl(qrData.base64Url);
      } else {
        setTimeout(() => {
          setQrError(true);
        }, 1000);
      }
    } catch (err) {
      // enqueueSnackbar(`🎯 [Payment Stamp Duty] Error fetching QR: ${err}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      setQrError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoading = () => {
    return (
      <Flex className="my-4" align="center" gap="middle">
        <Spin indicator={<LoadingOutlined spin />} />
        <p>กำลังโหลดข้อมูล...</p>
      </Flex>
    );
  };

  const handleError = () => {
    return (
      <Flex className="my-4" align="center" gap="middle">
        <span className="text-xl text-[#FF4D4F]">ไม่พบข้อมูล</span>
      </Flex>
    );
  };

  const handleDownload = () => {
    if (!qrUrl) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qrcode_${trxId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    if (!payinUrl) return;

    const link = document.createElement("a");
    link.href = payinUrl;
    link.download = "transaction.pdf"; // ชื่อไฟล์ตอน download
    document.body.appendChild(link);
    link.click();
    link.remove();

    // ถ้าเป็น Blob URL → revoke หลัง download
    if (payinUrl.startsWith("blob:")) {
      URL.revokeObjectURL(payinUrl);
    }
  };

  const renderCollapsePaymentItems = () => {
    const [isOuterExpanded, setIsOuterExpanded] = useState<boolean>(true);
    // 🎯 CENTRALIZED: Use the centralized transform function
    const displayData = transformApiDataToDisplayData(transactionData);

    const outerCollapseItem: CollapseProps["items"] = [
      {
        key: "payment-documents",
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold flex items-center gap-2">
                รายการเอกสาร{" "}
                <span className="text-[#FDB131] border border-[#FDB131] rounded-full px-2">
                  {displayData.length} ฉบับ
                </span>
              </h3>
            </div>
          </div>
        ),
        children: null, // No children in outer collapse
        className: "custom-collapse-panel",
      },
    ];

    return (
      <div className="payment-documents-container">
        {/* Outer Collapse - Single Item */}
        <div className="document-collapse-container flex flex-col gap-4">
          <Collapse
            bordered={false}
            className="document-collapse shadow-none border-0 rounded-lg [&_.ant-collapse-content-box]:!p-0 [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-header]:!items-center"
            expandIcon={({ isActive }) => (
              <ChevronDown
                className={`${isActive ? "rotate-180" : ""} text-theme`}
                size={24}
              />
            )}
            items={outerCollapseItem}
            activeKey={isOuterExpanded ? ["payment-documents"] : []}
            onChange={(keys) => {
              const key = Array.isArray(keys) ? keys[0] : keys;
              setIsOuterExpanded(!!key);
            }}
            style={{
              background: "transparent",
              marginBottom: "0px",
            }}
            expandIconPosition="start"
          />

          {/* Inner Content - All displayData items */}
          {isOuterExpanded && (
            <div className="document-collapse-content space-y-4">
              {displayData?.map((item, index) => (
                <div key={item.docId} className="inner-document-item">
                  <Collapse
                    bordered={false}
                    className="custom-inner-collapse-panel shadow-none rounded-lg [&_.ant-collapse-header]:!items-center"
                    expandIcon={({ isActive }) => (
                      <ChevronDown
                        className={`${
                          isActive ? "rotate-180" : ""
                        } bg-theme p-1 rounded-full`}
                        size={28}
                        color="white"
                      />
                    )}
                    items={[
                      {
                        key: `details-${item.docId}`,
                        label: (
                          <div className="flex justify-between gap-2 items-center w-full">
                            <p className="font-medium">{item.docName}</p>
                            <p className="text-sm text-gray-500">
                              <span className="text-[#989898]">
                                เลขที่สัญญา :{" "}
                              </span>
                              C-{item.docId}
                            </p>
                          </div>
                        ),
                        children: (
                          <div className="flex flex-col gap-3 p-3 bg-white rounded-lg">
                            {/* Ref ID */}
                            <div className="flex justify-between flex-wrap gap-4">
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  หมายเลขอ้างอิงตราสารอิเล็กทรอนิกส์ :
                                </label>
                                <span className="font-medium">
                                  {item.docRefId}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  วันที่ :
                                </label>
                                <span className="font-medium">
                                  {convertFormatDate(item.createDate)}
                                </span>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex justify-between flex-wrap gap-4">
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  วันที่เริ่มต้นสัญญา :
                                </label>
                                <span className="font-medium">
                                  {convertFormatDate(item.startDate)}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  วันที่สิ้นสุดสัญญา :
                                </label>
                                <span className="font-medium">
                                  {convertFormatDate(item.endDate)}
                                </span>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-8">
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  รายละเอียด :
                                </label>
                                <span className="font-medium">
                                  {item.docDetails}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-wrap gap-8">
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  มูลค่า :
                                </label>
                                <span className="font-medium">
                                  {item.docAmount.toLocaleString()}{" "}
                                  {item.docCurrency}
                                </span>
                              </div>
                            </div>

                            {/* Counterparty */}
                            <div className="flex flex-wrap gap-8">
                              <div className="flex gap-1">
                                <label className="text-sm text-[#989898]">
                                  ข้อมูลคู่สัญญา :
                                </label>
                                <span className="font-medium">
                                  {item.docCounterpartyInfo.name}{" "}
                                  {item.docCounterpartyInfo.address}
                                </span>
                              </div>
                            </div>
                          </div>
                        ),
                        style: {
                          background: "#F5F5F5",
                          borderRadius: "8px",
                          border: "none",
                        },
                      },
                    ]}
                    expandIconPosition="start"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPaymentMethod = () => {
    const [isPaymentMethodOuterExpanded, setIsPaymentMethodOuterExpanded] =
      useState<boolean>(true);

    const outerPaymentMethodCollapseItem: CollapseProps["items"] = [
      {
        key: "payment-method",
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">วิธีการชำระเงิน</h3>
            </div>
          </div>
        ),
        children: null, // No children in outer collapse
        className: "custom-collapse-panel",
      },
    ];

    return (
      <div className="payment-documents-container">
        {/* Outer Collapse - Single Item */}
        <div className="payment-method-collapse-container flex flex-col gap-4">
          <Collapse
            bordered={false}
            className="payment-method-collapse shadow-none border-0 rounded-lg [&_.ant-collapse-content-box]:!p-0 [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-header]:!items-center"
            expandIcon={({ isActive }) => (
              <ChevronDown
                className={`${isActive ? "rotate-180" : ""} text-theme`}
                size={24}
              />
            )}
            items={outerPaymentMethodCollapseItem}
            activeKey={isPaymentMethodOuterExpanded ? ["payment-method"] : []}
            onChange={(keys) => {
              const key = Array.isArray(keys) ? keys[0] : keys;
              setIsPaymentMethodOuterExpanded(!!key);
            }}
            style={{
              background: "transparent",
              marginBottom: "0px",
            }}
            expandIconPosition="start"
          />

          {isPaymentMethodOuterExpanded && (
            <div className="payment-method-container space-y-4">
              <div className="flex justify-between items-center gap-2 bg-[#FAFAFA] px-4 py-2 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={PromptpayIcon}
                    alt="Promptpay"
                    className="w-16 h-auto"
                  />
                  <h3 className="font-medium">ชำระด้วย PromptPay (QR Code)</h3>
                </div>
                <button
                  onClick={handleOpenQrCode}
                  className="text-sm text-theme text-center px-4 py-2 rounded-md"
                >
                  <span className="border-b border-gray-500">เปิด QR Code</span>
                </button>
                <QrCodeModal
                  imageUrl={qrUrl ?? ""}
                  transactionId={trxId ?? ""}
                  qrError={qrError}
                  open={isQrcodeModalVisible}
                  onClose={() => setIsQrcodeModalVisible(false)}
                />
                {/* <Modal
                  open={isQrcodeModalVisible}
                  onCancel={() => setIsQrcodeModalVisible(false)}
                  footer={null}
                  maskClosable={false}
                >
                  <div className="flex flex-col justify-center items-center">
                    <span className="text-xl font-[800] text-[#0153BD]">
                      ชำระด้วย PromptPay (QR Code)
                    </span>
                    { qrError ? (
                      handleError()
                    ) : qrUrl ? (
                      <img
                        className="my-2"
                        src={qrUrl}
                        alt="QR Code for payment"
                        width={180}
                        height={38}
                      />
                    ) : (
                      handleLoading()
                    )}

                    <div className="flex justify-center text-center text-[16px] font-[400] text-[#464646]">
                      ใช้ Mobile Banking ของธนาคารใดก็ได้ <br />
                      ในการสแกนชำระเงินค่าอากร
                    </div>
                    <button onClick={handleDownload} className="btn-theme mt-2">
                      <DownloadOutlined /> บันทึก Qrcode
                    </button>
                  </div>
                </Modal> */}

                {/* <Modal
                  open={isPayinModalVisible}
                  onCancel={() => setIsPayinModalVisible(false)}
                  footer={null}
                  maskClosable={false}
                  width={800}
                >
                  <div className="flex flex-col justify-center items-center m-4">
                    { slipError ? (
                      handleError()
                    ) : payinUrl ? (
                      <iframe
                        src={payinUrl}
                        width="100%"
                        height="750px"
                        style={{ border: "none" }}
                      />
                    ) : (
                      handleLoading()
                    )}
                    <button
                      onClick={handleDownloadPdf}
                      className="btn-theme mt-2"
                    >
                      <DownloadOutlined /> บันทึก Payin Slip (PDF)
                    </button>
                  </div>
                </Modal> */}
              </div>
              <div className="flex justify-between items-center gap-2 bg-[#FAFAFA] px-4 py-2 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={MobileBankingIcon}
                    alt="Payin Slip"
                    className="w-16 h-auto"
                  />
                  <h3 className="font-medium">ใบชำระอากรแสตมป์ (Payin Slip)</h3>
                </div>
                <button
                  onClick={handleOpenPayinSlip}
                  className="text-sm text-theme text-center px-4 py-2 rounded-md hover:text-gray-700"
                >
                  <span className="border-b border-gray-500">
                    เปิด Payin Slip
                  </span>
                </button>
                <PayinSlipModal
                  pdfUrl={payinUrl ?? undefined}
                  transactionId={trxId ?? ""}
                  open={isPayinModalVisible}
                  slipError={slipError}
                  onClose={() => setIsPayinModalVisible(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPaymentDetails = () => {
    if (!transactionData) {
      return (
        <div className="space-y-3 relative receipt-box pb-6">
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      );
    }

    const typeCode =
      transactionData.eform_data[0]?.documentDetail?.typeCode || "1";
    const documentTypeLabel = getDocumentTypeLabel(typeCode);
    const partyRelationshipLabel = getPartyRelationshipLabel(typeCode);

    return (
      <div className="space-y-3 relative receipt-box pb-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">ลักษณะตราสาร</label>
          <p>{documentTypeLabel}</p>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">
            ผู้ขอเสียอากรแสตมป์ ในฐานะ
          </label>
          <p>{partyRelationshipLabel}</p>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">ลำดับการยื่นแบบ</label>
          <p>ยื่นปกติ</p>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">
            จำนวนเงินค่าอากรแสตมป์
          </label>
          <p>{transactionData.payment_info.totalDuty.toLocaleString()} บาท</p>
        </div>

        <Divider variant="dashed" size="large" className="!my-5" />

        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">
            จำนวนเงินที่ต้องชำระทั้งสิ้น
          </label>
          <p className="font-bold text-theme">
            {transactionData.payment_info.totalAmount.toLocaleString()} บาท
          </p>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label className="text-sm text-[#989898]">
            ต้องชำระภายในวันที่
          </label>
          <p>{convertFormatDate(transactionData.payment_info.expireDate)}</p>
        </div>
        <button onClick={() => router.replace("/stamp/allForm")} className="btn-theme w-full !mt-8">ไปที่รายการทั้งหมด</button>
      </div>
    );
  };

  return (
    <main className="payment-stamp-duty mb-4">
      <style jsx global>{`
        .custom-collapse-panel .ant-collapse-header {
          align-items: center !important;
          background-color: #ffffff !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          border-bottom: 1px solid #e5e5e5 !important;
          padding: 0px 0px 12px 0px !important;
        }

        .custom-collapse-panel .ant-collapse-content,
        .custom-collapse-panel .ant-collapse-content-box {
          background-color: #ffffff !important;
          border-color: #e6f0ff !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }

        .custom-inner-collapse-panel .ant-collapse-header,
        .custom-inner-collapse-panel .and-collapse {
          align-items: center !important;
          background-color: #f0f6ff !important;
          border: 1px solid #f0f6ff !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          padding: 12px 16px !important;
        }

        .custom-inner-collapse-panel .ant-collapse-content,
        .custom-inner-collapse-panel .ant-collapse-content-box {
          background-color: #ffffff !important;
          border: 1px solid #f0f6ff !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }
      `}</style>

      <button
        className="text-theme text-lg font-bold flex items-center gap-2 mb-6"
        onClick={() => router.back()}
      >
        <ChevronLeft size={24} /> ยื่นแบบชำระเงินอากรแสตมป์
      </button>

      <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Image src={DetailIcon} alt="Detail" className="w-6 h-6" /> รายละเอียด
      </h1>

      <div className="grid lg:grid-cols-12 grid-cols-1 gap-8">
        <div className="lg:col-span-7 col-span-12">
          <div className="flex flex-col gap-2 px-6 py-4 bg-white rounded-2xl shadow-theme mb-6">
            {renderCollapsePaymentItems()}
          </div>
          <div className="flex flex-col gap-2 px-6 py-4 bg-white rounded-2xl shadow-theme">
            {renderPaymentMethod()}
          </div>
        </div>

        <div className="lg:col-span-5 col-span-12 flex flex-col h-fit gap-2 px-6 py-4 bg-white rounded-2xl shadow-theme">
          <h2 className="text-lg font-semibold pb-3 border-b border-gray-200 mb-6">
            รายละเอียดการยื่นแบบ
          </h2>
          {renderPaymentDetails()}
        </div>
      </div>
    </main>
  );
}

export default PaymentStampDuty;
