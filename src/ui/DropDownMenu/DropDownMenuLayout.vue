<script setup>
import { vOnClickOutside } from "@vueuse/components";
import { ref, computed } from "vue";

const props = defineProps({
    placement: {
        type: String,
        default: "bottom-right",
        validator: (value) => ["bottom-right", "bottom-left", "top-right", "top-left"].includes(value),
    },
});

const isOpen = ref(false);
const trigger = ref();

const onClickTrigger = () => {
    isOpen.value = !isOpen.value;
};

const onClickOutsideHandler = [
    () => {
        isOpen.value = false;
    },
    { ignore: [trigger] },
];

// Классы позиционирования
const menuPositionClass = computed(() => {
    switch (props.placement) {
        case "bottom-right":
            return "top-full mt-2 left-0";
        case "bottom-left":
            return "top-full mt-2 right-0";
        case "top-right":
            return "bottom-full mb-2 left-0";
        case "top-left":
            return "bottom-full mb-2 right-0";
        default:
            return "top-full mt-2 left-0";
    }
});
</script>

<template>
    <div class="relative">
        <div ref="trigger" @click="onClickTrigger" class="flex items-center">
            <slot name="trigger"></slot>
        </div>
        <div
            v-show="isOpen"
            v-on-click-outside="onClickOutsideHandler"
            class="absolute flex flex-col px-2 gap-1 z-50 list-none bg-white/90 dark:bg-main-black/90 backdrop-blur-sm border-2 border-main-white dark:border-main-gray rounded-lg shadow-lg
                max-h-[60vh] overflow-y-auto max-w-[90vw] min-w-[160px]"
            :class="menuPositionClass"
            style="box-sizing: border-box;"
        >
            <slot name="content"></slot>
        </div>
    </div>
</template>
