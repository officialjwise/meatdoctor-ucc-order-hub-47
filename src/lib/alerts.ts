
import Swal from 'sweetalert2';

// Success alert
export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#10B981', // Green color for success
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error alert
export const showErrorAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#EF4444', // Red color for error
  });
};

// Warning alert
export const showWarningAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#F59E0B', // Amber color for warning
  });
};

// Info alert
export const showInfoAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#3B82F6', // Blue color for info
  });
};

// Confirmation alert
export const showConfirmationAlert = (
  title: string,
  message: string,
  confirmButtonText: string = 'Yes',
  cancelButtonText: string = 'Cancel'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#10B981',
    cancelButtonColor: '#6B7280',
  });
};

// Toast notification (still available but we'll prefer SweetAlert for important notifications)
export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  
  return Toast.fire({
    icon,
    title
  });
};
