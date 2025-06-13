<script setup>
import { ref } from "vue";
import { useAuthStore } from "@stores/auth";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { useRouter } from "vue-router";
import AuthLayout from "@layouts/AuthLayout.vue";
const authStore = useAuthStore();
const router = useRouter();

const displayName = ref("");
const email = ref("");
const password1 = ref("");
const password2 = ref("");
const isLoading = ref(false);

const errors = ref([]);

// Функция преобразования ошибок Firestore/Firebase
const parseFirebaseError = (err) => {
    switch (err) {
        case "auth/email-already-in-use":
            return "Почта уже используется";
        case "auth/invalid-email":
            return "Некорректный email";
        case "auth/weak-password":
            return "Слабый пароль";
        case "auth/operation-not-allowed":
            return "Операция не разрешена";
        case "auth/network-request-failed":
            return "Проблемы с интернет-соединением";
        default:
            return "Неизвестная ошибка: " + err;
    }
};

const validateForm = () => {
    const result = [];
    if (displayName.value.length < 6) result.push("Минимум 6 символов в имени");
    if (!email.value.includes("@")) result.push("Некорректный email");
    if (password1.value.length < 6) result.push("Минимум 6 символов в пароле");
    if (password2.value !== password1.value) result.push("Пароли не совпадают");
    return result;
};

// const isFormValid = () => {
//     return validateForm().length === 0;
// };

const registerUser = async () => {
    errors.value = validateForm();
    if (errors.value.length > 0) return;
    try {
        isLoading.value = true;
        await authStore.registerUser({
            displayName: displayName.value,
            email: email.value,
            password: password1.value,
        });
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
        <div class="flex-1 flex items-center justify-center">
            <form
                @submit.prevent="registerUser"
                class="flex flex-col max-w-xl bg-main-black rounded-lg p-6 gap-4"
            >
                <h1 class="text-nowrap text-5xl font-semibold mb-4 text-center">
                    Регистрация
                </h1>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon
                        iconName="PersonIcon"
                        class="fill-current h-6 w-6"
                    />
                    <input
                        v-model.trim="displayName"
                        placeholder="Имя пользователя"
                        type="text"
                        id="displayName"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon
                        iconName="EmailIcon"
                        class="fill-current h-6 w-6"
                    />
                    <input
                        v-model.trim="email"
                        placeholder="example@mail.ru"
                        type="email"
                        id="email"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon iconName="KeyIcon" class="fill-current h-6 w-6" />
                    <input
                        v-model.trim="password1"
                        placeholder="Пароль"
                        type="password"
                        id="password1"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>
                <div
                    class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
                >
                    <BaseIcon iconName="KeyIcon" class="fill-current h-6 w-6" />
                    <input
                        v-model.trim="password2"
                        placeholder="Повторите пароль"
                        type="password"
                        id="password2"
                        autocomplete="off"
                        required
                        spellcheck="false"
                        class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    />
                </div>

                <!-- Чекбокс согласия -->
                <!-- <label
                    class="flex items-center gap-2 select-none cursor-pointer text-main-white/50"
                >
                    <input
                        type="checkbox"
                        v-model="isAgree"
                        class="accent-main-gray w-5 h-5"
                        required
                    />
                    <span>
                        Я принимаю
                        <a
                            href="/rules"
                            target="_blank"
                            class="underline hover:text-main-white"
                            >правила сервиса</a
                        >
                    </span>
                </label> -->

                <!-- Список ошибок -->
                <ul
                    v-if="errors.length"
                    class="p-2 text-main-error-red list-disc list-inside"
                >
                    <li v-for="err in errors" :key="err">{{ err }}</li>
                </ul>

                <div class="flex flex-col md:flex-row gap-2 justify-between">
                    <div class="text-lg p-2">
                        <span class="inline">Уже есть аккаунт? </span>

                        <RouterLink
                            class="inline underline hover:text-white"
                            :to="{ name: 'login' }"
                            >Войти</RouterLink
                        >
                    </div>
                    <button
                        v-if="!isLoading"
                        type="submit"
                        class="flex flex-row items-center justify-center gap-2 bg-main-gray px-4 py-2 rounded-lg text-lg hover:scale-105"
                        title="Подтвердить регистрацию"
                    >
                        <span>Подтвердить</span>
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
