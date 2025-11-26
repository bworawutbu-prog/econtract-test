"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { payloadUpdateTransaction } from "@/store/types/mappingTypes";
import { useAppDispatch } from "@/store/index";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { UpdateTransactions } from "@/store/frontendStore/transactionAPI";
import { enqueueSnackbar } from "notistack";

export default function LandingPageError() {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const hasRun = useRef(false);
  //save payload(come from session) func
  const settingPayload = async (
    session_id: string
  ): Promise<payloadUpdateTransaction | null> => {
    const stored = sessionStorage.getItem("pendingTransactionPayload");
    if (stored) {
      try {
        // const payload_done: payloadUpdateTransaction = JSON.parse(stored);
        const parsed = JSON.parse(stored);
        const payload_done: payloadUpdateTransaction = {
          ...parsed,
          session_id, //crypto.randomUUID?.() || "", //
        };
        //  : ",payload_done)

        return payload_done;
      } catch (error) {
        enqueueSnackbar(`❌ Failed to parse payload: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        sessionStorage.removeItem("pendingTransactionPayload");
      }
    }
    return null;
  };
  //Dispatch Payload to external/Updatetransaction
  const settingRecall = async (payload: payloadUpdateTransaction) => {
    try {
      const response = await dispatch(UpdateTransactions(payload)).unwrap();

      const recall_docid = response.transaction._id;
      //
      // call change route
      if (response.status) {
        router.replace(`/frontend/Mapping?documentId=${recall_docid}`);
        // router.replace(`/frontend/Mapping?documentId=${transaction_id}`);
        sessionStorage.removeItem("pendingTransactionPayload");
      } else {
        enqueueSnackbar(
          "📞📞response Reutnr Failed📞📞 I go to undefined now",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
      }
      // sessionStorage.removeItem("pendingTransactionPayload");
    } catch (error) {
      enqueueSnackbar(`❌ Retry failed: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      // Show error UI if needed
    }
  };

  useEffect(() => {
    if (hasRun.current) return; // 👈 Prevent re-entry
    hasRun.current = true;

    const processAuth = async () => {
      if (window.location.href) {
        const params = new URLSearchParams(window.location.search);
        const paramObject = Object.fromEntries(params.entries());

        const code = params.get("code") || "";
        const message = params.get("message_error") || "";
        const session_id =
          params.get("session_id") ||
          "Failed To get session_id check value recive or blame backend";

        setCode(code || "");
        setMessage(message || "");

        if (params) {
          const payload = await settingPayload(session_id);
          if (payload) {
            await settingRecall(payload); // 👈 async call
          } else {
            enqueueSnackbar("⚠️ No valid payload found for retry.", {
              variant: "warning",
              autoHideDuration: 3000,
            });
          }
        }
      }
    };

    processAuth();
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  interface LoadingBotProps {
    message?: string;
  }

  const LoadingBot: React.FC<LoadingBotProps> = ({
    message = "กำลังโหลดข้อมูล...",
  }) => {
    return (
      <div className="botContainer">
        <div className="bot">
          <div className="eye"></div>
          <div className="eye"></div>
        </div>
        <p className="loadingText">{message}</p>
      </div>
    );
  };
  const FullScreenLoader: React.FC<{ message?: string }> = ({ message }) => {
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
        <LoadingBot message={message} />
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
      {isLoading && <FullScreenLoader message="กำลังเตรียมความพร้อม..." />}
      <main
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            landing page error
          </h1>
          <p className="mt-2 text-gray-600">Error Code:{code}</p>
          <p className="mt-2 text-gray-600">Error Message:{message}</p>
        </div>
      </main>
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
