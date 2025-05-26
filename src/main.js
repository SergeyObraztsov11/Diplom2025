import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { useThemeStore } from "@stores/theme";

// VITE_FIREBASE_API_KEY=AIzaSyDho8uikVOpwNiQqRB1Hz8q2VALDo-M5wc
// VITE_FIREBASE_AUTH_DOMAIN=my-vue-project-b3bc2.firebaseapp.com
// VITE_FIREBASE_DATABASE_URL=https://my-vue-project-b3bc2-default-rtdb.europe-west1.firebasedatabase.app
// VITE_FIREBASE_PROJECT_ID=my-vue-project-b3bc2
// VITE_FIREBASE_STORAGE_BUCKET=my-vue-project-b3bc2.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=1078851671214
// VITE_FIREBASE_APP_ID=1:1078851671214:web:103f519a53fc2c6791093f

const firebaseConfig = {
    apiKey: "AIzaSyDho8uikVOpwNiQqRB1Hz8q2VALDo-M5wc",
    authDomain: "my-vue-project-b3bc2.firebaseapp.com",
    databaseURL:
        "https://my-vue-project-b3bc2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "my-vue-project-b3bc2",
    storageBucket: "my-vue-project-b3bc2.appspot.com",
    messagingSenderId: "1078851671214",
    appId: "1:1078851671214:web:103f519a53fc2c6791093f",
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

useThemeStore().initTheme();

app.mount("#app");
