<script setup>
import { vOnClickOutside } from "@vueuse/components";

const props = defineProps({
    title: {
        type: String,
        required: false,
    },
});
const emit = defineEmits(["close"]);

const onClickCloseModal = () => emit("close");
</script>
<template>
    <div
        class="flex overflow-y-auto fixed inset-0 z-50 items-center justify-center bg-black/50"
    >
        <div
            v-on-click-outside="onClickCloseModal"
            class="bg-white dark:bg-main-black backdrop-blur-sm rounded-lg overflow-hidden shadow-lg gap-4"
        >
            <!-- Header -->
            <div
                class="flex flex-row w-full items-center justify-between text-xl py-4 px-6"
            >
                <span class="truncate font-semibold">{{ props.title }}</span>
                <button
                    class="font-semibold hover:text-main-white/50 transition"
                    @click="onClickCloseModal"
                >
                    &times;
                </button>
            </div>
            <!-- Content -->
            <div class="flex">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
