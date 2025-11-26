"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppDispatch, useAppDispatch } from "@/store/index";
import { useDispatch } from "react-redux";
import { useRef } from "react";
import { UpdateTransactions } from "@/store/frontendStore/transactionAPI";
import { payloadUpdateTransaction } from "@/store/types/mappingTypes";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { ErrorModal } from "@/components/modal/modalError";
import { enqueueSnackbar } from "notistack";
export default function Recall() {
  // const dispatch = useAppDispatch(); 
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const router = useRouter();
  const hasRun = useRef(false);
  const [payloadTemp, setPayloadTemp] = useState<payloadUpdateTransaction>();
  const [isProcessing, setIsProcessing] = useState(true); // fake loading
  const [progress, setProgress] = useState(0); // fake loading
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const settingPayload = async (): Promise<payloadUpdateTransaction | null> => {
    
    const stored = sessionStorage.getItem("pendingTransactionPayload");
    if (stored) {
      try {
        const payload_done: payloadUpdateTransaction = JSON.parse(stored);
        setPayloadTemp(payload_done);
        return payload_done;
      } catch (error) {
        enqueueSnackbar(`🎯 [Recall Transaction] Failed to parse payload: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        sessionStorage.removeItem("pendingTransactionPayload");
      }
    }
    return null;
  };

  const settingRecall = async (payload: payloadUpdateTransaction) => {
    setIsProcessing(true);
    setProgress(0);
    // Simulate progress every 300ms
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 95)); // stop at 95 until done
    }, 300);

    try {
      const response = await dispatch(UpdateTransactions(payload)).unwrap();
      clearInterval(progressInterval);
      setProgress(100); // done
      setTimeout(() => setIsProcessing(false), 300); // give user a moment
      const recall_docid = response.transaction._id;
      // 
      // call change route
      if (response.status) {
        
        router.replace(`/frontend/Mapping?documentId=${recall_docid}`);
        // router.replace(`/frontend/Mapping?documentId=${transaction_id}`);
        sessionStorage.removeItem("pendingTransactionPayload");
      } else {
        enqueueSnackbar(`🎯 [Recall Transaction] Response Return Failed: ${(response && response.message) || ""}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
      // sessionStorage.removeItem("pendingTransactionPayload");
    } catch (error) {
      clearInterval(progressInterval);
      enqueueSnackbar(`🎯 [Recall Transaction] Retry failed: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      setProgress(100);
      setTimeout(() => setIsProcessing(false), 500);
      // Show error UI if needed
    }
  };

  const showErrorModal = () => {
    setErrorModalOpen(true);
  };

  useEffect(() => {
    if (hasRun.current) return; // 👈 Prevent re-entry
    hasRun.current = true;
    // const stored = sessionStorage.getItem("pendingTransactionPayload");
    
    processAuth();
  }, []);
  const processAuth = async () => {
    
    
    
    if (window.location.href) {
      const params = new URLSearchParams(window.location.search);
      
      const paramObject = Object.fromEntries(params.entries());
      
      // const formdata_id = params.get("formdata_id");
      // const session_id = params.get("session_id");
      const formdata_id =
        params.get("formdata_id") ||
        "Failed To get FormData_id check value recive or blame backend";
      const session_id =
        params.get("session_id") ||
        "Failed To get session_id check value recive or blame backend";
      
      if (formdata_id && session_id) {
        sessionStorage.setItem("session_id", session_id);
        sessionStorage.setItem("formdata_id", formdata_id);
        sessionStorage.setItem("guest_ready", "true");

        const payload = await settingPayload();
        if (payload) {
          await settingRecall(payload); // 👈 async call
        } else {
          showErrorModal();
          enqueueSnackbar(`🎯 [Recall Transaction] No valid payload found for retry.`, {
            variant: "warning",
            autoHideDuration: 3000,
          });
        }
      }

      setFormdata_id(formdata_id || "");
      setSession_id(session_id || "");
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [formdata_id, setFormdata_id] = useState("");
  const [session_id, setSession_id] = useState("");

  // interface LoadingBotProps {
  //   message?: string;
  // }

  // const LoadingBot: React.FC<LoadingBotProps> = ({
  //   message = "กำลังโหลดข้อมูล...",
  // }) => {
  //   return (
  //     <div className="botContainer">
  //       <div className="bot">
  //         <div className="eye"></div>
  //         <div className="eye"></div>
  //       </div>
  //       <p className="loadingText">{message}</p>
  //     </div>
  //   );
  // };
  const FullScreenLoader: React.FC<{ message?: string; progress?: number }> = ({
    message,
    progress,
  }) => {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* <LoadingBot message={message} /> */}
        <div style={{ width: "60%", marginTop: "2rem" }}>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 h-4 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* {isLoading && <FullScreenLoader message="กำลังเตรียมความพร้อม..." */}
      {(isLoading || isProcessing) && (
        <FullScreenLoader
          message="กำลังประมวลผลข้อมูล..."
          progress={progress}
        />
      )}

      {/* <main className="transition-opacity duration-500 opacity-100">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Recall Transaction
          </h1>
          <p className="mt-2 text-gray-600">formdata:{formdata_id}</p>
          <p className="mt-2 text-gray-600">session:{session_id}</p>
        </div>
      </main> */}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        titleName="ไม่พบข้อมูล"
        message="ไม่พบข้อมูลสำหรับดำเนินการซ้ำ กรุณาลองใหม่อีกครั้งภายหลัง"
      />
      <style jsx global>{`
        .botContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
        }
        .bot {
          width: 90px;
          height: 90px;
          background-color: #e0e0e0;
          border-radius: 50%;
          position: relative;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 15px;
          border: 4px solid #b0b0b0;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        }
        .bot::before {
          content: "";
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 15px;
          background-color: #b0b0b0;
          border-radius: 3px;
        }
        .bot::after {
          content: "";
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          background-color: #ffc107;
          border-radius: 50%;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .eye {
          width: 18px;
          height: 18px;
          background-color: #ffffff;
          border-radius: 50%;
          border: 3px solid #555;
          animation: blinking 2s infinite ease-in-out;
        }
        .loadingText {
          font-family: monospace;
          font-weight: bold;
          color: #555;
          font-size: 1.125rem;
          letter-spacing: 0.1em;
        }
        @keyframes blinking {
          0%,
          100% {
            transform: scale(1, 1);
            background-color: #fff;
          }
          50% {
            transform: scale(1, 0.1);
            background-color: #87ceeb;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 5px 2px rgba(255, 193, 7, 0.5);
          }
          50% {
            box-shadow: 0 0 10px 5px rgba(255, 193, 7, 1);
          }
        }
      `}</style>
    </div>
  );
}
