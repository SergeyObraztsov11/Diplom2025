<script setup>
import { useAuthStore } from "@stores/auth";
const authStore = useAuthStore();
</script>
<template>
    <div
        class="container bg-main-black h-screen overflow-y-auto overflow-x-hidden mx-auto"
    >
        <!-- <div class="flex flex-row items-end px-8 py-4">
            <h1 class="text-nowrap text-2xl font-semibold">
                Панель администратора
            </h1>
            <button class="text-main-white/50" @click="authStore.logoutUser">Выход</button>
        </div> -->

        <slot></slot>
    </div>
</template>
