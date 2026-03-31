import { useTheme } from "@/lib/ThemeContext";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors={false}
      expand={false}
      visibleToasts={3}
      offset="max(16px, env(safe-area-inset-top, 16px))"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: 'atlas-sonner-toast',
          title: 'atlas-sonner-title',
          description: 'atlas-sonner-desc',
          success: 'atlas-sonner-success',
          error: 'atlas-sonner-error',
          warning: 'atlas-sonner-warning',
          info: 'atlas-sonner-info',
          closeButton: 'atlas-sonner-close',
          icon: 'atlas-sonner-icon',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
