"use client";

import { useEffect } from "react";
export default function ExternalDownload() {
  const download = (url: string, filename: string) => {
    fetch(url).then(function (t) {
      return t.blob().then((b) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.setAttribute("download", filename);
        a.click();
      });
    });
  };
  //https://dev-digitrust.softway.co.th/external_download?url=/api/file/public-download-pdf/:transaction_id
  useEffect(() => {
    const tokenString = btoa(
      process.env.NEXT_PUBLIC_API_URL +
        `https://dev-digitrust.softway.co.th/external_download?url=/api/file/public-download-pdf/:transaction_id`
    );
    sessionStorage.setItem("isGuest", "true");
    sessionStorage.setItem("guest_accessToken", tokenString);
    const processDownload = () => {
      if (window.location.href) {
        const params = new URLSearchParams(window.location.search);
        const paramObject = Object.fromEntries(params.entries());
        const url = params.get("url") || "";
        const DC = params.get("DC") || "";
        const type = params.get("type") || "";
        const tokenString1 = btoa(url);
        sessionStorage.setItem("isGuest", "true");
        sessionStorage.setItem("guest_accessToken", tokenString1);
        const downloadUrl = (process.env.NEXT_PUBLIC_API_URL || "") + `${url}/${DC}?type=${type}`;
        download(
          downloadUrl,
          DC
        );
      }
    };
    processDownload();
  }, []);
}
