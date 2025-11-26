import React, { useState } from "react";
import Image from "next/image";
import ProfileAvatar from "@/assets/webp/profile/profile_avatar.webp";
import CAUnCheckIcon from "@/assets/webp/profile/ca_uncheck.webp";
import CACheckIcon from "@/assets/webp/profile/ca_check.webp";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProfileSettingProps {
  profileLoading: "idle" | "pending" | "succeeded" | "failed";
  userProfile: any;
}

const ProfileSetting: React.FC<ProfileSettingProps> = ({
  profileLoading,
  userProfile,
}) => {
  const loading = profileLoading === "pending" || !userProfile;
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const { selectedBusinessId } = useSelector((state: RootState) => state.business);

  const imageSrc = userProfile?.avatar_base64 ? `data:image/png;base64,${userProfile.avatar_base64}` : ProfileAvatar;

  const Skeleton = ({ w }: { w: string }) => (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${w}`}></div>
  );

  const SkeletonLarge = ({ w }: { w: string }) => (
    <div className={`h-6 bg-gray-200 rounded animate-pulse ${w}`}></div>
  );

  // Helper function สำหรับแสดงข้อมูลบริษัท
  const renderBusinessInfo = (business: any, index: number) => (
    <div key={index} className="grid grid-cols-2 gap-4 gap-x-10 w-full border-t border-gray-100 pt-4">
      <div className="col-span-1">
        <p className="text-base font-normal text-[#989898]">ตำแหน่ง :</p>
      </div>
      <div className="col-span-1">
        <p className="text-base font-medium text-[#333333] break-words">
          {business?.role_list?.[0] || "-"}
        </p>
      </div>
      <div className="col-span-1">
        <p className="text-base font-normal text-[#989898]">บริษัท :</p>
      </div>
      <div className="col-span-1">
        <p className="text-base font-medium text-[#333333] break-words">
          {business?.name || "-"}
        </p>
      </div>
      <div className="col-span-1">
        <p className="text-base font-normal text-[#989898]">
          สถานะ CA เจ้าหน้าที่นิติบุคคล :
        </p>
      </div>
      <div className="col-span-1">
        <div className="flex items-center gap-2">
          {business?.has_ca ? (
            <>
              <Image
                src={CACheckIcon}
                alt="CA Check"
                width={16}
                height={16}
              />
              <p className="text-base font-medium text-theme">พบ CA</p>
            </>
          ) : (
            <>
              <Image
                src={CAUnCheckIcon}
                alt="CA Uncheck"
                width={16}
                height={16}
              />
              <p className="text-base font-normal text-[#C4C4C4]">
                ไม่พบ CA
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="profile-content p-6 bg-white text-medium rounded-2xl w-full shadow-theme">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-10">
        <div className="flex flex-col md:flex-row items-center gap-4 gap-x-10">
          <Image
            src={imageSrc}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full"
          />
          <div className="grid grid-cols-2 gap-4 gap-x-10 w-full">
            <div className="col-span-2">
              <div className="flex flex-col gap-1 text-theme">
                {loading ? (
                  <>
                    <SkeletonLarge w="w-32" />
                    <Skeleton w="w-24" />
                  </>
                ) : (
                  <p className="text-xl font-semibold break-words">
                    {userProfile?.account_title_th}
                    {userProfile?.first_name_th || "ไม่ทราบชื่อ"}{" "}
                    {userProfile?.last_name_th || "ผู้ใช้งาน"}
                  </p>
                )}
              </div>
            </div>
            <div className="col-span-1">
              <p className="text-base font-normal text-[#989898]">
                User Name :
              </p>
            </div>
            <div className="col-span-1">
              {loading ? (
                <Skeleton w="w-24" />
              ) : (
                <p className="text-base font-medium text-[#333333] break-words">
                  {userProfile?.username || "-"}
                </p>
              )}
            </div>
            <div className="col-span-1">
              <p className="text-base font-normal text-[#989898]">อีเมล :</p>
            </div>
            <div className="col-span-1">
              {loading ? (
                <Skeleton w="w-32" />
              ) : (
                <p className="text-base font-medium text-[#333333] break-words">
                  {userProfile?.email || "-"}
                </p>
              )}
            </div>
            <div className="col-span-1">
              <p className="text-base font-normal text-[#989898]">
                เลขบัตรประชาชน :
              </p>
            </div>
            <div className="col-span-1">
              {loading ? (
                <Skeleton w="w-32" />
              ) : (
                <p className="text-base font-medium text-[#333333] break-words">
                  {userProfile?.id_card || "-"}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 gap-x-10 w-full">
              <div className="col-span-1">
                <p className="text-base font-normal text-[#989898]">ตำแหน่ง :</p>
              </div>
              <div className="col-span-1">
                <Skeleton w="w-24" />
              </div>
              <div className="col-span-1">
                <p className="text-base font-normal text-[#989898]">บริษัท :</p>
              </div>
              <div className="col-span-1">
                <Skeleton w="w-24" />
              </div>
              <div className="col-span-1">
                <p className="text-base font-normal text-[#989898]">
                  สถานะ CA เจ้าหน้าที่นิติบุคคล :
                </p>
              </div>
              <div className="col-span-1">
                <Skeleton w="w-24" />
              </div>
            </div>
          ) : (
            <>
              {/* แสดงข้อมูลบริษัทแรก */}
              {userProfile?.business_list.length > 0 && renderBusinessInfo(userProfile.business_list.find((business: any) => business.id == selectedBusinessId), 0)}
              
              {/* แสดงข้อมูลบริษัทที่เหลือถ้า showAllBusinesses เป็น true */}
              {showAllBusinesses && userProfile?.business_list?.filter((business: any) => business.id != selectedBusinessId).map((business: any, index: number) => 
                renderBusinessInfo(business, index + 1)
              )}
              
              {/* ปุ่มเพิ่มเติม */}
              {userProfile?.business_list?.length > 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAllBusinesses(!showAllBusinesses)}
                    className="flex items-center gap-2 px-4 py-2 text-theme border border-theme rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium">
                      {showAllBusinesses ? 'ซ่อน' : 'เพิ่มเติม'}
                    </span>
                    {showAllBusinesses ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfileSetting;
