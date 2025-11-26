import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface for form element configuration state
export interface FormElementConfigState {
  id: string;
  label: string;
  checkboxOptions?: string[];
  radioOptions?: string[];
  selectOptions?: string[];
  maxLength?: number;
  minLines?: number;
  required?: boolean;
  placeholder?: string;
  maxFileSize?: number;
  typeName?: string;
  isEmbedded?: boolean;
  fileAccept?: string[];
  pageNumber?: number;
  pageNumbers?: number[];
  style?: any; // For style updates (resize, color, etc.) - using any to avoid circular import
  position?: { x: number; y: number }; // For position updates from resize
  date?: {
    days: string;
    months: string;
    years: string;
    format?: string;
    useCurrentDate?: boolean;
    header?: string;
  };
  dateFormat?: "EU" | "US" | "THBCnumber";
  // Additional state for editing
  isEditing?: {
    [key: string]: boolean;
  };
  tempConfig?: Partial<FormElementConfigState>;
  localValue?: string | string[] | boolean | number;
  inputValue?: string;
  // For checkbox/radio options
  checkboxOptionValues?: {[key: number]: string};
  radioOptionValues?: {[key: number]: string};
  // For more-file configs
  moreFileConfigs?: {[key: string]: any};
  // For signature/stamp page configs
  signaturePageConfigs?: {[key: string]: string[]};
  stampPageConfigs?: {[key: string]: string[]};
  // For expanded states
  expandedMoreFileIds?: string[];
}

// Interface for the entire form element config store
interface FormElementConfigStore {
  configs: {[elementId: string]: FormElementConfigState};
  // Global states that affect all elements
  globalStates: {
    expandedMoreFileIds: string[];
    moreFileConfigs: {[key: string]: any};
    signaturePageConfigs: {[key: string]: string[]};
    stampPageConfigs: {[key: string]: string[]};
  };
}

const initialState: FormElementConfigStore = {
  configs: {},
  globalStates: {
    expandedMoreFileIds: [],
    moreFileConfigs: {},
    signaturePageConfigs: {},
    stampPageConfigs: {},
  },
};

const formElementConfigSlice = createSlice({
  name: 'formElementConfig',
  initialState,
  reducers: {
    // Initialize or update element config
    setElementConfig: (state, action: PayloadAction<{elementId: string; config: FormElementConfigState}>) => {
      const { elementId, config } = action.payload;
      state.configs[elementId] = {
        ...state.configs[elementId],
        ...config,
      };
    },

    // Update specific field of element config
    updateElementConfigField: (state, action: PayloadAction<{
      elementId: string; 
      field: string; 
      value: any;
    }>) => {
      const { elementId, field, value } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      (state.configs[elementId] as any)[field] = value;
    },

    // Update editing state
    setEditingState: (state, action: PayloadAction<{
      elementId: string; 
      field: string; 
      isEditing: boolean;
    }>) => {
      const { elementId, field, isEditing } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      if (!state.configs[elementId].isEditing) {
        state.configs[elementId].isEditing = {};
      }
      state.configs[elementId].isEditing![field] = isEditing;
    },

    // Update temp config
    setTempConfig: (state, action: PayloadAction<{
      elementId: string; 
      tempConfig: Partial<FormElementConfigState>;
    }>) => {
      const { elementId, tempConfig } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      state.configs[elementId].tempConfig = {
        ...state.configs[elementId].tempConfig,
        ...tempConfig,
      };
    },

    // Update local value
    setLocalValue: (state, action: PayloadAction<{
      elementId: string; 
      value: string | string[] | boolean | number;
    }>) => {
      const { elementId, value } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      state.configs[elementId].localValue = value;
    },

    // Update input value
    setInputValue: (state, action: PayloadAction<{
      elementId: string; 
      value: string;
    }>) => {
      const { elementId, value } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      state.configs[elementId].inputValue = value;
    },

    // Update checkbox/radio option values
    setCheckboxOptionValues: (state, action: PayloadAction<{
      elementId: string; 
      values: {[key: number]: string};
    }>) => {
      const { elementId, values } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      state.configs[elementId].checkboxOptionValues = values;
    },

    setRadioOptionValues: (state, action: PayloadAction<{
      elementId: string; 
      values: {[key: number]: string};
    }>) => {
      const { elementId, values } = action.payload;
      if (!state.configs[elementId]) {
        state.configs[elementId] = {} as FormElementConfigState;
      }
      state.configs[elementId].radioOptionValues = values;
    },

    // Global state updates
    setExpandedMoreFileIds: (state, action: PayloadAction<string[]>) => {
      state.globalStates.expandedMoreFileIds = action.payload;
    },

    setMoreFileConfigs: (state, action: PayloadAction<{[key: string]: any}>) => {
      state.globalStates.moreFileConfigs = {
        ...state.globalStates.moreFileConfigs,
        ...action.payload,
      };
    },

    setSignaturePageConfigs: (state, action: PayloadAction<{[key: string]: string[]}>) => {
      state.globalStates.signaturePageConfigs = {
        ...state.globalStates.signaturePageConfigs,
        ...action.payload,
      };
    },

    setStampPageConfigs: (state, action: PayloadAction<{[key: string]: string[]}>) => {
      state.globalStates.stampPageConfigs = {
        ...state.globalStates.stampPageConfigs,
        ...action.payload,
      };
    },

    // Clear element config
    clearElementConfig: (state, action: PayloadAction<string>) => {
      delete state.configs[action.payload];
    },

    // Clear all configs
    clearAllConfigs: (state) => {
      state.configs = {};
      state.globalStates = {
        expandedMoreFileIds: [],
        moreFileConfigs: {},
        signaturePageConfigs: {},
        stampPageConfigs: {},
      };
    },

    // Batch update multiple configs
    batchUpdateConfigs: (state, action: PayloadAction<{[elementId: string]: FormElementConfigState}>) => {
      state.configs = {
        ...state.configs,
        ...action.payload,
      };
    },
  },
});

export const {
  setElementConfig,
  updateElementConfigField,
  setEditingState,
  setTempConfig,
  setLocalValue,
  setInputValue,
  setCheckboxOptionValues,
  setRadioOptionValues,
  setExpandedMoreFileIds,
  setMoreFileConfigs,
  setSignaturePageConfigs,
  setStampPageConfigs,
  clearElementConfig,
  clearAllConfigs,
  batchUpdateConfigs,
} = formElementConfigSlice.actions;

export default formElementConfigSlice.reducer;
