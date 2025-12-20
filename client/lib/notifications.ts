import { toast } from "sonner";

/**
 * Show a success notification
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    description: new Date().toLocaleTimeString(),
  });
};

/**
 * Show an error notification
 * Handles string messages or complex error objects from API
 */
export const showError = (error: any) => {
  let message = "An unexpected error occurred. Please try again.";

  if (typeof error === "string") {
    message = error;
  } else if (error?.response?.data) {
    // Extract error from API response
    const data = error.response.data;
    if (typeof data === "string") {
      message = data;
    } else if (data.detail) {
      message = data.detail;
    } else if (data.error) {
      message = data.error;
    } else if (Array.isArray(data)) {
      message = data[0];
    } else {
      // Handle field-level errors (e.g., { email: ["Already exists"] })
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        message = firstError[0];
      } else if (typeof firstError === "string") {
        message = firstError;
      }
    }
  } else if (error?.message) {
    message = error.message;
  }

  toast.error("Error", {
    description: message,
  });
};
