"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 📋 **Types สำหรับ mappingMoreFile**
interface FileDataPath {
  file_index: number;
  file_name: string;
  file_path: string;
}

interface FileTypeDataPayload {
  type_index: number;
  file_data: FileDataPath[];
}

interface MappingMoreFilePayload {
  step_index: number;
  type_data: FileTypeDataPayload[];
}

// 🏗️ **State Interface**
interface MappingState {
  mappingMoreFileData: MappingMoreFilePayload[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  error: string | null;
  lastUpdated: string | null;
  typeDocNo: string; // เพิ่ม typeDocNo
}

// 🔄 **Initial State**
const initialState: MappingState = {
  mappingMoreFileData: [],
  isUploading: false,
  uploadProgress: {},
  error: null,
  lastUpdated: null,
  typeDocNo: "", // เพิ่ม initial value สำหรับ typeDocNo
};

// 🎯 **Redux Slice Definition**
const mappingSlice = createSlice({
  name: 'mapping',
  initialState,
  reducers: {
    // ➕ **เพิ่มไฟล์ใหม่ในขั้นตอนที่กำหนด**
    addFileToStep: (state, action: PayloadAction<{
      stepIndex: number;
      typeIndex: number;
      fileData: FileDataPath;
    }>) => {
      const { stepIndex, typeIndex, fileData } = action.payload;
      
      // หา step ที่ต้องการ หรือสร้างใหม่ถ้าไม่มี
      let stepData = state.mappingMoreFileData.find(item => item.step_index === stepIndex);
      
      if (!stepData) {
        stepData = {
          step_index: stepIndex,
          type_data: []
        };
        state.mappingMoreFileData.push(stepData);
      }
      
      // หา type_data ที่ต้องการ หรือสร้างใหม่ถ้าไม่มี
      let typeData = stepData.type_data.find(item => item.type_index === typeIndex);
      
      if (!typeData) {
        typeData = {
          type_index: typeIndex,
          file_data: []
        };
        stepData.type_data.push(typeData);
      }
      
      // เพิ่มไฟล์ใหม่
      typeData.file_data.push(fileData);
      state.lastUpdated = new Date().toISOString();
    },

    // ❌ **ลบไฟล์จากขั้นตอนที่กำหนด**
    removeFileFromStep: (state, action: PayloadAction<{
      stepIndex: number;
      typeIndex: number;
      fileIndex: number;
    }>) => {
      const { stepIndex, typeIndex, fileIndex } = action.payload;
      
      const stepData = state.mappingMoreFileData.find(item => item.step_index === stepIndex);
      if (stepData) {
        const typeData = stepData.type_data.find(item => item.type_index === typeIndex);
        if (typeData) {
          typeData.file_data = typeData.file_data.filter(file => file.file_index !== fileIndex);
          
          // ลบ type_data ถ้าไม่มีไฟล์เหลือ
          if (typeData.file_data.length === 0) {
            stepData.type_data = stepData.type_data.filter(item => item.type_index !== typeIndex);
          }
        }
        
        // ลบ step_data ถ้าไม่มี type_data เหลือ
        if (stepData.type_data.length === 0) {
          state.mappingMoreFileData = state.mappingMoreFileData.filter(item => item.step_index !== stepIndex);
        }
      }
      state.lastUpdated = new Date().toISOString();
    },

    // 📈 **อัพเดท upload progress**
    setUploadProgress: (state, action: PayloadAction<{ key: string; progress: number }>) => {
      const { key, progress } = action.payload;
      state.uploadProgress[key] = progress;
    },

    // 🔄 **ตั้งค่า uploading status**
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },

    // ⚠️ **ตั้งค่า error**
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 🔄 **รีเซ็ตข้อมูลทั้งหมด**
    resetMappingData: (state) => {
      state.mappingMoreFileData = [];
      state.uploadProgress = {};
      state.error = null;
      state.isUploading = false;
      state.lastUpdated = null;
    },

    // 🔄 **อัพเดทข้อมูลทั้งหมด (สำหรับ migration จาก local state)**
    setMappingMoreFileData: (state, action: PayloadAction<MappingMoreFilePayload[]>) => {
      state.mappingMoreFileData = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // 🧹 **ล้าง upload progress ที่เสร็จแล้ว**
    clearCompletedUploads: (state) => {
      const completedKeys = Object.keys(state.uploadProgress).filter(
        key => state.uploadProgress[key] >= 100
      );
      completedKeys.forEach(key => {
        delete state.uploadProgress[key];
      });
    },

    // 🎯 **ตั้งค่า typeDocNo**
    setTypeDocNo: (state, action: PayloadAction<string>) => {
      state.typeDocNo = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// 🎯 **Export Actions**
export const {
  addFileToStep,
  removeFileFromStep,
  setUploadProgress,
  setIsUploading,
  setError,
  resetMappingData,
  setMappingMoreFileData,
  clearCompletedUploads,
  setTypeDocNo,
} = mappingSlice.actions;

// 🎯 **Export Reducer**
export default mappingSlice.reducer;

// 🔍 **Selectors สำหรับเข้าถึงข้อมูล**
export const selectMappingMoreFileData = (state: any) => state.mapping.mappingMoreFileData;
export const selectIsUploading = (state: any) => state.mapping.isUploading;
export const selectUploadProgress = (state: any) => state.mapping.uploadProgress;
export const selectMappingError = (state: any) => state.mapping.error;
export const selectLastUpdated = (state: any) => state.mapping.lastUpdated;
export const selectTypeDocNo = (state: any) => state.mapping.typeDocNo;

// 🔍 **เลือกไฟล์ของ step ที่กำหนด**
export const selectFilesByStep = (stepIndex: number) => (state: any) => 
  state.mapping.mappingMoreFileData.find((item: MappingMoreFilePayload) => item.step_index === stepIndex);

// 🔍 **เลือกจำนวนไฟล์ทั้งหมด**
export const selectTotalFileCount = (state: any) => {
  return state.mapping.mappingMoreFileData.reduce((total: number, step: MappingMoreFilePayload) => {
    return total + step.type_data.reduce((stepTotal: number, type: FileTypeDataPayload) => {
      return stepTotal + type.file_data.length;
    }, 0);
  }, 0);
};

// 🔍 **ตรวจสอบว่ามีไฟล์ใน step ที่กำหนดหรือไม่**
export const selectHasFilesInStep = (stepIndex: number) => (state: any) => {
  const stepData = state.mapping.mappingMoreFileData.find((item: MappingMoreFilePayload) => item.step_index === stepIndex);
  return stepData ? stepData.type_data.some((type: FileTypeDataPayload) => type.file_data.length > 0) : false;
}; 