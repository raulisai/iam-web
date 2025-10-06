type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    points?: number;
    type: ToastType;
    duration?: number;
}

class ToastStore {
    toasts = $state<Toast[]>([]);
    private nextId = 0;

    show(message: string, type: ToastType = 'success', points?: number, duration: number = 3000) {
        const id = this.nextId++;
        const toast: Toast = { id, message, type, points, duration };
        this.toasts.push(toast);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    success(message: string, points?: number) {
        this.show(message, 'success', points);
    }

    error(message: string) {
        this.show(message, 'error');
    }

    info(message: string) {
        this.show(message, 'info');
    }

    remove(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}

export const toastStore = new ToastStore();
