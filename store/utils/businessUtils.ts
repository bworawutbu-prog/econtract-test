import { getCurrentUserBusinessId } from "@/store/token";

// Utility functions for business-related operations
export class BusinessUtils {
  /**
   * Get the current business ID
   * @returns string - The current business ID
   */
  static getBusinessId(): string {
    return getCurrentUserBusinessId();
  }

  /**
   * Check if the current business ID is the test business ID
   * @returns boolean - True if using test business ID
   */
  static isTestBusiness(): boolean {
    return this.getBusinessId() === "5228881808066777";
  }

  /**
   * Get business ID for API calls
   * @param overrideBusinessId - Optional override business ID
   * @returns string - Business ID to use
   */
  static getBusinessIdForAPI(overrideBusinessId?: string): string {
    return overrideBusinessId || this.getBusinessId();
  }

  /**
   * Validate business ID format
   * @param businessId - Business ID to validate
   * @returns boolean - True if valid format
   */
  static isValidBusinessId(businessId: string): boolean {
    // Basic validation - business ID should be numeric and have reasonable length
    return /^\d{10,20}$/.test(businessId);
  }

  /**
   * Get business context for logging and debugging
   * @returns object - Business context information
   */
  static getBusinessContext() {
    return {
      businessId: this.getBusinessId(),
      isTestBusiness: this.isTestBusiness(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export default instance for convenience
export default BusinessUtils; 