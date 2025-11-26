'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { signingThaidB2B } from '@/store/callbackStore/thaid';
import { useDispatch } from 'react-redux';
import { detectApiError } from '@/utils/errorHandler';
import { enqueueSnackbar } from 'notistack';


export default function ThaiIDSignSession() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const sharedToken = searchParams.get("sharedToken");
  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (!params.sessionId || hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;
    const signThaidB2B = async () => {
      setLoading(true);
      const result = await dispatch(signingThaidB2B({ sessionId: params.sessionId as string, sharedToken: sharedToken || "" }) as any);
      setLoading(false);
      const selectedBusinessId = localStorage.getItem("selectedBusiness");
      if (result.payload && result.payload.status === true) {
        // if (selectedBusinessId && selectedBusinessId !== "ทั้งหมด") {
        //   router.push(`/document/statusContract`);
        // } else {
        //   router.push(`/frontend`);
        // }
        const transactionId = result.payload.data.transaction_id;
        if (transactionId) {
          router.push(`/frontend/Mapping?documentId=${transactionId}`);
        } else {
          if (selectedBusinessId && selectedBusinessId !== "ทั้งหมด") {
            router.push(`/document/statusContract`);
          } else {
            router.push(`/frontend`);
          }
        }
      } else {
        const apiError = detectApiError(result.payload);
        if (apiError.errorType === 'network_error') {
          router.replace("/login");
        } else if (apiError.errorType === 'unauthorized') {
          router.replace("/login");
        } else {
          if (result.payload.status === 403) {
            enqueueSnackbar("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาลองใหม่อีกครั้ง", {
              variant: "error",
            });
          } else {
            enqueueSnackbar(result.payload.data.message, {
              variant: "error",
            });
          }
          if (selectedBusinessId && selectedBusinessId !== "ทั้งหมด") {
            router.push(`/document/statusContract`);
          } else {
            router.push(`/frontend`);
          }
        }
      }
    };
    signThaidB2B();
  }, [dispatch, params.sessionId, router, sharedToken]);
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Spin size="large" spinning={loading}/>
        <p className="text-lg font-medium">กรุณารอสักครู่...</p>
    </div>
  )
}