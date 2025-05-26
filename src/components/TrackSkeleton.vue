<script setup>
const props = defineProps({
    isShowImage: {
        type: Boolean,
        default: true,
    },
});
</script>

<template>
    <div
        class="flex flex-row items-center justify-start rounded-lg list-none h-16 p-2 gap-2 w-full"
    >
        <!-- Кнопка воспроизведения -->
        <div
            class="flex h-full aspect-square items-center justify-center relative"
        >
            <div
                v-if="props.isShowImage"
                class="w-full h-full bg-main-light-gray dark:bg-main-gray rounded-md animate-pulse"
            ></div>
            <div v-else class="w-full h-full flex items-center justify-center">
                <div
                    class="w-4 h-4 bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
                ></div>
            </div>
        </div>

        <!-- Информация о треке -->
        <div class="flex flex-row items-center gap-2 flex-1">
            <div
                class="h-4 w-32 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
            ></div>
            <template v-if="props.isShowImage">
                <div
                    class="h-4 w-4 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                ></div>
                <div
                    class="h-4 w-24 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                ></div
            ></template>
        </div>
        <!-- Время -->
        <!-- <div
            class="mx-2 w-8 h-8 bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
        ></div> -->
        <!-- Кнопка лайка -->
        <div
            class="mx-2 w-8 h-8 bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
        ></div>

        <!-- Кнопка меню -->
        <div
            class="mx-2 w-8 h-8 bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
        ></div>
    </div>
</template>
