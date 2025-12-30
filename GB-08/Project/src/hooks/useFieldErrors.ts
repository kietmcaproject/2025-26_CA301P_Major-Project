import { useCallback, useState } from 'react';

type FieldErrors = Record<string, string | undefined>;

export function useFieldErrors() {
  const [errors, setErrors] = useState<FieldErrors>({});

  const setFieldError = useCallback((key: string, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }, []);

  const getError = useCallback((key: string) => {
    const v = errors[key];
    if (v == null) return undefined;
    // Defensive: ensure callers always receive a string (avoid React rendering objects)
    return typeof v === 'string' ? v : JSON.stringify(v);
  }, [errors]);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  // serverErrors can be an object like { field: 'msg' } or nested { hr: { email: 'msg' } }
  const applyServerErrors = useCallback((serverErrors: any) => {
    if (!serverErrors || typeof serverErrors !== 'object') return;
    const flattened: Record<string, string> = {};

    const flatten = (obj: any, prefix = '') => {
      // If primitive, record it
      if (obj == null || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        flattened[prefix] = String(obj);
        return;
      }
      // If it's an object with a message property, treat it as a leaf
      if (obj && typeof obj === 'object' && typeof obj.message === 'string') {
        flattened[prefix] = obj.message;
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`));
        return;
      }
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((k) => {
          const nextKey = prefix ? `${prefix}.${k}` : k;
          flatten(obj[k], nextKey);
        });
      }
    };

    flatten(serverErrors);

    // normalize some common patterns (hr.email -> hrEmail)
    const normalized: Record<string, string> = {};
    Object.keys(flattened).forEach((k) => {
      const v = flattened[k];
      if (/^hr\.(email|phone)$/i.test(k)) {
        const m = k.split('.')[1];
        normalized[`hr${m.charAt(0).toUpperCase() + m.slice(1)}`] = v;
      } else {
        normalized[k] = v;
      }
    });

    setErrors((prev) => ({ ...prev, ...normalized }));
  }, []);

  return {
    errors,
    setFieldError,
    getError,
    clearError,
    clearAll,
    applyServerErrors,
  } as const;
}
