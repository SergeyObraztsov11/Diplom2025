import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useMessageStore } from "@stores/message";

const THEMES = {
    DARK: "dark",
    LIGHT: "light",
};

export const useThemeStore = defineStore("theme", () => {
    const messageStore = useMessageStore();
    const currentTheme = ref(localStorage.getItem("theme") || THEMES.DARK);

    // Устанавливаем начальную тему в документ
    const initTheme = () => {
        document.documentElement.classList.toggle(
            "dark",
            currentTheme.value === THEMES.DARK
        );
    };

    const toggleTheme = () => {
        currentTheme.value =
            currentTheme.value === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;

        // Сохраняем текущее состояние в localStorage
        localStorage.setItem("theme", currentTheme.value);

        document.documentElement.classList.toggle(
            "dark",
            currentTheme.value === THEMES.DARK
        );
        messageStore.showMessage(`Тема успешно изменена.`);
    };

    return {
        currentTheme,
        toggleTheme,
        initTheme,
    };
});
