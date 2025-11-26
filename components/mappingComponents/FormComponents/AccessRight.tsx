/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * AccessRight Component
 *
 * This component uses citizen data from Redux store (citizenGetAll) for user selection.
 * No mock user data is used - only real citizen data from the API.
 *
 * IMPORTANT: This component automatically fetches citizen data every time it mounts
 * to ensure the latest data is always available for user selection.
 *
 * Usage Examples:
 *
 * 1. With external handlers (original way):
 * <AccessRight
 *   accessType="private"
 *   onUsersChange={handleUsersChange}
 *   onSearchUsers={handleSearchUsers}
 * />
 *
 * 2. With internal state management (new way):
 * <AccessRight
 *   accessType="private"
 *   internalUsers={[]}
 * />
 *
 * 3. Fully self-contained (no external handlers needed):
 * <AccessRight
 *   accessType="private"
 *   showAccessTypeSelector={false}
 *   addUserText="เลือกผู้ใช้สำหรับการอนุมัติ"
 * />
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, Select, Radio, Button, Typography, Space, Dropdown } from "antd";
import {
  Building2,
  UserCircle2,
  ChevronDown,
  X,
  ChevronUp,
  Mail,
  Plus,
  Trash,
} from "lucide-react";
import { useSnackbar } from "notistack";
import { mockCompany } from "@/store/mockData/mockCompany";
import { roleData } from "@/store/mockData/mockRole";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { citizenGetAll, citizenSearchByEmail } from "@/store/backendStore/citizenAPI";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { AccessUser, convertToAccessUser } from "@/store/types/user";
import { searchUserInBusiness } from "@/store/backendStore/workspaceAPI";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Company {
  name: string;
  departments: string[];
}

interface UserOption {
  value: string;
  label: React.ReactNode;
  searchValue: string;
  disabled?: boolean;
}

interface AccessRightProps {
  accessType: "public" | "private" | "department";
  users?: AccessUser[] | "all";
  departments?: { [company: string]: string[] } | "all";
  userData?: AccessUser[];
  companyData?: Company[];
  onUsersChange?: (users: AccessUser[] | "all") => void;
  onDepartmentsChange?: (departments: { [company: string]: string[] } | "all") => void;
  onAccessTypeChange?: (type: "public" | "private" | "department") => void;
  readOnly?: boolean;
  showTypeSelector?: boolean;
  hideRoleDropdown?: boolean;
  title?: string;
  isSettingDocument?: boolean;
  onSearchUsers?: (searchTerm: string) => Promise<AccessUser[]>;
  showAccessTypeSelector?: boolean;
  addUserText?: string;
  internalUsers?: AccessUser[] | "all";
  onInternalUsersChange?: (users: AccessUser[] | "all") => void;
  AddUserOutside?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSTANTS = {
  DEFAULT_DISPLAYED_USER_COUNT: 10,
  SEARCH_DEBOUNCE_DELAY: 300,
  DEFAULT_ROLE_ID: "4", // Role ID for Member
  VALID_EMAIL_EXTENSIONS: ['.co', '.com', '.co.th', '.th', '.org', '.net', '.edu'],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const EmailUtils = {
  isValid: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;

    const hasAtSymbol = email.includes('@');
    const hasValidDomain = CONSTANTS.VALID_EMAIL_EXTENSIONS.some(ext => 
      email.toLowerCase().includes(ext)
    );
    
    const parts = email.split('@');
    const hasLocalPart = parts[0]?.length > 0;
    const hasDomainPart = parts[1]?.length > 0;
    const domainHasDot = parts[1]?.includes('.');
    
    return hasAtSymbol && hasValidDomain && hasLocalPart && hasDomainPart && domainHasDot;
  },

  isSearchable: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    return EmailUtils.isValid(email) && email.trim().length > 0;
  }
};

const UserUtils = {
  convertFromCitizenData: (citizenData: any[]): AccessUser[] => {
    return citizenData?.map((user) => ({
      id: user.id,
      name: `${user.first_name_th} ${user.last_name_th}`,
      email: user.email ?? "",
      department: user.department ?? "",
    }));
  },

  createFromEmail: (email: string, citizenData?: any[]): AccessUser => {
    const existingUser = citizenData?.find(user => user.email === email);
    
    if (EmailUtils.isValid(email)) {
      return {
        id: existingUser ? existingUser.id : null,
        name: existingUser ? `${existingUser.first_name_th} ${existingUser.last_name_th}` : email.split("@")[0],
        email: email,
        role: "Member",
        department: existingUser?.department || "",
      };
    } else {
      return {
        id: null,
        name: email,
        email: email,
        role: "Member",
      };
    }
  }
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AccessRight: React.FC<AccessRightProps> = ({
  accessType = "public",
  users,
  departments = "all",
  userData: providedUserData,
  companyData: providedCompanyData,
  onUsersChange,
  onDepartmentsChange,
  onAccessTypeChange,
  readOnly = false,
  showTypeSelector = true,
  hideRoleDropdown = false,
  title = "สิทธิ์การเข้าถึง",
  isSettingDocument = false,
  onSearchUsers,
  showAccessTypeSelector = true,
  addUserText = "เพิ่มรายชื่อผู้มีสิทธิ์การเข้าถึง",
  internalUsers,
  onInternalUsersChange,
  AddUserOutside = true,
}) => {
  // console.log("users", users);
  // ============================================================================
  // REDUX & DATA MANAGEMENT
  // ============================================================================

  const citizenStoreData = useAppSelector((state) => state.citizen.data);
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { enqueueSnackbar } = useSnackbar();
  
  const actualUserData = citizenStoreData?.length > 0
    ? UserUtils.convertFromCitizenData(citizenStoreData)
    : providedUserData || [];
  const actualCompanyData = providedCompanyData || mockCompany;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core states
  const [internalUsersState, setInternalUsersState] = useState<AccessUser[] | "all">(users || []);
  const [inputValue, setInputValue] = useState<string>("");
  const [tempSelectedUsers, setTempSelectedUsers] = useState<string[]>([]);

  // Search states (consolidated)
  const [searchResults, setSearchResults] = useState<AccessUser[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [emailsNotFoundInAPI, setEmailsNotFoundInAPI] = useState<Set<string>>(new Set());
  const [isUserBusiness, setIsUserBusiness] = useState<boolean>(false);

  // UI states
  const [displayedUserCount, setDisplayedUserCount] = useState<number>(CONSTANTS.DEFAULT_DISPLAYED_USER_COUNT);
  const [expandedCompanies, setExpandedCompanies] = useState<{[key: string]: boolean;}>({});
  const [selectedDepts, setSelectedDepts] = useState<{[company: string]: string[];}>({});
  const [selectedUserRoles, setSelectedUserRoles] = useState<{[email: string]: string;}>({});

  // Citizen data states
  const [isLoadingCitizenData, setIsLoadingCitizenData] = useState<boolean>(false);
  const [citizenDataError, setCitizenDataError] = useState<string | null>(null);

  // Notification tracking
  const notifiedEmails = useRef<Set<string>>(new Set());

  // Debounced input
  const debouncedInput = useDebounce(inputValue, CONSTANTS.SEARCH_DEBOUNCE_DELAY);

  // Determine which users to use (external or internal)
  const currentUsers = onUsersChange ? users : internalUsers || internalUsersState;

  // ============================================================================
  // API & DATA FETCHING
  // ============================================================================

  const handleSearchUserInBusiness = async (email: string) => {
    try {
      const response = await dispatch(searchUserInBusiness(email)).unwrap();
      return response;
    } catch (error: any) {
      // enqueueSnackbar(`🎯 [AccessRight] Error searching user in business: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      return null;
    }
  }

  const fetchCitizenData = useCallback(async () => {
    setIsLoadingCitizenData(true);
    setCitizenDataError(null);

    try {
      await dispatch(citizenGetAll()).unwrap();
      setIsLoadingCitizenData(false);
    } catch (error: any) {
      // enqueueSnackbar(`🎯 [AccessRight] Error fetching citizen data: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      setIsLoadingCitizenData(false);
      setCitizenDataError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง");
    }
  }, [dispatch]);

  const searchEmailViaAPI = useCallback(async (email: string) => {
    if (!EmailUtils.isSearchable(email)) return null;

    setIsSearching(true);

    try {
      const response = await dispatch(citizenSearchByEmail(email)).unwrap();
      const foundUsers = UserUtils.convertFromCitizenData(response);
      
      const hasNullId = foundUsers.some(user => user.id === null);
      
      if (foundUsers.length === 0 || hasNullId) {
        setEmailsNotFoundInAPI(prev => new Set(prev).add(email.toLowerCase()));
        // แจ้งเตือนเมื่ออีเมลไม่พบในระบบ
        if (!notifiedEmails.current.has(email.toLowerCase())) {
          notifiedEmails.current.add(email.toLowerCase());
          enqueueSnackbar("อีเมลดังกล่าวไม่พบในระบบ, แต่คุณสามารถเพิ่มอีเมลนี้ในเอกสารได้", {
            variant: "info",
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
        }
      } else {
        setEmailsNotFoundInAPI(prev => {
          const newSet = new Set(prev);
          newSet.delete(email.toLowerCase());
          return newSet;
        });
        // ลบออกจาก tracking เมื่อพบอีเมลในระบบ
        notifiedEmails.current.delete(email.toLowerCase());
      }
      
      setIsSearching(false);
      return foundUsers;
    } catch (error: any) {
      // enqueueSnackbar(`🎯 [AccessRight] Error searching email: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      
      if (error?.response?.status === 404) {
        setEmailsNotFoundInAPI(prev => new Set(prev).add(email.toLowerCase()));
        // แจ้งเตือนเมื่ออีเมลไม่พบในระบบ (404 error)
        if (!notifiedEmails.current.has(email.toLowerCase())) {
          notifiedEmails.current.add(email.toLowerCase());
          enqueueSnackbar("อีเมลดังกล่าวไม่พบในระบบ, แต่คุณสามารถเพิ่มอีเมลนี้ในเอกสารได้", {
            variant: "info",
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
        }
        setIsSearching(false);
        return [];
      }
      
      setIsSearching(false);
      return null;
    }
  }, [dispatch, enqueueSnackbar]);

  const performSearch = useCallback(async (searchValue: string) => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // Use external search function if provided, otherwise use internal search
      if (onSearchUsers) {
        const results = await onSearchUsers(searchValue.trim());
        setSearchResults(results);
      } else if (citizenStoreData?.length > 0) {
        const filteredUsers = citizenStoreData.filter((user) => {
          const fullName = `${user.first_name_th} ${user.last_name_th}`.toLowerCase();
          const email = (user.email || "").toLowerCase();
          const department = ((user as any).department || "").toLowerCase();
          const searchLower = searchValue.toLowerCase();

          return fullName.includes(searchLower) || 
                 email.includes(searchLower) || 
                 department.includes(searchLower);
        });
        setSearchResults(UserUtils.convertFromCitizenData(filteredUsers));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      // enqueueSnackbar(`🎯 [AccessRight] Search error: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchUsers, citizenStoreData]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch citizen data on mount
  useEffect(() => {
    fetchCitizenData();
  }, [fetchCitizenData]);

  // Handle debounced search
  useEffect(() => {
    performSearch(debouncedInput);
  }, [debouncedInput, performSearch]);

  // Reset state when access type changes
  useEffect(() => {
    setTempSelectedUsers([]);
    setInputValue("");
    setSearchResults([]);
    setIsSearching(false);
    setExpandedCompanies({});
    setSelectedDepts({});
    setDisplayedUserCount(CONSTANTS.DEFAULT_DISPLAYED_USER_COUNT);
    setEmailsNotFoundInAPI(new Set());
  }, [accessType]);

  // Update internal users state when external users change
  useEffect(() => {
    if (onUsersChange) {
      setInternalUsersState(users || []);
    }
  }, [users, onUsersChange]);

  // Initialize user roles when users change
  useEffect(() => {
    if (Array.isArray(currentUsers)) {
      const newRoles: { [email: string]: string } = {};
      currentUsers.forEach((user) => {
        if (user.email && !selectedUserRoles[user.email]) {
          newRoles[user.email] = CONSTANTS.DEFAULT_ROLE_ID;
        }
      });

      if (Object.keys(newRoles).length > 0) {
        setSelectedUserRoles((prev) => ({ ...prev, ...newRoles }));
      }
    }
  }, [currentUsers, selectedUserRoles]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const updateUsers = useCallback((newUsers: AccessUser[] | "all") => {
    if (onUsersChange) {
      onUsersChange(newUsers);
    } else if (onInternalUsersChange) {
      onInternalUsersChange(newUsers);
    } else {
      setInternalUsersState(newUsers);
    }
  }, [onUsersChange, onInternalUsersChange]);

  const resetStatesByAccessType = useCallback((newAccessType: "public" | "private" | "department") => {
    if (onAccessTypeChange) {
      onAccessTypeChange(newAccessType);
    }

    setTempSelectedUsers([]);
    setInputValue("");
    setDisplayedUserCount(CONSTANTS.DEFAULT_DISPLAYED_USER_COUNT);
    setEmailsNotFoundInAPI(new Set());

    if (newAccessType === "public") {
      if (onUsersChange) onUsersChange("all");
      if (onDepartmentsChange) onDepartmentsChange("all");
    } else if (newAccessType === "private") {
      if (onDepartmentsChange) onDepartmentsChange("all");
      if (accessType !== "private" && onUsersChange) {
        onUsersChange("all");
      }
    } else if (newAccessType === "department") {
      if (onUsersChange) onUsersChange("all");
      if (accessType !== "department" && onDepartmentsChange) {
        onDepartmentsChange("all");
      }
    }
  }, [accessType, onAccessTypeChange, onUsersChange, onDepartmentsChange]);

  const handleRemoveUser = useCallback((userEmail: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (Array.isArray(currentUsers)) {
      const newUsers = currentUsers.filter((user) => user.email !== userEmail);
      const newRoles = { ...selectedUserRoles };
      delete newRoles[userEmail];
      setSelectedUserRoles(newRoles);
      // updateUsers(newUsers.length ? newUsers : "all");
      //mapping newUsers
      const mappingUsers = newUsers?.map((user : any) => ({
        ...user,
        role: "Member",
        id: user.account_id ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
      }));
      updateUsers(mappingUsers);
    }
  }, [currentUsers, selectedUserRoles, updateUsers]);

  const handleRemoveAllUsers = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUserRoles({});
    updateUsers("all");
  }, [updateUsers]);

  const handleAddUsers = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const allSelectedUsers = [...tempSelectedUsers];
    const currentInputValue = inputValue || "";
    if (currentInputValue.trim() && !allSelectedUsers.includes(currentInputValue.trim())) {
      allSelectedUsers.push(currentInputValue.trim());
    }

    if (allSelectedUsers.length === 0) return;

    const newUsers: AccessUser[] = [];
    const addedNewEmails: string[] = [];

    if (!AddUserOutside) {
      // Business-only search and add
      for (const email of allSelectedUsers) {
        if (Array.isArray(currentUsers) && currentUsers.some((u) => u.email === email)) {
          continue;
        }

        if (!EmailUtils.isSearchable(email)) {
          continue;
        }

        const response = await handleSearchUserInBusiness(email);
        if (response) {
          const data: any = (response as any)?.data ?? response;
          const accountId = data?.account_id ?? null;
          const primaryEmail = Array.isArray(data?.email) ? (data?.email[0] || email) : (data?.email || email);
          const firstName = data?.first_name_th || data?.first_name_eng || "";
          const lastName = data?.last_name_th || data?.last_name_eng || "";
          const displayName = `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim() || primaryEmail;

          newUsers.push({
            id: accountId,
            name: displayName,
            email: primaryEmail.email,
            role: "Member",
          });
        } else {
          enqueueSnackbar(`ไม่พบผู้ใช้สำหรับอีเมล: ${email}`, { variant: "warning", autoHideDuration: 3000 });
        }
      }
    } else {
      for (const email of allSelectedUsers) {
        // Check if user already exists in current users
        if (Array.isArray(currentUsers) && currentUsers.some((u) => u.email === email)) {
          continue;
        }

        // Check if email is valid format
        if (!EmailUtils.isSearchable(email)) {
          newUsers.push(UserUtils.createFromEmail(email, citizenStoreData));
          continue;
        }

        // Search for user in API
        const foundUsers = await searchEmailViaAPI(email);
        
        if (foundUsers && foundUsers.length > 0) {
          const foundUser = foundUsers[0];
          
          if (foundUser.id === null) {
            newUsers.push(UserUtils.createFromEmail(email, citizenStoreData));
            addedNewEmails.push(email);
          } else {
            if (foundUser.email.toLowerCase() === email.toLowerCase()) {
              newUsers.push({
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: "Member",
                department: foundUser.department,
              });
            } else {
              newUsers.push(UserUtils.createFromEmail(email, citizenStoreData));
              addedNewEmails.push(email);
            }
          }
        } else if (foundUsers && foundUsers.length === 0) {
          newUsers.push(UserUtils.createFromEmail(email, citizenStoreData));
          addedNewEmails.push(email);
        } else {
          // enqueueSnackbar(`🎯 [AccessRight] Skipping email ${email} due to API error`, {
          //   variant: "warning",
          //   autoHideDuration: 3000,
          // });
        }
      }
    }

    if (newUsers.length > 0) {
      
      let mappingUsers: AccessUser[] = [];
      if (Array.isArray(currentUsers)) {
      mappingUsers = currentUsers?.map((user: any) => ({
        ...user,
        role: "Member",
        id: user.account_id ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
        // department: user.department ?? "",
      }));
      }
      if (Array.isArray(currentUsers)) {
        updateUsers([...mappingUsers, ...newUsers]);
      } else {
        updateUsers(newUsers);
      }

      // แจ้งเตือนเมื่อเพิ่มอีเมลใหม่ที่ไม่พบในระบบ
      if (addedNewEmails.length > 0 && AddUserOutside) {
        enqueueSnackbar(`เพิ่มอีเมลใหม่ ${addedNewEmails.length} รายการที่ไม่พบในระบบแล้ว`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
      }
    }

    setTempSelectedUsers([]);
    setInputValue("");
    setEmailsNotFoundInAPI(new Set());
  }, [tempSelectedUsers, inputValue, currentUsers, searchEmailViaAPI, citizenStoreData, updateUsers, enqueueSnackbar]);

  const handleChangeUserRole = useCallback((userEmail: string, roleId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (Array.isArray(currentUsers)) {
      setSelectedUserRoles((prev) => ({
        ...prev,
        [userEmail]: roleId,
      }));

      const roleName = roleData.find((r) => r.key === roleId)?.label || "Member";
      const updatedUsers = currentUsers?.map((user) => {
        if (user.email === userEmail) {
          return { ...user, role: roleName };
        }
        return user;
      });

      updateUsers(updatedUsers);
    }
  }, [currentUsers, updateUsers]);

  // Department handlers
  const handleSelectDepartment = useCallback((companyName: string, selectedDepartments: string[]) => {
    if (selectedDepartments.includes("SELECT_ALL")) {
      const company = actualCompanyData.find((c) => c.name === companyName);
      if (company && onDepartmentsChange) {
        if (departments !== "all") {
          const updatedDepartments = { ...departments };
          updatedDepartments[companyName] = [...company.departments];
          onDepartmentsChange(updatedDepartments);
        } else {
          onDepartmentsChange({
            [companyName]: [...company.departments],
          });
        }
      }
      return;
    }

    if (onDepartmentsChange) {
      if (departments !== "all") {
        const updatedDepartments = { ...departments };

        if (selectedDepartments.length > 0) {
          updatedDepartments[companyName] = selectedDepartments;
        } else {
          delete updatedDepartments[companyName];
        }

        onDepartmentsChange(
          Object.keys(updatedDepartments).length > 0 ? updatedDepartments : "all"
        );
      } else if (selectedDepartments.length > 0) {
        onDepartmentsChange({
          [companyName]: selectedDepartments,
        });
      }
    }
  }, [departments, onDepartmentsChange, actualCompanyData]);

  const handleRemoveDepartment = useCallback((company: string, dept: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (departments !== "all" && onDepartmentsChange) {
      const newDepartments = { ...departments };
      const deptIndex = newDepartments[company].indexOf(dept);

      if (deptIndex !== -1) {
        newDepartments[company] = [
          ...newDepartments[company].slice(0, deptIndex),
          ...newDepartments[company].slice(deptIndex + 1),
        ];

        if (newDepartments[company].length === 0) {
          delete newDepartments[company];
        }

        onDepartmentsChange(
          Object.keys(newDepartments).length ? newDepartments : "all"
        );
      }
    }
  }, [departments, onDepartmentsChange]);

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const getPaginatedUserOptions = useCallback((): UserOption[] => {
    const emailsToFilter = Array.isArray(currentUsers)
      ? currentUsers?.map((u) => u.email)
      : [];

    const sourceData = searchResults.length > 0 ? searchResults : [];

    const allOptions: UserOption[] = sourceData
      .filter((user) => !emailsToFilter.includes(user.email))
      .map((user) => ({
        value: user.email,
        label: (
          <div className="flex flex-col">
            <span className="font-medium">{user.email}</span>
            {user.name && (
              <span className="text-xs text-gray-500">
                {user.name}
                {user.department && ` - ${user.department}`}
              </span>
            )}
            {user.id === null && (
              <span className="text-xs text-orange-600">อีเมลใหม่</span>
            )}
          </div>
        ),
        searchValue: `${user.email} ${user.name} ${user.department || ""}`,
      }));

    // If user is typing and has valid email format, show it as an option
    const currentInputValue = inputValue || "";
    if (currentInputValue.trim() && EmailUtils.isSearchable(currentInputValue.trim()) && !emailsToFilter.includes(currentInputValue.trim())) {
      const isEmailNotFound = emailsNotFoundInAPI.has(currentInputValue.trim().toLowerCase());
      allOptions.unshift({
        value: currentInputValue.trim(),
        label: (
          <div className="flex flex-col">
            <span>{currentInputValue.trim()}</span>
            {isEmailNotFound && (
              <span className="text-xs text-orange-500">อีเมลใหม่</span>
            )}
          </div>
        ),
        searchValue: currentInputValue.trim(),
      });
    }

    return allOptions;
  }, [currentUsers, searchResults, inputValue, emailsNotFoundInAPI]);

  const handleEmailInputKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    const currentInputValue = inputValue || "";
    
    if (e.key === "Enter" && currentInputValue.trim()) {
      e.preventDefault();
      
      const trimmedValue = currentInputValue.trim();
      
      if (!EmailUtils.isSearchable(trimmedValue)) {
        if (!tempSelectedUsers.includes(trimmedValue)) {
          setTempSelectedUsers([trimmedValue]);
        }
        setInputValue("");
        return;
      }

      if (AddUserOutside) {
        const foundUsers = await searchEmailViaAPI(trimmedValue);
        
        if (foundUsers && foundUsers.length > 0) {
          const foundUser = foundUsers[0];
          const foundEmail = foundUser.email;
          
          if (foundUser.id === null) {
            if (!tempSelectedUsers.includes(trimmedValue)) {
              setTempSelectedUsers([trimmedValue]);
            }
          } else {
            if (foundEmail.toLowerCase() === trimmedValue.toLowerCase()) {
              if (!tempSelectedUsers.includes(foundEmail)) {
                setTempSelectedUsers([foundEmail]);
              }
            } else {
              if (!tempSelectedUsers.includes(trimmedValue)) {
                setTempSelectedUsers([trimmedValue]);
              }
            }
          }
        } else if (foundUsers && foundUsers.length === 0) {
          if (!tempSelectedUsers.includes(trimmedValue)) {
            setTempSelectedUsers([trimmedValue]);
          }
        } else {
          // enqueueSnackbar(`Skipping email ${trimmedValue} due to API error`, {
          //   variant: "warning",
          //   autoHideDuration: 3000,
          // });
        }
      } else {
        setIsUserBusiness(false);
        // enqueueSnackbar(`trimmedValue => ${trimmedValue}`, {
        //   variant: "info",
        //   autoHideDuration: 3000,
        // });
        const response = await handleSearchUserInBusiness(trimmedValue);
        // enqueueSnackbar(`response searchUserInBusiness => ${response}`, {
        //   variant: "info",
        //   autoHideDuration: 3000,
        // });
        if (response) {
          setIsUserBusiness(true);
        } else {
          enqueueSnackbar("ไม่พบผู้ใช้งานในธุรกิจนี้", {
            variant: "warning",
            autoHideDuration: 3000,
          });
        }
      }
      setInputValue("");
    } else {
      setIsUserBusiness(false);
    }
  }, [inputValue, tempSelectedUsers, searchEmailViaAPI, enqueueSnackbar]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderUserSelectionInterface = () => (
    <div className="flex gap-2 min-h-8 w-full">
      <Select
        style={{ width: "100%" }}
        className="[&_.ant-select]:!rounded-xl [&_.ant-select-outlined]:!rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selection-search]:!rounded-xl [&_.ant-select-selection-item]:!rounded-xl"
        suffixIcon={null}
        prefix={<Mail size={16} color="#C4C4C4" className="mr-1" />}
        placeholder="กรอกอีเมลและกด Enter เพื่อค้นหา"
        showSearch
        mode="tags"
        maxTagCount={1}
        value={tempSelectedUsers}
        searchValue={inputValue}
        onChange={(values) => {
          const filteredValues = Array.isArray(values)
            ? values.filter((v) => v !== "show_more")
            : [values].filter((v) => v && v !== "show_more");
          const newValues = filteredValues.slice(-1);
          setTempSelectedUsers(newValues);
          if (newValues.length > 0) {
            setInputValue("");
          }
        }}
        onSearch={setInputValue}
        onInputKeyDown={handleEmailInputKeyDown}
        options={getPaginatedUserOptions()}
        filterOption={(input, option) => {
          if (option?.value === "show_more") return false;
          return (option?.searchValue || "")
            .toLowerCase()
            .includes(input.toLowerCase());
        }}
        tokenSeparators={[","]}
        notFoundContent={
          isSearching ? (
            <div className="p-2 text-center text-gray-500">
              <div>กำลังค้นหาอีเมล...</div>
            </div>
          ) : (inputValue || "").trim() && !EmailUtils.isSearchable((inputValue || "").trim()) ? (
            <div className="p-2 text-center text-orange-500">
              <div>รูปแบบอีเมลไม่ถูกต้อง</div>
              <div className="text-xs mt-1">กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง เช่น example@mail.com</div>
            </div>
          ) : (
            <div className="p-2 text-center text-gray-500">
              <div>กรอกอีเมลที่ต้องการเพิ่ม</div>
              <div className="text-xs mt-1">เช่น example@mail.com และกด Enter เพื่อเพิ่มอีเมลใหม่</div>
            </div>
          )
        }
        tagRender={(props) => {
          const { value, closable, onClose } = props;
          const safeValue = value || "";
          const existingUser = actualUserData.find((u) => u.email === safeValue) || searchResults.find((u) => u.email === safeValue);
          const displayLabel = existingUser ? existingUser.name || safeValue : safeValue;
          const isNewEmail = !existingUser;
          const isValidEmailFormat = EmailUtils.isValid(safeValue);
          const isEmailFrom404 = emailsNotFoundInAPI.has(safeValue.toLowerCase());
          const isEmailWithNullId = existingUser && existingUser.id === null;

          // แจ้งเตือนเมื่อแสดง tag ของอีเมลที่ไม่พบในระบบ
          if ((isEmailFrom404 || isEmailWithNullId) && isValidEmailFormat) {
            // ใช้ setTimeout เพื่อหลีกเลี่ยงการเรียกซ้ำ
            if (!notifiedEmails.current.has(safeValue.toLowerCase())) {
              notifiedEmails.current.add(safeValue.toLowerCase());
              setTimeout(() => {
                enqueueSnackbar("อีเมลดังกล่าวไม่พบในระบบ, แต่คุณสามารถเพิ่มอีเมลนี้ในเอกสารได้", {
                  variant: "info",
                  autoHideDuration: 4000,
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "center",
                  },
                });
              }, 100);
            }
          }

          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                isNewEmail
                  ? isValidEmailFormat
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
              style={{ marginRight: 3 }}
            >
              {isNewEmail && (
                <span className="mr-1">
                  {isValidEmailFormat ? "📧" : "⚠️"}
                </span>
              )}
              {displayLabel}
              {(isEmailFrom404 || isEmailWithNullId) && (
                <span className="ml-1 text-xs text-orange-600">(อีเมลใหม่)</span>
              )}
              {closable && (
                <button
                  className="ml-1 text-current hover:text-red-600"
                  onClick={onClose}
                >
                  ×
                </button>
              )}
            </span>
          );
        }}
      />
      <button
        className="flex items-center justify-center gap-1 border border-theme !text-[#0153BD] bg-white min-w-[100px] hover:bg-theme hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4"
        onClick={handleAddUsers}
        disabled={
          (tempSelectedUsers.length === 0 && (!(inputValue || "").trim() || !EmailUtils.isSearchable((inputValue || "").trim()))) 
          || tempSelectedUsers.some(email => !EmailUtils.isValid(email))
          || isSearching || (!AddUserOutside && !isUserBusiness)
        }
      >
        <Plus size={16} />
        <span className="hidden md:block">
          {isSearching ? "กำลังค้นหา..." : "เพิ่ม"}
        </span>
      </button>
    </div>
  );

  const renderAccessTypeSelector = () => {
    if (!showAccessTypeSelector) return null;

    return (
      <div className="mb-4">
        <label className="mb-2 block">{title}</label>
        <Radio.Group
          value={accessType}
          onChange={(e) => resetStatesByAccessType(e.target.value)}
          disabled={readOnly}
        >
          <Space direction="horizontal">
            {!isSettingDocument && <Radio value="public">ทุกคน</Radio>}
            <Radio value="private">รายบุคคล</Radio>
          </Space>
        </Radio.Group>
      </div>
    );
  };

  const renderSelectedUsers = () => {
    if (!Array.isArray(currentUsers) || currentUsers.length === 0) return null;

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <Typography.Text className="text-sm text-[#636363] block">
            รายชื่อผู้มีสิทธิ์เข้าถึงทั้งหมด {currentUsers.length} รายการ
          </Typography.Text>
          {!readOnly && (
            <button
              onClick={handleRemoveAllUsers}
              className="text-xs text-[#989898] p-0 flex items-center gap-1 underline"
            >
              ลบทั้งหมด
            </button>
          )}
        </div>
        <div className="space-y-4 max-h-[250px] overflow-y-auto">
          {currentUsers?.map((user, index) => {
            const roleName =
              roleData.find((r) => r.key === selectedUserRoles[user.email])?.label ||
              user.role ||
              "Member";
            const isExistingUser = actualUserData.some((u) => u.email === user.email) || 
                                   searchResults.some((u) => u.email === user.email);
            const isUserEmailValid = EmailUtils.isValid(user.email);
            const isEmailFrom404 = emailsNotFoundInAPI.has(user.email.toLowerCase());
            const isEmailWithNullId = user.id === null;

            // แจ้งเตือนเมื่อแสดงรายการผู้ใช้ที่มีอีเมลที่ไม่พบในระบบ
            if ((isEmailFrom404 || isEmailWithNullId) && isUserEmailValid && !isExistingUser) {
              // ใช้ setTimeout เพื่อหลีกเลี่ยงการเรียกซ้ำ
              if (!notifiedEmails.current.has(user.email.toLowerCase())) {
                notifiedEmails.current.add(user.email.toLowerCase());
                setTimeout(() => {
                  enqueueSnackbar("อีเมลดังกล่าวไม่พบในระบบ, แต่คุณสามารถเพิ่มอีเมลนี้ในเอกสารได้", {
                    variant: "info",
                    autoHideDuration: 4000,
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "center",
                    },
                  });
                }, 100);
              }
            }

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <UserCircle2 size={20} className="text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{user.name || user.email}</span>
                      {!isExistingUser && isUserEmailValid && user.id === null && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                          อีเมลใหม่
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-2">
                    {!hideRoleDropdown && (
                      <Dropdown
                        menu={{
                          items: roleData?.map((role) => ({
                            key: role.key,
                            label: role.label,
                            onClick: (e) => {
                              handleChangeUserRole(
                                user.email,
                                role.key,
                                e.domEvent as React.MouseEvent
                              );
                            },
                          })),
                        }}
                        trigger={["click"]}
                      >
                        <div className="px-2 py-1 border border-[#FAFAFA] rounded-lg text-sm cursor-pointer flex items-center gap-1">
                          {roleName}
                          <ChevronDown size={16} color="#0153BD" />
                        </div>
                      </Dropdown>
                    )}
                    <Button
                      type="text"
                      icon={<Trash size={16} color="#0153BD" />}
                      onClick={(e) => handleRemoveUser(user.email, e)}
                      className="hover:bg-gray-100 border border-[#FAFAFA]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderDepartmentSelection = () => {
    if (readOnly) return null;

    return (
      <div className="mb-4">
        <Typography.Text className="block mb-1">
          แผนกที่มีสิทธิ์เข้าถึง
        </Typography.Text>
        <Typography.Text className="block text-sm text-[#636363] mb-3">
          บริษัททั้งหมด {actualCompanyData.length} รายการ
        </Typography.Text>
        <div className="space-y-4 max-h-[250px] overflow-y-auto">
          {actualCompanyData?.map((company) => {
            const selectedDeptsForCompany =
              departments !== "all" && departments[company.name]
                ? departments[company.name]
                : [];
            const allDeptsSelected =
              selectedDeptsForCompany.length === company.departments.length &&
              company.departments.length > 0;

            return (
              <div key={company.name}>
                <div className="flex justify-between flex-wrap items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-theme" />
                    <Typography.Text strong>{company.name}</Typography.Text>
                  </div>
                </div>
                <Select
                  style={{ width: "100%" }}
                  mode="multiple"
                  placeholder="เลือกแผนก"
                  value={selectedDeptsForCompany}
                  onChange={(value) => handleSelectDepartment(company.name, value)}
                  options={[
                    {
                      value: "SELECT_ALL",
                      label: "เลือกทั้งหมด",
                      disabled: allDeptsSelected,
                    },
                    ...company?.departments
                      .filter((dept) => !selectedDeptsForCompany.includes(dept))
                      .map((dept) => ({
                        value: dept,
                        label: dept,
                      })),
                  ]}
                  maxTagCount={3}
                />

                {departments !== "all" && selectedDeptsForCompany.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedDeptsForCompany
                        ?.slice(0, expandedCompanies[company.name] ? undefined : 6)
                        .map((dept, deptIndex) => (
                          <div
                            key={deptIndex}
                            className="px-2 py-1 bg-[#F0F6FF] rounded-full text-sm flex items-center gap-1"
                          >
                            <span className="text-theme">{dept}</span>
                            {!readOnly && (
                              <button
                                className="flex items-center justify-center p-0"
                                onClick={(e) => handleRemoveDepartment(company.name, dept, e)}
                              >
                                <X size={16} className="text-theme" />
                              </button>
                            )}
                          </div>
                        ))}
                    </div>

                    {selectedDeptsForCompany.length > 6 && (
                      <div className="w-full flex justify-center mt-2">
                        {!expandedCompanies[company.name] ? (
                          <button
                            className="text-xs text-theme p-0 flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedCompanies((prev) => ({
                                ...prev,
                                [company.name]: true,
                              }));
                            }}
                          >
                            <span className="underline">ดูเพิ่มเติม</span>
                            <ChevronDown size={16} />
                          </button>
                        ) : (
                          <button
                            className="text-xs text-theme p-0 flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedCompanies((prev) => ({
                                ...prev,
                                [company.name]: false,
                              }));
                            }}
                          >
                            <span className="underline">ย่อลง</span>
                            <ChevronUp size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAccessContent = () => {
    switch (accessType) {
      case "private":
        return (
          <div className="mt-3">
            {!readOnly && (
              <div className="mb-4">
                <Typography.Text className="block mb-1">
                  {addUserText}
                </Typography.Text>
                {renderUserSelectionInterface()}
              </div>
            )}
            {renderSelectedUsers()}
          </div>
        );

      case "department":
        return (
          <div className="mt-3">
            {renderDepartmentSelection()}
            {departments === "all" && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <Typography.Text className="text-sm text-gray-600">
                  ทุกแผนกสามารถเข้าถึงได้
                </Typography.Text>
              </div>
            )}
          </div>
        );

      case "public":
      default:
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <Typography.Text className="text-sm text-gray-600">
              ทุกคนในระบบสามารถเข้าถึงได้
            </Typography.Text>
          </div>
        );
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="access-rights-container">
      {showAccessTypeSelector ? (
        <>
          {renderAccessTypeSelector()}
          {renderAccessContent()}
        </>
      ) : (
        <div className="mt-3">
          {!readOnly && (
            <div className="mb-4">
              <Typography.Text className="block mb-1">
                {addUserText}
              </Typography.Text>
              <div className="flex gap-2">{renderUserSelectionInterface()}</div>
            </div>
          )}
          {renderSelectedUsers()}
        </div>
      )}
    </div>
  );
};

export default AccessRight;
