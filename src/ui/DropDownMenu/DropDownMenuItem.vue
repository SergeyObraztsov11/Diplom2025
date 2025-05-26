<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { ref, computed } from "vue";

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    iconName: {
        type: String,
        required: false,
    },
    isRed: {
        type: Boolean,
        default: false,
        required: false,
    },
});

const isHover = ref(false);
</script>
<template>
    <button
        class="bg-transparent flex flex-row items-center h-10 text-l whitespace-nowrap transition-colors"
        :class="props.isRed ? 'text-main-error-red hover:text-main-error-red/50': 'text-main-white hover:text-main-white/50'"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
    >
        <BaseIcon
            v-if="props.iconName"
            class="fill-current mr-2"
            :iconName="props.iconName"
        />

        {{ props.text }}
    </button>
</template>
