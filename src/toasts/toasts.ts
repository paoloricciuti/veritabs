import { toast } from "@zerodevx/svelte-toast";
import type { SvelteToastOptions } from "@zerodevx/svelte-toast";

const success = (text: string, options: SvelteToastOptions = {}) => toast.push(text, {
    ...options,
    classes: ["toastbar:bg-green-400", ...(options?.classes ?? [])]
});

const error = (text: string, options: SvelteToastOptions = {}) => toast.push(text, {
    ...options,
    classes: ["toastbar:bg-red-500", ...(options?.classes ?? [])]
});

const info = (text: string, options: SvelteToastOptions = {}) => toast.push(text, {
    ...options,
    classes: ["toastbar:bg-blue-500", ...(options?.classes ?? [])]
});


export {
    success,
    error,
    info,
};