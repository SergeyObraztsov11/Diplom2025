import { defineStore } from "pinia";
import { ref } from "vue";

export const useMessageStore = defineStore("message", () => {
    const TIMEOUT_DELAY = 3000;
    
    const isShow = ref(false);
    const messageText = ref("");
    const timeout = ref(null);

    const showMessage = (text) => {
        if (!text) return;
        messageText.value = text;
        isShow.value = true;
        timeout.value = setTimeout(() => {
            closeMessage();
        }, TIMEOUT_DELAY);
    };

    const closeMessage = () => {
        isShow.value = false;
        messageText.value = "";
        clearTimeout(timeout.value);
        timeout.value = null;
    };
    return { isShow, showMessage, closeMessage, messageText, timeout };
});
