<script setup>
import { ref } from "vue";
import { useAuthStore } from "@stores/auth";
import { useRouter } from "vue-router";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import AuthLayout from "@layouts/AuthLayout.vue";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref(null);

const errors = ref([]);
const isTriedSubmit = ref(false);

// Функция преобразования ошибок Firestore
const parseFirebaseError = (err) => {
    switch (err) {
        case "auth/user-not-found":
            return "Пользователь не найден";
        case "auth/wrong-password":
            return "Неверный пароль";
        case "auth/email-already-in-use":
            return "Почта уже используется";
        case "auth/invalid-email":
            return "Некорректный email";
        case "auth/invalid-credential":
            return "Неверный email или пароль";
        case "auth/too-many-requests":
            return "Слишком много попыток входа. Попробуйте позже.";
        default:
            return "Неизвестная ошибка: " + err;
    }
};

const validateForm = () => {
    const result = [];
    if (!email.value.includes("@")) result.push("Некорректный email");
    if (password.value.length < 6) result.push("Минимум 6 символов в пароле");
    return result;
};

const loginUser = async () => {
    isTriedSubmit.value = true;
    errors.value = validateForm();
    if (errors.value.length > 0) return;
    try {
        isLoading.value = true;
        await authStore.loginUser(email.value, password.value);
        router.push("/");
    } catch (e) {
        errors.value = [parseFirebaseError(e)];
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <AuthLayout>
        <div
            class="flex max-w-xl h-screen mx-auto items-center justify-center overflow-y-auto"
        >
            <form
                @submit.prevent="loginUser"
                class="flex flex-col w-full bg-main-black rounded-lg p-6 gap-4"
            >
                <h1 class="text-nowrap text-5xl font-semibold mb-4 text-center ">Вход</h1>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon
                        iconName="EmailIcon"
                        class="fill-current h-6 w-6"
                    />
                    <input
                        v-model.trim="email"
                        type="email"
                        id="email"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        placeholder="example@mail.ru"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon iconName="KeyIcon" class="fill-current h-6 w-6" />
                    <input
                        v-model="password"
                        type="password"
                        id="password"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        placeholder="Пароль"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>

                <!-- Список ошибок -->
                <ul
                    v-if="isTriedSubmit && errors.length"
                    class="p-2 text-main-error-red list-disc list-inside"
                >
                    <li v-for="err in errors" :key="err">{{ err }}</li>
                </ul>

                <div class="flex flex-col md:flex-row gap-2 justify-between">
                    <div class="text-lg p-2">
                        <span class="inline">Нет аккаунта? </span>
                        <RouterLink
                            class="inline underline hover:text-white"
                            :to="{ name: 'registration' }"
                            >Регистрация</RouterLink
                        >
                    </div>
                    <button
                        v-if="!isLoading"
                        type="submit"
                        class="flex flex-row items-center justify-center gap-2 bg-main-gray px-4 py-2 rounded-lg text-lg hover:scale-105"
                        title="Войти"
                    >
                        <span>Войти</span>
                    </button>
                    <div
                        v-else
                        class="flex flex-row items-center justify-center gap-2 bg-main-gray px-4 py-2 rounded-lg text-lg"
                    >
                        <BaseIcon
                            iconName="ProgressActivityIcon"
                            class="fill-current"
                        />
                        <span>Загрузка</span>
                    </div>
                </div>
            </form>
        </div>
    </AuthLayout>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:focus,
input:-webkit-autofill:hover,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
    box-shadow: 0 0 0 1000px transparent inset !important;
    -webkit-text-fill-color: #fff !important;
    font-family: inherit !important;
    transition: background-color 5000s ease-in-out 0s;
}
</style>
