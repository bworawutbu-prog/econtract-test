    import { createAsyncThunk } from "@reduxjs/toolkit";
    import { getTokenLogin } from "../token";
    import axios, { AxiosError } from "axios";
    import { Workspace, WorkspaceCreateType } from "../types/workSpace";
    import { clearAllUserSession } from "../utils/localStorage";

    export const createWorkspace = createAsyncThunk("createWorkspace", async (payload: WorkspaceCreateType, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/workspace/create_workspace`;
            if (businessId) {
                url += `?business_id=${businessId}`;
            }
            
            const response = await axios.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            if (error instanceof AxiosError && error.response?.status === 409) {
                return {
                    status: 409,
                    message: "Workspace name already exists"
                }
            }
            console.error("Error creating workspace:", error);
            throw error;
        }
    })

    export const getAllWorkspace = createAsyncThunk("getAllWorkspace", async (groupId: string, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/workspace/get_all_workspaces/${groupId}`;
            if (businessId) {
                url += `?business_id=${businessId}`;
            }
            
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            console.error("Error getting all workspace:", error);
            throw error;
        }
    })

    export const getWorkspaceById = createAsyncThunk("getWorkspaceById", async (workspaceId: string, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/workspace/${workspaceId}`;
            if (businessId) {
                url += `?business_id=${businessId}`;
            }
            
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            console.error("Error getting workspace by id:", error);
            throw error;
        }
    })

    export const updateWorkspace = createAsyncThunk("updateWorkspace", async (payload: Workspace, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/workspace/${payload._id}`;
            if (businessId) {
                url += `?business_id=${businessId}`;
            }
            
            const response = await axios.put(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            console.error("Error updating workspace:", error);
            throw error;
        }
    })

    export const deleteWorkspace = createAsyncThunk("deleteWorkspace", async (workspaceId: string, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/workspace/${workspaceId}`;
            if (businessId) {
                url += `?business_id=${businessId}`;
            }
            
            const response = await axios.delete(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            console.error("Error deleting workspace:", error);
            throw error;
        }
    })

    export const searchUserInBusiness = createAsyncThunk("searchUserInBusiness", async (email: string, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession()
            console.error("No authentication token found");
            return rejectWithValue("No authentication token found");
        }
        
        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;
        
        try {
            // Build URL with query params
            let url = `${baseUrl}/business/search/user_in_business?email=${email}`;
            if (businessId) {
                url += `&business_id=${businessId}`;
            }
            
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            return response.data;
        }
        catch (error) {
            console.error("Error searching user in business:", error);
            throw error;
        }
    })