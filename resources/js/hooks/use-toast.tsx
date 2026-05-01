import React, { useCallback, useContext, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    toasts: Toast[];
    toast: (toast: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
    undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(
        ({ title, description, variant }: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast: Toast = { id, title, description, variant };
            setToasts((prev) => [...prev, newToast]);

            // Auto dismiss after 10 seconds for error toasts, 5 seconds for others
            const duration = variant === 'destructive' ? 10000 : 5000;
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        },
        [],
    );

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`max-w-md min-w-[300px] animate-in rounded-lg border p-4 shadow-lg slide-in-from-right-full ${
                            toast.variant === 'destructive'
                                ? 'border-red-600 bg-red-600 text-white'
                                : 'border-border bg-background text-foreground'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                {toast.title && (
                                    <h4 className="font-medium">
                                        {toast.title}
                                    </h4>
                                )}
                                {toast.description && (
                                    <p
                                        className={`mt-1 text-sm ${
                                            toast.variant === 'destructive'
                                                ? 'text-red-100'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {toast.description}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => dismiss(toast.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
