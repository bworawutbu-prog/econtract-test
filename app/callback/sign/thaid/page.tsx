'use client'

import { signThaid, verifyThaid } from '@/store/callbackStore/thaid';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function ThaidSignCallback() {
    const dispatch = useDispatch();
    const route = useRouter();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const signThaidCallback = async () => {
            const rawSearch = window.location.search;
            const cleanedSearch = rawSearch
                .replaceAll("&&", "&") // Fix multiple ampersands
                .replaceAll("%20", "") // Remove encoded spaces
                .replace("?", "");           // Remove the "?" at the start
                const params = new URLSearchParams(cleanedSearch);
                const code = params.get("code") || "";
                const sessionId = params.get("sessionid") || "";
                if (code && sessionId) {
                    setLoading(true);
                    const result = await dispatch(signThaid({ code, sessionId }) as any);
                    setLoading(false);
                    if (result.payload && result.payload.redirect_url) {
                        const redirectUrl = result.payload.redirect_url;
                        const redirectUrlArray = redirectUrl.split("/");
                        const documentId = redirectUrlArray[redirectUrlArray.length - 1];
                        // route.push(result.payload.redirect_url);
                        route.push(`/${documentId}`);
                        }
                    }
                }
                signThaidCallback();
            }, [])
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <Spin size="large" spinning={loading}/>
                <p className="text-lg font-medium">กรุณารอสักครู่...</p>
            </div>
        )
}