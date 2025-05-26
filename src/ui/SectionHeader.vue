<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";

defineProps({
    title: {
        type: String,
        required: true,
    },
    to: {
        type: Object,
        required: true,
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div
        class="flex flex-row h-9 items-center justify-start gap-2 text-main-black dark:text-main-white hover:text-main-black/80 dark:hover:text-main-white/80 transition-all"
    >
        <template v-if="!isLoading">
            <span
                class="text-3xl md:text-4xl font-bold tracking-tight truncate"
            >
                {{ title }}
            </span>
            
            <BaseIcon
                class="fill-current h-8 w-8 md:h-12 md:w-12 transition-all"
                iconName="ArrowRightIcon"
            />
        </template>
        <template v-else>
            <!-- Скелетон для текста -->
            <div
                class="h-8 sm:h-10 md:h-12 w-48 sm:w-56 md:w-64 bg-main-light-gray dark:bg-main-gray rounded-lg animate-pulse"
            ></div>
            <!-- Скелетон для иконки -->
            <div
                class="h-8 w-8 md:h-12 md:w-12 bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
            ></div>
        </template>
    </div>
</template>
