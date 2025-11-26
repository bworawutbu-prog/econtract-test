import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getTokenLogin } from "../token";
import { clearAllUserSession } from "../utils/localStorage";

// const router = useRouter();
export const sentEmailAPI = createAsyncThunk("sentEmail", async (payload: {
  to: string[];
  subject: string;
  html: string;
}, { rejectWithValue }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = getTokenLogin();
  if (!token) {
    console.error("No authentication token found");
    clearAllUserSession();
    rejectWithValue("No authentication token found");
  }
  try {
  const response = await axios.post(`${baseUrl}/sendmail/send`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
});
