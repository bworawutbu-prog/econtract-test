"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, PencilLine } from "lucide-react";
import { Button, Input } from "antd";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { ErrorModal } from "@/components/modal/modalError";
import { SuccessModal } from "@/components/modal/modalSuccess";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import {
  setEmailNotify,
  deleteEmailNotify,
  getUserProfile,
} from "@/store/frontendStore/userProfile";
import { enqueueSnackbar } from "notistack";

interface EmailSettingProps {
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>;
  profileLoading: "idle" | "pending" | "succeeded" | "failed";
  userProfile: any;
}

const EmailSetting: React.FC<EmailSettingProps> = ({
  dispatch,
  profileLoading,
  userProfile,
}) => {
  // ✅ เพิ่ม state สำหรับ email notifications และ new email
  const [emailNotifications, setEmailNotifications] = useState<{
    [key: number]: boolean;
  }>({});
  const [newEmail, setNewEmail] = useState<string>("");
  const [allNotificationsOn, setAllNotificationsOn] = useState<boolean>(false);

  // ✅ เพิ่ม state สำหรับเก็บ email list ที่แก้ไขได้
  const [customEmailList, setCustomEmailList] = useState<string[]>([]);

  // ✅ เพิ่ม state สำหรับ debounce และ focus
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [debouncedEmail, setDebouncedEmail] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ เพิ่ม state สำหรับ loading ของแต่ละ email notification
  const [emailNotificationLoading, setEmailNotificationLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // ✅ เพิ่ม state สำหรับ loading ของการลบ email
  const [deleteEmailLoading, setDeleteEmailLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // ✅ เพิ่ม state สำหรับ loading ของการเพิ่ม email
  const [addEmailLoading, setAddEmailLoading] = useState<boolean>(false);

  // ✅ เพิ่ม state สำหรับ modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    email: string;
    index: number;
  }>({ open: false, email: "", index: -1 });
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  const [isFocusingEmail, setIsFocusingEmail] = useState<boolean>(false);

  // ✅ เพิ่มฟังก์ชันสำหรับ validate email format
  const validateEmail = (email: string): boolean => {
    if (!email && newEmail === customEmailList[0]) return true;
    // ตรวจสอบรูปแบบอีเมลพื้นฐาน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // ตรวจสอบว่าอีเมลมีเฉพาะตัวอักษรภาษาอังกฤษ, ตัวเลข, และอักขระพิเศษที่อนุญาตเท่านั้น
    const allowedCharsRegex = /^[a-zA-Z0-9.@_+-]+$/;
    return allowedCharsRegex.test(email);
  };

  // ✅ เพิ่มฟังก์ชันสำหรับตรวจสอบอีเมลซ้ำ
  const isEmailDuplicate = (email: string): boolean => {
    return customEmailList.some(
      (existingEmail) => existingEmail.toLowerCase() === email.toLowerCase()
    );
  };

  // ✅ เพิ่มฟังก์ชันสำหรับ debounce email input
  const handleEmailChange = (value: string) => {
    setNewEmail(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounce (500ms)
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedEmail(value.trim());
    }, 300);
  };

  // ✅ เพิ่มฟังก์ชันสำหรับ handle input focus/blur
  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  // ✅ เพิ่มฟังก์ชันสำหรับ validate allNotificationsOn
  const validateAllNotificationsOn = (notifications: {
    [key: number]: boolean;
  }) => {
    if (!customEmailList.length) return false;

    const totalEmails = customEmailList.length;
    const checkedEmails = Object.values(notifications).filter(Boolean).length;

    // ถ้าทุก email ถูก checked แล้ว ให้ allNotificationsOn เป็น true
    return checkedEmails === totalEmails;
  };

  // ✅ เพิ่มฟังก์ชันสำหรับตรวจสอบว่า email สามารถลบได้หรือไม่
  const canDeleteEmail = (email: string): boolean => {
    // ไม่สามารถลบ email ที่มี "@one.th" ได้
    return !email.includes("@one.th");
  };

  // ✅ เพิ่มฟังก์ชันสำหรับเปิด confirm modal สำหรับการลบ email
  const handleDeleteEmailClick = (emailToDelete: string, index: number) => {
    // ตรวจสอบว่า email สามารถลบได้หรือไม่
    if (!canDeleteEmail(emailToDelete)) {
      enqueueSnackbar(
        `🎯 [Email Setting] Cannot delete email with @one.th domain: ${emailToDelete}`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      setErrorModal({
        open: true,
        message: "ไม่สามารถลบอีเมลที่มีโดเมน @one.th ได้",
      });
      return;
    }

    // เปิด confirm modal
    setDeleteConfirmModal({
      open: true,
      email: emailToDelete,
      index: index,
    });
  };

  // ✅ เพิ่มฟังก์ชันสำหรับลบ email หลังจาก confirm
  const handleDeleteEmailConfirm = async () => {
    const { email: emailToDelete, index } = deleteConfirmModal;

    try {
      // ปิด confirm modal
      setDeleteConfirmModal({ open: false, email: "", index: -1 });
      setDeleteEmailLoading((prev) => ({ ...prev, [index]: true }));
      await dispatch(deleteEmailNotify(emailToDelete) as any);

      // ✅ ลบ email จาก local state และจัดเรียงใหม่
      const updatedEmailList = customEmailList.filter(
        (email) => email !== emailToDelete
      );

      // จัดเรียง email list ให้ email ที่มี "@one.th" อยู่ด้านบนสุด
      const sortedEmailList = updatedEmailList.sort((a, b) => {
        const aCanDelete = canDeleteEmail(a);
        const bCanDelete = canDeleteEmail(b);

        // ถ้า a ไม่สามารถลบได้ (มี @one.th) และ b สามารถลบได้ ให้ a อยู่ก่อน
        if (!aCanDelete && bCanDelete) return -1;
        // ถ้า a สามารถลบได้ และ b ไม่สามารถลบได้ ให้ b อยู่ก่อน
        if (aCanDelete && !bCanDelete) return 1;
        // ถ้าทั้งคู่สามารถลบได้หรือไม่สามารถลบได้ ให้เรียงตามตัวอักษร
        return a.localeCompare(b);
      });

      setCustomEmailList(sortedEmailList);

      // ✅ สร้าง notification state ใหม่ตาม sortedEmailList
      const newNotifications: { [key: number]: boolean } = {};
      sortedEmailList.forEach((email, newIndex) => {
        // หา index เดิมของ email 
        const oldIndex = Object.keys(emailNotifications).find(
          (key) => customEmailList[parseInt(key)] === email
        );
        if (oldIndex !== undefined) {
          newNotifications[newIndex] = emailNotifications[parseInt(oldIndex)];
        }
      });

      setEmailNotifications(newNotifications);

      // ✅ Validate และอัปเดต allNotificationsOn
      const shouldAllBeOn = validateAllNotificationsOn(newNotifications);
      setAllNotificationsOn(shouldAllBeOn);

      // ✅ Fetch updated user profile data
      await dispatch(getUserProfile() as any);

      // แสดง success modal
      setSuccessModal({
        open: true,
        message: `ลบอีเมล ${emailToDelete} สำเร็จ`,
      });
    } catch (error) {
      enqueueSnackbar(`🎯 [Email Setting] Failed to delete email: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });

      // แสดง error modal
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาดในการลบอีเมล กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      // Clear loading state
      setDeleteEmailLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // ✅ เพิ่มฟังก์ชันสำหรับยกเลิกการลบ email
  const handleDeleteEmailCancel = () => {
    setDeleteConfirmModal({ open: false, email: "", index: -1 });
  };

  // ✅ เพิ่มฟังก์ชันสำหรับจัดการ email notifications
  const handleEmailNotificationChange = async (
    index: number,
    checked: boolean
  ) => {
    try {
      // Set loading state for this specific email
      setEmailNotificationLoading((prev) => ({ ...prev, [index]: true }));

      // Get the email from customEmailList
      const email = customEmailList[index];
      if (!email) {
        enqueueSnackbar(
          `🎯 [Email Setting] Email not found at index: ${index}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        setEmailNotificationLoading((prev) => ({ ...prev, [index]: false }));
        return;
      }

      // Determine status based on checked value
      const status = checked ? "active" : "inactive";
      // Call API to update email notification
      await dispatch(setEmailNotify({ email, status }) as any);

      // Update local state only after successful API call
      const newNotifications = {
        ...emailNotifications,
        [index]: checked,
      };

      setEmailNotifications(newNotifications);

      // ✅ Validate และอัปเดต allNotificationsOn
      const shouldAllBeOn = validateAllNotificationsOn(newNotifications);
      setAllNotificationsOn(shouldAllBeOn);

      // ✅ Fetch updated user profile data
      await dispatch(getUserProfile() as any);
    } catch (error) {
      enqueueSnackbar(
        `🎯 [Email Setting] Failed to update email notification: ${error}`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      // Clear loading state
      setEmailNotificationLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleToggleAllOn = async (checked: boolean) => {
    try {
      // Set loading state for all email notifications
      const loadingState = customEmailList.reduce((acc, _, index) => {
        acc[index] = true;
        return acc;
      }, {} as { [key: number]: boolean });
      setEmailNotificationLoading(loadingState);

      // Update local state immediately for better UX
      setAllNotificationsOn(checked);
      const allOn = customEmailList.reduce((acc, _, index) => {
        acc[index] = checked;
        return acc;
      }, {} as { [key: number]: boolean });
      setEmailNotifications(allOn);

      // Loop through each email and send API request
      const status = checked ? "active" : "inactive";
      const promises = customEmailList?.map(async (email, index) => {
        try {
          await dispatch(setEmailNotify({ email, status }) as any);
        } catch (error) {
          enqueueSnackbar(
            `🎯 [Email Setting] Failed to update email notification ${
              index + 1
            }: ${error}`,
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
          // Revert the specific email notification state on error
          setEmailNotifications((prev) => ({
            ...prev,
            [index]: !checked,
          }));
          throw error; // Re-throw to be caught by the outer catch
        }
      });

      // Wait for all API calls to complete
      await Promise.all(promises);

      // ✅ Fetch updated user profile data
      await dispatch(getUserProfile() as any);
    } catch (error) {
      enqueueSnackbar(
        `🎯 [Email Setting] Failed to update some email notifications: ${error}`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      // Revert allNotificationsOn state on error
      setAllNotificationsOn(!checked);
    } finally {
      // Clear loading state for all email notifications
      const clearLoadingState = customEmailList.reduce((acc, _, index) => {
        acc[index] = false;
        return acc;
      }, {} as { [key: number]: boolean });
      setEmailNotificationLoading(clearLoadingState);
    }
  };

  const handleAddEmail = async () => {
    const trimmedEmail = debouncedEmail || newEmail.trim();

    if (customEmailList.length > 0 && customEmailList[0] === trimmedEmail) {
      setAddEmailLoading(false);
      setIsFocusingEmail(false);
      return;
    }
    if (
      trimmedEmail &&
      validateEmail(trimmedEmail) &&
      !isEmailDuplicate(trimmedEmail)
    ) {
      try {
        // Set loading state
        setAddEmailLoading(true);

        // Send API to add new email with status "inactive"
        await dispatch(
          // setEmailNotify({ email: trimmedEmail, status: "inactive" }) as any //old
          setEmailNotify({ email: trimmedEmail, status: "active" }) as any
        );

        // ✅ เพิ่ม email ใหม่และจัดเรียงให้ email ที่ไม่สามารถลบได้อยู่ด้านบนสุด
        const updatedEmailList = [...customEmailList, trimmedEmail];

        // จัดเรียง email list ให้ email ที่มี "@one.th" อยู่ด้านบนสุด
        const sortedEmailList = updatedEmailList.sort((a, b) => {
          const aCanDelete = canDeleteEmail(a);
          const bCanDelete = canDeleteEmail(b);

          // ถ้า a ไม่สามารถลบได้ (มี @one.th) และ b สามารถลบได้ ให้ a อยู่ก่อน
          if (!aCanDelete && bCanDelete) return -1;
          // ถ้า a สามารถลบได้ และ b ไม่สามารถลบได้ ให้ b อยู่ก่อน
          if (aCanDelete && !bCanDelete) return 1;
          // ถ้าทั้งคู่สามารถลบได้หรือไม่สามารถลบได้ ให้เรียงตามตัวอักษร
          return a.localeCompare(b);
        });

        setCustomEmailList(sortedEmailList);

        // ✅ สร้าง notification state ใหม่ตาม sortedEmailList
        const newNotifications: { [key: number]: boolean } = {};
        sortedEmailList.forEach((email, index) => {
          if (email === trimmedEmail) {
            // email ใหม่ default เป็น false
            newNotifications[index] = false;
          } else {
            // หา index เดิมของ email นี้
            const oldIndex = Object.keys(emailNotifications).find(
              (key) => customEmailList[parseInt(key)] === email
            );
            if (oldIndex !== undefined) {
              newNotifications[index] = emailNotifications[parseInt(oldIndex)];
            }
          }
        });

        setEmailNotifications(newNotifications);

        // ✅ Validate และอัปเดต allNotificationsOn
        const shouldAllBeOn = validateAllNotificationsOn(newNotifications);
        setAllNotificationsOn(shouldAllBeOn);

        // ✅ Clear input และ debounced value
        setNewEmail("");
        setDebouncedEmail("");

        // ✅ Fetch updated user profile data
        await dispatch(getUserProfile() as any);

        // แสดง success modal
        setSuccessModal({
          open: true,
          message: `เพิ่มอีเมล ${trimmedEmail} สำเร็จ`,
        });

        setIsFocusingEmail(false);
      } catch (error) {
        enqueueSnackbar(
          `🎯 [Email Setting] Failed to add new email: ${error}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );

        // แสดง error modal
        setErrorModal({
          open: true,
          message: "เกิดข้อผิดพลาดในการเพิ่มอีเมล กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        // Clear loading state
        setAddEmailLoading(false);
      }
    } else {
      if (!trimmedEmail) {
        enqueueSnackbar(`🎯 [Email Setting] Email is empty`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      } else if (!validateEmail(trimmedEmail)) {
        enqueueSnackbar(
          `🎯 [Email Setting] Invalid email format: ${trimmedEmail}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
      } else if (isEmailDuplicate(trimmedEmail)) {
        enqueueSnackbar(
          `🎯 [Email Setting] Email already exists: ${trimmedEmail}`,
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
      }
    }
  };

  // ✅ Initialize email notifications when userProfile loads
  useEffect(() => {
    if (userProfile?.notify_email) {
      // ✅ ใช้ customEmailList แทน userProfile.email และจัดเรียงให้ email ที่ไม่สามารถลบได้อยู่ด้านบนสุด
      const emailList = userProfile?.notify_email?.map((item: any) => item.email);

      // จัดเรียง email list ให้ email ที่มี "@one.th" อยู่ด้านบนสุด
      // const sortedEmailList = emailList?.sort((a: string, b: string) => {
      //   const aCanDelete = canDeleteEmail(a);
      //   const bCanDelete = canDeleteEmail(b);

      //   // ถ้า a ไม่สามารถลบได้ (มี @one.th) และ b สามารถลบได้ ให้ a อยู่ก่อน
      //   if (!aCanDelete && bCanDelete) return -1;
      //   // ถ้า a สามารถลบได้ และ b ไม่สามารถลบได้ ให้ b อยู่ก่อน
      //   if (aCanDelete && !bCanDelete) return 1;
      //   // ถ้าทั้งคู่สามารถลบได้หรือไม่สามารถลบได้ ให้เรียงตามตัวอักษร
      //   return a.localeCompare(b);
      // });
      const sortedEmailList = emailList;

      console.log('sortedEmailList =>',sortedEmailList)
      setCustomEmailList(sortedEmailList);

      // setNewEmail(sortedEmailList.length > 0 ? sortedEmailList[0] : "");
      setNewEmail(sortedEmailList.length > 0 ? sortedEmailList[sortedEmailList.length - 1] : "");

      // ✅ สร้าง initial notifications จาก sortedEmailList
      const initialNotifications: { [key: number]: boolean } = {};
      sortedEmailList.forEach((email: any, index: any) => {
        // หา status จาก notify_email array
        const notifyItem = userProfile.notify_email?.find(
          (item: any) => item.email === email
        );
        if (notifyItem) {
          initialNotifications[index] = notifyItem.status === "active" || false;
        } else {
          enqueueSnackbar(
            `🎯 [Email Setting] Email not found in notify_email array: ${email}`,
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
          initialNotifications[index] = false;
        }
      });

      setEmailNotifications(initialNotifications);

      // ✅ Set all notifications state based on validation
      const shouldAllBeOn = validateAllNotificationsOn(initialNotifications);
      setAllNotificationsOn(shouldAllBeOn);
    }
  }, [userProfile]);

  // ✅ เพิ่ม useEffect เพื่อ validate allNotificationsOn เมื่อ emailNotifications เปลี่ยน
  useEffect(() => {

    const shouldAllBeOn = validateAllNotificationsOn(emailNotifications);
    if (shouldAllBeOn !== allNotificationsOn) {
      setAllNotificationsOn(shouldAllBeOn);
    }
  }, [emailNotifications, allNotificationsOn]);

  // ✅ เพิ่ม useEffect เพื่อ cleanup timeout เมื่อ component unmount
  useEffect(() => {

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="profile-content p-6 bg-white text-medium rounded-2xl w-full shadow-theme">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[18px] font-semibold flex items-center gap-2 mb-6">
          แจ้งเตือนอีเมล
        </h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <label className="text-[#333333] text-base block mb-1">Email :</label>
          <Input
            placeholder="เพิ่มอีเมลใหม่"
            value={newEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="flex-1 py-2 rounded-xl"
            onPressEnter={handleAddEmail}
            disabled={addEmailLoading || !isFocusingEmail}
            status={
              debouncedEmail &&
              (!validateEmail(debouncedEmail) ||
                isEmailDuplicate(debouncedEmail))
                ? "error"
                : undefined
            }
          />
          <div className="p-10">
            {isFocusingEmail ? (
              <Button
                className="text-theme"
                onClick={handleAddEmail}
                icon={
                  addEmailLoading ? (
                    <LoaderCircle
                      className="animate-spin"
                      style={{ fontSize: 24, color: "#0153BD" }}
                    />
                  ) : (
                    <Check size={24} />
                  )
                }
                type="link"
                disabled={!validateEmail(debouncedEmail) || addEmailLoading}
              />
            ) : (
              <Button
                className="text-theme"
                onClick={() => setIsFocusingEmail(true)}
                icon={<PencilLine size={24} />}
                type="link"
              />
            )}
          </div>
        </div>
        {isInputFocused && debouncedEmail && (
          <>
            {!debouncedEmail && (
              <p className="text-red-500 text-sm">กรุณากรอกอีเมล</p>
            )}
            {debouncedEmail && !validateEmail(debouncedEmail) && (
              <p className="text-red-500 text-sm">รูปแบบอีเมลไม่ถูกต้อง</p>
            )}
            {debouncedEmail && isEmailDuplicate(debouncedEmail) && (
              <p className="text-red-500 text-sm">อีเมลนี้มีอยู่ในระบบแล้ว</p>
            )}
          </>
        )}
      </div>

      {/* Delete Email Confirm Modal */}
      <ConfirmModal
        open={deleteConfirmModal.open}
        titleName="ยืนยันการลบอีเมล"
        message={`คุณแน่ใจหรือไม่ที่จะลบอีเมล "${deleteConfirmModal.email}"?`}
        onConfirm={handleDeleteEmailConfirm}
        onCancel={handleDeleteEmailCancel}
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModal.open}
        titleName="สำเร็จ"
        message={successModal.message}
        onClose={() => setSuccessModal({ open: false, message: "" })}
      />

      {/* Error Modal */}
      <ErrorModal
        open={errorModal.open}
        titleName="เกิดข้อผิดพลาด"
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
    </section>
  );
};

export default EmailSetting;
