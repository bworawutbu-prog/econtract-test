import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../index';
import {
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
  FormElementConfigState,
} from '../slices/formElementConfigSlice';

export const useFormElementConfig = () => {
  const dispatch = useAppDispatch();
  const formElementConfigState = useAppSelector((state) => state.formElementConfig);

  // Get element config
  const getElementConfig = useCallback((elementId: string): FormElementConfigState | undefined => {
    return formElementConfigState.configs[elementId];
  }, [formElementConfigState.configs]);

  // Set element config
  const setElementConfigAction = useCallback((elementId: string, config: FormElementConfigState) => {
    dispatch(setElementConfig({ elementId, config }));
  }, [dispatch]);

  // Update specific field
  const updateElementConfigFieldAction = useCallback((elementId: string, field: string, value: any) => {
    dispatch(updateElementConfigField({ elementId, field, value }));
  }, [dispatch]);

  // Set editing state
  const setEditingStateAction = useCallback((elementId: string, field: string, isEditing: boolean) => {
    dispatch(setEditingState({ elementId, field, isEditing }));
  }, [dispatch]);

  // Set temp config
  const setTempConfigAction = useCallback((elementId: string, tempConfig: Partial<FormElementConfigState>) => {
    dispatch(setTempConfig({ elementId, tempConfig }));
  }, [dispatch]);

  // Set local value
  const setLocalValueAction = useCallback((elementId: string, value: string | string[] | boolean | number) => {
    dispatch(setLocalValue({ elementId, value }));
  }, [dispatch]);

  // Set input value
  const setInputValueAction = useCallback((elementId: string, value: string) => {
    dispatch(setInputValue({ elementId, value }));
  }, [dispatch]);

  // Set checkbox option values
  const setCheckboxOptionValuesAction = useCallback((elementId: string, values: {[key: number]: string}) => {
    dispatch(setCheckboxOptionValues({ elementId, values }));
  }, [dispatch]);

  // Set radio option values
  const setRadioOptionValuesAction = useCallback((elementId: string, values: {[key: number]: string}) => {
    dispatch(setRadioOptionValues({ elementId, values }));
  }, [dispatch]);

  // Global state actions
  const setExpandedMoreFileIdsAction = useCallback((ids: string[]) => {
    dispatch(setExpandedMoreFileIds(ids));
  }, [dispatch]);

  const setMoreFileConfigsAction = useCallback((configs: {[key: string]: any}) => {
    dispatch(setMoreFileConfigs(configs));
  }, [dispatch]);

  const setSignaturePageConfigsAction = useCallback((configs: {[key: string]: string[]}) => {
    dispatch(setSignaturePageConfigs(configs));
  }, [dispatch]);

  const setStampPageConfigsAction = useCallback((configs: {[key: string]: string[]}) => {
    dispatch(setStampPageConfigs(configs));
  }, [dispatch]);

  // Clear actions
  const clearElementConfigAction = useCallback((elementId: string) => {
    dispatch(clearElementConfig(elementId));
  }, [dispatch]);

  const clearAllConfigsAction = useCallback(() => {
    dispatch(clearAllConfigs());
  }, [dispatch]);

  // Batch update
  const batchUpdateConfigsAction = useCallback((configs: {[elementId: string]: FormElementConfigState}) => {
    dispatch(batchUpdateConfigs(configs));
  }, [dispatch]);

  // Get global states
  const getGlobalStates = useCallback(() => {
    return formElementConfigState.globalStates;
  }, [formElementConfigState.globalStates]);

  // Get specific global state
  const getExpandedMoreFileIds = useCallback(() => {
    return formElementConfigState.globalStates.expandedMoreFileIds;
  }, [formElementConfigState.globalStates.expandedMoreFileIds]);

  const getMoreFileConfigs = useCallback(() => {
    return formElementConfigState.globalStates.moreFileConfigs;
  }, [formElementConfigState.globalStates.moreFileConfigs]);

  const getSignaturePageConfigs = useCallback(() => {
    return formElementConfigState.globalStates.signaturePageConfigs;
  }, [formElementConfigState.globalStates.signaturePageConfigs]);

  const getStampPageConfigs = useCallback(() => {
    return formElementConfigState.globalStates.stampPageConfigs;
  }, [formElementConfigState.globalStates.stampPageConfigs]);

  return {
    // State
    formElementConfigState,
    getElementConfig,
    getGlobalStates,
    getExpandedMoreFileIds,
    getMoreFileConfigs,
    getSignaturePageConfigs,
    getStampPageConfigs,
    
    // Actions
    setElementConfig: setElementConfigAction,
    updateElementConfigField: updateElementConfigFieldAction,
    setEditingState: setEditingStateAction,
    setTempConfig: setTempConfigAction,
    setLocalValue: setLocalValueAction,
    setInputValue: setInputValueAction,
    setCheckboxOptionValues: setCheckboxOptionValuesAction,
    setRadioOptionValues: setRadioOptionValuesAction,
    setExpandedMoreFileIds: setExpandedMoreFileIdsAction,
    setMoreFileConfigs: setMoreFileConfigsAction,
    setSignaturePageConfigs: setSignaturePageConfigsAction,
    setStampPageConfigs: setStampPageConfigsAction,
    clearElementConfig: clearElementConfigAction,
    clearAllConfigs: clearAllConfigsAction,
    batchUpdateConfigs: batchUpdateConfigsAction,
  };
};
