<script setup>
import { computed } from "vue";

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        default: "top",
        validator: (value) =>
            ["top", "bottom", "left", "right"].includes(value),
    },
});

const tooltipPosition = {
    top: "bottom-full left-1/2 transform -translate-x-1/2",
    bottom: "top-full left-1/2 transform -translate-x-1/2",
    left: "right-full top-1/2 transform -translate-y-1/2",
    right: "left-full top-1/2 transform -translate-y-1/2",
};

const tooltipPositionClass = computed(() => {
    return tooltipPosition[props.position];
});
</script>

<template>
    <div class="group relative inline-block">
        <!-- Элемент, на который наводим -->
        <slot />
        <!-- Подсказка -->
        <div
            class="absolute hidden group-hover:block"
            :class="tooltipPositionClass"
        >
            <span
                class="text-sm text-main-black dark:text-main-white whitespace-nowrap"
                >{{ props.text }}</span
            >
        </div>
    </div>
</template>
