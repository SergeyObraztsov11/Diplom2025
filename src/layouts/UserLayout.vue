<script setup>
import AppHeader from "@components/AppHeader.vue";
import AppPlayer from "@components/AppPlayer.vue";
import AppFooter from "@components/AppFooter.vue";
</script>
<template>
    <div class="flex flex-row h-screen overflow-hidden">
        <!-- Боковой хедер -->
        <AppHeader />
        <!-- Основной контент + плеер -->
        <div class="flex flex-col flex-1">
            <div
                class="flex flex-col h-full overflow-y-auto container bg-main-black p-8 mx-auto"
            >
                <slot></slot>
            </div>
            <AppPlayer />
        </div>
        <!-- Основной контент с прокруткой -->
        <!-- <div class="flex flex-col flex-1">
                <main
                    class="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-main-black container p-8 mx-auto"
                >
                    <slot></slot>
                </main>
                <AppFooter />
            </div> -->
        <!-- Плеер зафиксирован внизу -->
    </div>
</template>
