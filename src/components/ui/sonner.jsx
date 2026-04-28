import { useTheme } from "@/lib/ThemeContext";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

const DEDUPE_MS = 4500;
const recentToastKeys = new Map();
let patched = false;

function normalizeToastKey(type, message, options = {}) {
  const title = typeof message === 'string' ? message : String(message?.props?.children || message || '');
  const description = typeof options.description === 'string' ? options.description : '';
  return `${type}:${title.trim()}:${description.trim()}`.slice(0, 220);
}

function patchSonnerDedupe() {
  if (patched) return;
  patched = true;

  ['error', 'warning', 'success', 'info', 'message'].forEach((method) => {
    const original = sonnerToast[method]?.bind(sonnerToast);
    if (!original) return;

    sonnerToast[method] = (message, options = {}) => {
      const key = normalizeToastKey(method, message, options);
      const now = Date.now();
      const existing = recentToastKeys.get(key);
      if (existing && now - existing.at < DEDUPE_MS) {
        return original(message, { ...options, id: existing.id });
      }

      const id = options.id || `atlas-${method}-${now}-${Math.random().toString(36).slice(2)}`;
      recentToastKeys.set(key, { id, at: now });
      window.setTimeout(() => {
        const current = recentToastKeys.get(key);
        if (current?.id === id) recentToastKeys.delete(key);
      }, DEDUPE_MS);
      return original(message, { ...options, id });
    };
  });
}

patchSonnerDedupe();

const Toaster = ({ ...props }) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors={false}
      expand
      visibleToasts={2}
      gap={10}
      offset="calc(env(safe-area-inset-top, 0px) + 18px)"
      toastOptions={{
        duration: 3800,
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
