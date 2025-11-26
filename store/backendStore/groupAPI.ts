import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import axios, { AxiosError } from "axios";
import { UpdateGroupPayload, CreateDocumentTypePayload, TemplatesByDocumentTypeResponseType } from "../types/groupType";
import { clearAllUserSession } from "../utils/localStorage";
import { useRouter } from "next/navigation";

// const router = useRouter();

export const createGroup = createAsyncThunk("createGroup", async (payload: any, { rejectWithValue }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        // console.error("No authentication token found");
        // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    try {
        const response = await axios.post(`${baseUrl}/group/create_group`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
            return {
                status: 409,
                message: "Group name already exists"
            }
        }
        console.error("Error creating group:", error);
        throw error;
    }
})

export const getGroup = createAsyncThunk("getGroup", async (_, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        // console.error("No authentication token found");
        // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    
    // Get business_id from Redux state
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;
    
    try {
        // Build URL with query params
        let url = `${baseUrl}/group/get_all_groups`;
        if (businessId) {
            url += `?business_id=${businessId}`;
        }
        
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        console.error("Error getting group:", error);
        throw error;
    }
})

export const getGroupById = createAsyncThunk("getGroupById", async (id: string, { rejectWithValue }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
            // console.error("No authentication token found");
            // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    try {
        const response = await axios.get(`${baseUrl}/group/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        console.error("Error getting group by id:", error);
        throw error;
    }
})

export const updateGroup = createAsyncThunk("updateGroup", async ({payload,id}: {payload: UpdateGroupPayload, id: string}, { rejectWithValue }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
            // console.error("No authentication token found");
            // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    try {
        const response = await axios.put(`${baseUrl}/group/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
        return response.data;
    } catch (error) {
        console.error("Error updating group:", error);
        throw error;
    }
})

export const deleteGroup = createAsyncThunk("deleteGroup", async (id: string, { rejectWithValue }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        // console.error("No authentication token found");
        // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    try {
        const response = await axios.delete(`${baseUrl}/group/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        console.error("Error deleting group:", error);
        throw error;
    }
})

export const searchBusinessById = createAsyncThunk("searchBusinessById", async (search: string, { rejectWithValue }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        // console.error("No authentication token found");
        // router.replace('/login');
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    try {
        const response = await axios.get(`${baseUrl}/business/search/${search}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status !== 200) {
            return {
                status: error.response?.status,
                message: error.response?.data.message
            }
        }
        console.error("Error searching business:", error);
        throw error;
    }
})

export interface GetDocumentTypesParams {
    search?: string;
    limit?: number;
    page?: number;
    filter?: string;
}

export const getDocumentTypes = createAsyncThunk("getDocumentTypes", async (params: GetDocumentTypesParams | undefined, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    
    // Get business_id from Redux state
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;
    
    try {
        // Build URL with query params
        let url = `${baseUrl}/document-types`;
        const queryParams = new URLSearchParams();
        
        // Add search parameter (default to "" for show all)
        if (params?.search !== undefined) {
            queryParams.append('search', params.search);
        }
        
        // Add limit parameter
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString());
        }
        
        // Add page parameter
        if (params?.page !== undefined) {
            queryParams.append('page', params.page.toString());
        }
        
        // Add filter parameter (default to "" for show all)
        if (params?.filter !== undefined) {
            queryParams.append('filter', params.filter);
        }
        
        // Always add business_id if available
        if (businessId) {
            queryParams.append('business_id', businessId);
        }
        
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }
        
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data;
    } catch (error) {
        console.error("Error getting document types:", error);
        throw error;
    }
})

export const createDocumentType = createAsyncThunk("createDocumentType", async (payload: CreateDocumentTypePayload, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
        clearAllUserSession()
        return rejectWithValue("No authentication token found");
    }
    
    // Get business_id from Redux state
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;
    
    try {
        // Build URL with query params
        let url = `${baseUrl}/document-types`;
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
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            // ✅ ใช้ rejectWithValue เพื่อให้ Redux ถือว่าเป็น error
            return rejectWithValue(error.response.data);
        }
        console.error("Error creating document type:", error);
        // ✅ Return rejectWithValue สำหรับ error อื่นๆ
        return rejectWithValue({
            status: false,
            message: "Failed to create document type"
        });
    }
})

/**
 * Get templates by document type ID
 * GET /document-types/:id/templates?page=x&limit=x
 * @param documentTypeId - The document type ID (from groupList._id)
 * @param params - Optional pagination parameters
 * @returns Promise<TemplatesByDocumentTypeResponseType>
 */
export interface GetTemplatesByDocumentTypeParams {
    page?: number;
    limit?: number;
}

export const getTemplatesByDocumentTypeId = createAsyncThunk(
    "getTemplatesByDocumentTypeId",
    async (
        { documentTypeId, params }: { documentTypeId: string; params?: GetTemplatesByDocumentTypeParams },
        { rejectWithValue, getState }
    ) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession();
            return rejectWithValue("No authentication token found");
        }

        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;

        try {
            // Build URL with document type ID
            let url = `${baseUrl}/document-types/${documentTypeId}/templates`;
            const queryParams = new URLSearchParams();
            
            // Add business_id as query parameter if available
            if (businessId) {
                queryParams.append('business_id', businessId);
            }
            
            // Add page parameter if provided
            if (params?.page !== undefined) {
                queryParams.append('page', params.page.toString());
            }
            
            // Add limit parameter if provided
            if (params?.limit !== undefined) {
                queryParams.append('limit', params.limit.toString());
            }
            
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error getting templates by document type ID:", error);
            if (error instanceof AxiosError) {
                return rejectWithValue({
                    status: error.response?.status,
                    message: error.response?.data?.message || "Failed to get templates"
                });
            }
            throw error;
        }
    }
);

/**
 * Delete document type by ID
 * DELETE /document-types/:id
 * @param id - The document type ID
 */
export const deleteDocumentType = createAsyncThunk(
    "deleteDocumentType",
    async (id: string, { rejectWithValue, getState }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = getTokenLogin();
        if (!token) {
            clearAllUserSession();
            return rejectWithValue("No authentication token found");
        }

        // Get business_id from Redux state
        const state = getState() as any;
        const businessId = state.business?.selectedBusinessId;

        try {
            // Build URL with document type ID
            let url = `${baseUrl}/document-types/${id}`;
            
            // Add business_id as query parameter if available
            if (businessId) {
                url += `?business_id=${businessId}`;
            }

            const response = await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting document type:", error);
            if (error instanceof AxiosError) {
                return rejectWithValue({
                    status: error.response?.status,
                    message: error.response?.data?.message || "Failed to delete document type"
                });
            }
            throw error;
        }
    }
);