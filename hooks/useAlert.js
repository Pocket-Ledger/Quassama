import { useState } from 'react';

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const showAlert = ({
    type = 'success',
    title,
    message,
    onConfirm,
    showCancel = false,
    confirmText = 'OK',
    cancelText = 'Cancel',
  }) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm,
      showCancel,
      confirmText,
      cancelText,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Convenience methods for different alert types
  const showSuccess = (title, message, onConfirm) => {
    showAlert({ type: 'success', title, message, onConfirm });
  };

  const showError = (title, message, onConfirm) => {
    showAlert({ type: 'error', title, message, onConfirm });
  };

  const showWarning = (title, message, onConfirm, showCancel = false) => {
    showAlert({ type: 'warning', title, message, onConfirm, showCancel });
  };

  const showInfo = (title, message, onConfirm) => {
    showAlert({ type: 'info', title, message, onConfirm });
  };

  const showConfirm = (
    title,
    message,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showAlert({
      type: 'warning',
      title,
      message,
      onConfirm,
      showCancel: true,
      confirmText,
      cancelText,
    });
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};
