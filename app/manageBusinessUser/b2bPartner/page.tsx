"use client";

import SearchInput from "@/components/ui/searchInput";
import { Tag, Space, Button, Dropdown, MenuProps, Input, Select } from "antd";
import React, { useEffect, useState, useRef } from "react";
import HeaderTitleLogo from "@/assets/webp/manageBusinessUser/b2b.webp";
import Image from "next/image";
import { BusinessB2BPartner } from "@/store/types/BusinessB2BPartnerType";
import { getListBusinessB2BPartner } from "@/store/backendStore/manageBuinessUserAPI";
import { enqueueSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import SearchBusiness from "@/assets/webp/search-business.webp";
import TableComponent from "@/components/ui/table";
import { BadgeCheck, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { getRedirectBusiness } from "@/store/manageBizUserStore/api";
import { EllipsisVertical } from "lucide-react";
import B2BPartnerDetailModal from "@/components/modal/modalB2BPartnerDetail";
import CancelB2BPartnerModal from "@/components/modal/modalCancelB2BPartner";
import CollaborationAgreementModal from "@/components/modal/modalCollaborationAgreement";
import { BusinessContactType, CreateGroupPayload, GroupResponseType, SearchBusinessResponseType, UpdateGroupPayload } from "@/store/types/groupType";
import { getGroup, createGroup, updateGroup, deleteGroup, searchBusinessById } from "@/store/backendStore/groupAPI";
import ModalComponent from "@/components/modal/modal";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { sentEmailAPI } from "@/store/backendStore/sentEmailAPI";
import TextEditorComponent from "@/components/ui/textEditor";
import { getAllFormObjects } from "@/components/mappingComponents/FormUtils/pdfFormManager";
import { SearchOutlined } from "@ant-design/icons"

export default function Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [b2bPartnerList, setB2bPartnerList] = useState<BusinessB2BPartner[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [isOpenCollaborationModal, setIsOpenCollaborationModal] =
    useState(false);
  const [isOpenCancelModal, setIsOpenCancelModal] = useState(false);
  const [selectedB2BPartner, setSelectedB2BPartner] =
    useState<BusinessB2BPartner | null>(null);
  const dispatch = useDispatch();
  const { selectedBusinessId } = useSelector(
    (state: RootState) => state.business
  );
  const filteredItems = b2bPartnerList.filter((item) => {
    return item.partner_name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const dash = (v?: string) => v?.trim() || "-";

  useEffect(() => {
    getGroupList(page, pageSize);
  }, [page, pageSize, selectedBusinessId]);

  const getGroupList = async (p = page, ps = pageSize) => {
    if (loading) return;
    setLoading(true);
    try {
      const businessId = selectedBusinessId || "";
      const response = await dispatch(
        getListBusinessB2BPartner({ page: p, size: ps, businessId }) as any
      );
      if (response.payload.data && response.payload.data.length > 0) {
        setTotalCount(response.payload.totalData);
        setLoading(false);
        setB2bPartnerList(response.payload.data);
      }
    } catch (error: any) {
      enqueueSnackbar(`Failed to get group list: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      setLoading(false);
    }
  };

  const getURLRedirectBiz = async () => {
    const response = await dispatch(getRedirectBusiness() as any).unwrap();
    window.location.href = response.data.url;
    if (response) {
      window.location.href = response.data.url;
    } else {
      enqueueSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  const getDropdownItems = (record: BusinessB2BPartner): MenuProps["items"] => [
    {
      key: "manage",
      label: "จัดการ",
    },
    {
      key: "detail",
      label: "รายละเอียด",
    },
  ];

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "key",
      key: "key",
      width: "10%",
      render: (text: string, record: any, index: number) =>
        (page - 1) * pageSize + (index + 1),
    },
    {
      title: "รายชื่อคู่สัญญา",
      key: "partner_name",
      dataIndex: "partner_name",
      width: "33%",
    },
    {
      title: <div style={{ textAlign: "center" }}>Tax ID</div>,
      key: "tax_id",
      dataIndex: "tax_id",
      width: "12%",
      align: "center" as const,
    },
    {
      title: <div style={{ textAlign: "center" }}>สถานะการยืนยันตัวตน</div>,
      key: "is_verified",
      dataIndex: "is_verified",
      width: "14%",
      align: "center" as const,
      render: (value: boolean) =>
        value ? (
          <span className="rounded-full bg-[#EAF8EF] py-1 px-3 text-[#00C45A]">
            ยืนยันแล้ว
          </span>
        ) : (
          <span className="rounded-full bg-[#FFF4EB] py-1 px-3 text-[#FC9240]">
            รอยืนยัน
          </span>
        ),
    },
    {
      title: <div style={{ textAlign: "center" }}>สถานะ CA (นิติบุคคล)</div>,
      key: "has_ca",
      dataIndex: "has_ca",
      width: 160,
      align: "center" as const,
      onCell: () => ({ style: { minWidth: 160 } }),
      render: (value: boolean) =>
        value ? (
          <span className="flex items-center justify-center  gap-2 text-[#0153BD]">
            <BadgeCheck className="w-5 h-5" />
            พบ CA
          </span>
        ) : (
          <span className="flex items-center justify-center  gap-2 text-[#C4C4C4]">
            <BadgeCheck className="w-5 h-5" />
            ไม่พบ CA
          </span>
        ),
    },
    {
      title: <div style={{ textAlign: "center" }}>จำนวนสัญญาที่ทำร่วมกัน</div>,
      key: "contracts_count",
      dataIndex: "contracts_count",
      width: "16%",
      align: "center" as const,
      render: (value: number, record: BusinessB2BPartner) =>
        value > 0 ? (
          <span
            className="cursor-pointer underline text-[#367AF7] hover:text-[#0153BD]"
            onClick={() => {
              setSelectedB2BPartner(record);
              setIsOpenCollaborationModal(true);
            }}
          >
            {value}
          </span>
        ) : (
          <span>{value}</span>
        ),
    },
    {
      title: <div style={{ textAlign: "center" }}>เพิ่มเติม</div>,
      key: "caStatus",
      dataIndex: "caStatus",
      width: 80,
      align: "center" as const,
      onCell: () => ({ style: { minWidth: 80 } }),
      render: (text: string, record: BusinessB2BPartner) => (
        <Dropdown
          menu={{
            items: getDropdownItems(record),
            onClick: ({ key }) => {
              if (key === "manage") {
                setSelectedB2BPartner(record);
                setIsOpenCancelModal(true);
              } else if (key === "detail") {
                setSelectedB2BPartner(record);
                setIsOpenDetailModal(true);
              }
            },
          }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="min-w-[180px]"
        >
          <Button
            type="text"
            title="จัดการ"
            className="border border-[#FAFAFA] hover:border-theme rounded-xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <EllipsisVertical size={18} color="#0153BD" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Image
            src={HeaderTitleLogo}
            height={0}
            width={0}
            alt="Title Logo"
            className="w-8 h-8"
          />
          <h1 className="text-3xl font-extrabold">คู่สัญญา B2B</h1>
        </div>
        <div>
          <ModalCreatePartner updateGroupList={getGroupList} />
        </div>
      </div>
      <div className="w-[280px] mb-5">
        <SearchInput
          placeholder="ค้นหา"
          className="w-72 min-w-full"
          value={searchQuery}
          onChange={setSearchQuery}
          // onSearch={handleSearch}
          debounceMs={700}
        />
      </div>
      {filteredItems.length == 0 && searchQuery ? (
        <div>
          <div className="mb-3">
            <span>ประเภทธุรกิจทั้งหมด 0 รายการ</span>
          </div>
          <div
            className="min-h-[calc(100vh-15rem)] flex justify-center items-center bg-white rounded-xl"
            style={{
              boxShadow: "0px 0px 4px 0px #60617029, 0px 0px 1px 0px #28293D0A",
            }}
          >
            <div className="flex flex-col justify-center items-center gap-2">
              <Image
                src={SearchBusiness}
                alt="Search Business"
                width={100}
                height={100}
              />
              <span>ไม่พบผลลัพธ์</span>
              <span>
                ผลการค้นหา <strong>"{searchQuery}"</strong> ไม่มีในระบบ
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                }}
                className="mt-3 text-theme underline hover:text-[#0153BD] transition bg-transparent border-none p-0"
              >
                กลับไปค่าเริ่มต้น
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAFAFA] rounded-2xl p-5 relative">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="font-semibold text-base pr-2">
                คู่สัญญาทั้งหมด
              </span>
              <Tag
                bordered={false}
                style={{
                  backgroundColor: "white",
                  borderRadius: "99px",
                  boxShadow: "0px 0px 2px 0px #FDB1311F",
                }}
              >
                <span className="text-[#FDB131] text-base font-semibold">
                  {totalCount} รายการ
                </span>
              </Tag>
            </div>
          </div>
          <TableComponent
            columns={columns}
            dataSource={filteredItems?.map((item) => ({
              ...item,
            }))}
            loading={loading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: false,
              onChange: (p, ps) => {
                if (ps !== pageSize) {
                  setPage(1);
                  setPageSize(ps);
                } else {
                  setPage(p);
                }
              },
            }}
          />
        </div>
      )}
      <B2BPartnerDetailModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        co_contract_id={selectedB2BPartner?.tax_id || ""}
      />
      <CancelB2BPartnerModal
        isOpen={isOpenCancelModal}
        onClose={() => setIsOpenCancelModal(false)}
        co_contract_id={selectedB2BPartner?.tax_id || ""}
      />
      <CollaborationAgreementModal
        isOpen={isOpenCollaborationModal}
        onClose={() => setIsOpenCollaborationModal(false)}
        co_contract_id={selectedB2BPartner?.tax_id || ""}
      />
    </>
  );
}

interface ModalCreatePartnerProps {
  updateGroupList?: () => void;
}

const companies = [
  { name: "บริษัท เอ บี ซี จำกัด", tax_id: "0105551000011" },
  { name: "บริษัท ดี อี เอฟ จำกัด", tax_id: "0105551000029" },
  { name: "บริษัท จี เอช ไอ จำกัด", tax_id: "0105551000037" },
];

export const ModalCreatePartner: React.FC<ModalCreatePartnerProps> = ({
  updateGroupList,
}) => {
  const dispatch = useDispatch();
  const [newGroupName, setNewGroupName] = useState("");
  const [searchBusiness, setSearchBusiness] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<SearchBusinessResponseType[]>([]);
  const [isOpenSearchFailed, setIsOpenSearchFailed] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [isTaxFound, setIsTaxFound] = useState(false);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const createNewGroup = async (payload: CreateGroupPayload) => {
    try {
      const response = await dispatch(createGroup(payload) as any);
      if (response.payload) {
        updateGroupList?.();
      }
      return response;
    } catch (error) {
      enqueueSnackbar(`Failed to create group: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  }

  const handleAddNewGroup = async (): Promise<boolean> => {
    const groupName = newGroupName.trim()
    if (groupName.includes("กลุ่ม")) {
      setNewGroupName(groupName.replace("กลุ่ม", ""))
    }
    const businessContact = selectedBusiness.map((business, businessIndex) => {
      return {
        index: businessIndex,
        business_id: business.business_id
      }
    })
    const payload: CreateGroupPayload = {
      name: newGroupName,
      business_contact: businessContact as BusinessContactType[]
    }
    try {
      const response = await createNewGroup(payload);
      if (response.payload) {
        setNewGroupName("");
        setSelectedBusiness([]);
        setSearchBusiness("");
        setIsOpenSearchFailed(false);
        return true;
      } else {
        setNewGroupName("");
        setSelectedBusiness([]);
        setSearchBusiness("");
        setIsOpenSearchFailed(false);
        return false;
      }

    } catch (error) {
      enqueueSnackbar(`Failed to add group: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
  };

  const handleCompanySelect = (value: string) => {
    setCompanyName(value);

    if (!value) {
      setTaxId("");
      setIsTaxFound(false);
      setIsOpenSearchFailed(false);
      setSearchBusiness("");
      return;
    }

    const found = companies.find((c) => c.name === value);
    if (found) {
      setTaxId(found.tax_id);
      setIsTaxFound(true);
      setSearchBusiness("");
    } else {
      setTaxId("");
      setIsTaxFound(false);
      setSearchBusiness(value);
    }
  };

  const handleTaxIdSelect = (value: string) => {
    setTaxId(value);

    const found = companies.find((c) => c.tax_id === value);

    if (found) {
      setIsTaxFound(true);
      setIsOpenSearchFailed(false);
      setSearchBusiness("");
    } else {
      setIsTaxFound(false);
      setIsOpenSearchFailed(true);
      setSearchBusiness(value);
    }
  };

  const resetSearchState = () => {
    setCompanyName("");
    setTaxId("");
    setIsOpenSearchFailed(false);
    setSearchBusiness("");
    setIsTaxFound(false);
  };

  const resetSearchFlags = () => {
    setIsOpenSearchFailed(false);
    setSearchBusiness("");
    setIsTaxFound?.(false);
  };

  return (
    <ModalComponent
      btnName="เพิ่มคู่สัญญา"
      triggerBtnClassName="btn-theme"
      titleName="ค้นหาคู่สัญญา"
      onConfirm={
        handleAddNewGroup
      }
      isDisabled={
        !isTaxFound}
      btnConfirm="บันทึก"
      modalType="createB2B"
      onAfterClose
      ={resetSearchState}
    >
      <div className="mb-4">
        <label className="mb-2">ชื่อบริษัท</label>
        <Input
          placeholder="ระบุ"
          value={companyName}
          onChange={(e) => {
            const val = e.target.value;
            setCompanyName(val);
            if (!val) {
              resetSearchFlags();
            }
          }}
          onPressEnter={(e) => handleCompanySelect(e.currentTarget.value)}
          suffix={<SearchOutlined onClick={() => handleCompanySelect(companyName)} />}
          allowClear
        />
      </div>
      <div className="mb-4">
        <label className="mb-2">Tax ID</label>
        <Input
          placeholder="ระบุ"
          value={taxId}
          onChange={(e) => {
            const val = e.target.value;
            setTaxId(val);
            if (!val) {
              resetSearchFlags();
            }
          }}
          onPressEnter={(e) => handleTaxIdSelect(e.currentTarget.value)}
          suffix={
            <SearchOutlined onClick={() => handleTaxIdSelect(taxId)} />
          }
          allowClear
        />
        {taxId && taxId.length > 0 && taxId.length < 3 && (
          <p className="text-xs text-gray-500 mt-1">
            พิมพ์อย่างน้อย 3 ตัวอักษรเพื่อค้นหา
          </p>
        )}
      </div>
      {isOpenSearchFailed && (
        <div className="flex flex-col justify-center items-center">
          <Image src={SearchBusiness} alt="Search Business" width={100} height={100} />
          <span>ผลการค้นหา "{searchBusiness}" ไม่พบข้อมูล</span>
          <SendEmailModal />
        </div>
      )}
    </ModalComponent>
  )
}

export const SendEmailModal = () => {
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState<string[]>([]);
  const [emailToInput, setEmailToInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailToError, setEmailToError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    const value = (email || '').trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(value);
  };

  const sendEmail = async ({ to, subject, content }: { to: string[], subject: string, content: string }): Promise<boolean> => {
    const response = await dispatch(sentEmailAPI({
      to: to,
      subject: subject,
      html: content
    }) as any);
    return response.payload;
  }

  const handleSendEmail = async (): Promise<boolean> => {
    const response = await sendEmail({ to: emailTo, subject: emailSubject, content: emailContent });
    return response;
  }

  const plain = (html: string) => html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

  const isInviteReady =
    emailTo.length > 0 &&
    emailSubject.trim().length > 0 &&
    plain(emailContent || "").length > 0;

  return (
    <ModalComponent
      titleName="ส่งข้อมูลลงทะเบียน"
      btnName="เชิญลงทะเบียน"
      onConfirm={handleSendEmail}
      triggerBtnClassName="text-theme border-b border-theme text-sm sm:text-base"
      modalType="invite"
      modalClassName="95vw"
      modalWidth={800}
      isDisabled={!isInviteReady}
    >
      <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-0">
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">ถึง</label>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="ระบุอีเมล"
            prefix={<Mail size={16} color="#C4C4C4" className="mr-1" />}
            value={emailTo}
            searchValue={emailToInput}
            open={false}
            filterOption={false}
            options={[]}
            onChange={(value) => {
              const newValues = Array.isArray(value) ? value : [];
              const newlyAdded = newValues.filter(v => !emailTo.includes(v));
              const invalids = newlyAdded.filter(v => !isValidEmail(v));
              if (invalids.length > 0) {
                const cleaned = newValues.filter(v => !invalids.includes(v));
                setEmailTo(cleaned);
                setEmailToInput("");
                setEmailToError(`อีเมลไม่ถูกต้อง: ${invalids.join(', ')}`);
              } else {
                setEmailTo(newValues);
                setEmailToInput("");
                setEmailToError(null);
              }
            }}
            onSearch={(value) => {
              setEmailToInput(value)
            }}
            onInputKeyDown={(e) => {
              if ((e as any).key === 'Enter' && emailToInput.trim()) {
                if (!isValidEmail(emailToInput.trim())) {
                  e.preventDefault();
                  setEmailToError('รูปแบบอีเมลไม่ถูกต้อง');
                } else {
                  setEmailToError(null);
                }
              }
            }}
          />
          {emailToError && (
            <span className="text-xs text-red-500">{emailToError}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">เรื่อง</label>
          <Input
            placeholder="ระบุเรื่อง"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">รายละเอียด</label>
          <div className="w-full overflow-hidden">
            <TextEditorComponent onChange={setEmailContent} />
          </div>
        </div>
      </div>
    </ModalComponent>
  )
}
