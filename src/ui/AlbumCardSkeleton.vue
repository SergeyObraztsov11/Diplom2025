<template>
    <div
        class="flex flex-col w-[250px] h-[300px] justify-between flex-shrink-0"
    >
        <!-- Скелетон изображения -->
        <div
            class="rounded-xl overflow-hidden aspect-square bg-main-light-gray dark:bg-main-gray animate-pulse"
        ></div>

        <!-- Скелетон текста -->
        <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center justify-between">
                <div
                    class="h-4 w-3/4 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                ></div>
                
            </div>
            <div
                class="h-4 w-1/2 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
            ></div>
        </div>
    </div>
</template>
