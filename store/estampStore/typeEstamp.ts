import { createAsyncThunk } from "@reduxjs/toolkit";
import { Pagination } from "antd";
import { getTokenLogin } from "../token";
import axios from "axios";
import { clearAllUserSession } from "../utils/localStorage";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";
import { detectApiError } from "@/utils/errorHandler";
// import { handleNoToken } from '@/utils/tokenHandler';
import router from "next/router";
// const router = useRouter();
export const ListEstampType = createAsyncThunk(
    'get_list_type_estamp',
    async ({search = '',page = 1,size = 10}: {search:string,page:number,size:number}, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // console.error("No authentication token found");
            // handleNoToken
            // clearAllUserSession()
            return rejectWithValue("No authentication token found");
          }

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp?search=${encodeURIComponent(search)}&page=${page}&limit=${size}${process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2") ? "&business_id=175128061064325" : ""}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }

)

export const ListEstampTransaction = createAsyncThunk(
    'get_list_estamp_transaction',
    async ({search="",page=1,size=10,status=""}: {search:string,page:number,size:number,status:string}, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // console.error("No authentication token found");
            // handleNoToken
            return rejectWithValue("No authentication token found");
        }
        if (status === "total") {
            status = ""
        }
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&limit=${size}${process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2") ? "&business_id=175128061064325" : ""}`
            console.log("url", url);
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
               console.log("error", error);
            }
            throw error;
        }

    }
)

export const ListEstampTransactionByID = createAsyncThunk(
    'get_list_estamp_transaction_by_id',
    async ({id,search,page=1,size=10}: {id?:string | undefined,search:string,page:number,size:number}, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // router.replace("/login");
            return rejectWithValue("No authentication token found");
        }
        if (!id) {
            console.error("No id found");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp/${encodeURIComponent(id)}/transaction?search=${encodeURIComponent(search)}&page=${page}&limit=${size}${process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2") ? "&business_id=175128061064325" : ""}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }

    }
)

export const TransactionEstampDetail = createAsyncThunk(
    'get_transaction_estamp_detail',
    async (transaction_id:string, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // router.replace("/login");
            return rejectWithValue("No authentication token found");
        }
        if (!transaction_id) {
            console.error("No id found");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction/${transaction_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    })

export const SubmitTransactionEstamp = createAsyncThunk(
    'post_submit_transaction_estamp',
    async (transaction_estamp_id:string, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // router.replace("/login");
            return rejectWithValue("No authentication token found");
        }
        if (!transaction_estamp_id) {
            console.error("No id found");   
            return;
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction/submit${process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2") ? "?business_id=175128061064325" : ""}`, {
                transaction_estamp_id: transaction_estamp_id
            },{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }
)

export const CountTransactionEstamp = createAsyncThunk(
    'get_count_transaction_estamp',
    async (_, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // router.replace("/login");
            return rejectWithValue("No authentication token found");
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction/count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }
)

export const SendEmailTransactionEstamp = createAsyncThunk(
    'post_send_email_transaction_estamp',
    async (transaction_estamp_id:string, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // handleNoToken
            return rejectWithValue("No authentication token found");
        }
        if (!transaction_estamp_id) {
            console.error("No id found");
            return;
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sendmail/send_notification_estamp/${transaction_estamp_id}`,{}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }
        
)

export const CheckStatusTransactionEstamp = createAsyncThunk(
    'post_check_status_transaction_estamp',
    async (transaction_estamp_id:string, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // router.replace('/login');
            // handleNoToken
            return rejectWithValue("No authentication token found");
        }
        if (!transaction_estamp_id) {
            console.error("No id found");
            return rejectWithValue("No id found");
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction/check/payment`,{
                transaction_estamp_id: transaction_estamp_id
            },{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }
)

// Helper error logger
// function handleAxiosError(error: any) {
//     console.error('Failed to load response data:', error);
//     if (axios.isAxiosError(error)) {
//       console.error('Axios error details:');
//       console.error('Status:', error.response?.status);
//       console.error('Data:', error.response?.data);
//       console.error('Headers:', error.response?.headers);
//       console.error('Config:', error.config);
//     } else {
//       console.error('Non-Axios error:', error);
//     }
//   }

export const GetCoBusinessDetail = createAsyncThunk(
    'get_co_business_detail',
    async ({tax_id,business_id}: {tax_id:string,business_id:string}, { rejectWithValue }) => {
        const token = getTokenLogin()
        if (!token) {
            // handleNoToken
            return rejectWithValue("No authentication token found");
        }
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/business/estamp/detail?tax_id=${encodeURIComponent(tax_id)}&business_id=${encodeURIComponent(business_id)}`
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            throw error;
        }
    }
)