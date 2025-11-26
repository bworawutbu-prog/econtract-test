"use client"

import authReducer from './authSlice';
import uiReducer from './uiSlice';
import transactionReducer from '../frontendStore/transactionAPI';
import citizenReducer from '../backendStore/citizenAPI';

export default { 
    authReducer,
    uiReducer,
    transactionReducer,
    citizenReducer
};