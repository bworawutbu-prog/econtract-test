import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getTokenLogin, getGuestToken} from "../token"
import { clearAllUserSession } from "../utils/localStorage";

export const loginBusiness = createAsyncThunk(
    'set_business_id',
    async (biz_id : string) => {
        const payload = {
            business_id : biz_id
        }
        // const token = getTokenLogin() || getGuestToken()
        const token = getTokenLogin() ?? "";
        if (!token) {
            // clearAllUserSession()
            // console.error("No authentication token found");
            // Don't redirect here, let the calling component handle it
            throw new Error("No authentication token found");
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login_business`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (error) {
            // handleAxiosError(error);
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