<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
</script>

<template>
    <div class="flex h-full w-full justify-center items-center">
        <div class="flex flex-col items-center gap-4">
            <BaseIcon iconName="ForumIcon" class="h-16 w-16 fill-current" />
            <div class="flex flex-col items-center gap-2">
                <span class="text-2xl font-bold">Выберете чат</span>
                <span class="text-main-white/50"
                    >или создайте новый</span
                >
            </div>
        </div>
    </div>
</template>
