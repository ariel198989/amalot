import { useState } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    type = 'default',
    duration = 5000,
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = { id, title, description, type, duration };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id)
        );
      }, duration);
    }

    return id;
  };

  const dismiss = (toastId: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  };

  return {
    toast,
    dismiss,
    toasts,
  };
} 