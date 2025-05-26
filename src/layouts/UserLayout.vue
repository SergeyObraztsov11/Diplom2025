<script setup>
import AppHeader from "@components/AppHeader.vue";
import AppPlayer from "@components/AppPlayer.vue";

</script>
<template>
    <div class="flex h-screen overflow-hidden">
        <!-- Боковой хедер -->
        <AppHeader />
        <!-- Основной контент + плеер -->
        <div class="flex flex-col flex-1">
            <!-- Основной контент с прокруткой -->
            <main
                class="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-main-black container p-8 mx-auto"
            >
                <slot></slot>
            </main>
            <!-- Плеер зафиксирован внизу -->
            <AppPlayer />
        </div>
    </div>
</template>
