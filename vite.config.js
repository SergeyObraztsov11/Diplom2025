import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@stores": path.resolve(__dirname, "./src/stores"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@ui": path.resolve(__dirname, "./src/ui"),
            "@assets": path.resolve(__dirname, "./src/assets"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@modals": path.resolve(__dirname, "./src/modals"),
            "@layouts": path.resolve(__dirname, "./src/layouts"),
        },
    },
    plugins: [vue()],
});
