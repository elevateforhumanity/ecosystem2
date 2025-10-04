import { useToast } from '../components/Toast';

export function useNotification() {
  const toast = useToast();

  return {
    success: (message, duration) => toast.success(message, duration),
    error: (message, duration) => toast.error(message, duration),
    warning: (message, duration) => toast.warning(message, duration),
    info: (message, duration) => toast.info(message, duration),
  };
}
