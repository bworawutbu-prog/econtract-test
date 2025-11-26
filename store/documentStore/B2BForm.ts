import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocsSetting } from './../types/contractB2BType';
interface SubmittedFormState {
  forms: DocsSetting | null;
  approvers: any[] | null;
}

const initialState: SubmittedFormState = {
  forms: {
    docsType: "",
    docsTypeDetail: {},
    contractParty: {
      approvers: [
        {
          userList: [
            {
              idCard: "",
              fullName: "",
              email: "",
            }
          ]
        }
      ],
      taxId: "",
      operator: {
        name: "",
        idCard: "",
        email: "",
        userName: "",
        hasCa: false,
        isInBusiness: false,
      }
    },
  },
  approvers: null,
};

const contractB2BFormReducer = createSlice({
  name: "submittedForms",
  initialState,
  reducers: {
    addSubmittedForm: (state, action: PayloadAction<any>) => {
      state.forms = action.payload;
    },
    removeSubmittedForm: (state) => {
      state.forms = null;
    },
    resetSubmittedForms: (state) => {
      state.forms = null;
    },
    setApprovers: (state, action: PayloadAction<any[]>) => {
      state.approvers = action.payload;
    },
    clearApprovers: (state) => {
      state.approvers = null;
    },
    resetB2BForm: (state) => {
      // state.forms = null;
      // state.approvers = null;
      return initialState
    },
    setDocsType: (state, action: PayloadAction<string>) => {
      //set docsType to state.forms and keep other existing data
      if (!state.forms) {
        // ถ้า state.forms ยังเป็น null ให้ initialize ใหม่
        state.forms = {
          docsType: action.payload,
          docsTypeDetail: {},
          contractParty: {
            approvers: [],
            taxId: "",
            operator: {
              name: "",
              idCard: "",
              email: "",
              userName: "",
              hasCa: false,
              isInBusiness: false,
            }
          }
        };
      } else {
        // ถ้ามี state.forms อยู่แล้ว แค่ update docsType อย่างเดียว
        state.forms.docsType = action.payload;
      }
    },
  },
});

export const { addSubmittedForm, removeSubmittedForm, resetSubmittedForms, setApprovers, clearApprovers, resetB2BForm, setDocsType } =
  contractB2BFormReducer.actions;

export default contractB2BFormReducer.reducer;
