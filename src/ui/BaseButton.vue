<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed } from "vue";

const props = defineProps({
    type: {
        type: String,
        validator: (value) =>
            ["default", "primary", "text", "hovering"].some(
                (type) => type === value
            ),
        default: "default",
        required: false,
    },
    action: {
        type: String,
        validator: (value) =>
            ["default", "disabled", "danger"].some(
                (action) => action === value
            ),
        default: "default",
        required: false,
    },
    isRounded: {
        type: Boolean,
        default: false,
        required: false,
    },
    iconName: {
        type: String,
        required: false,
    },
    text: {
        type: String,
        required: false,
    },
    size: {
        type: String,
        validator: (value) =>
            [
                "xs",
                "sm",
                "md",
                "lg",
                "xl",
                "2xl",
                "3xl",
                "4xl",
                "5xl",
                "6xl",
            ].includes(value),
        default: "md",
        required: false,
    },
    formType: {
        type: String,
        validator: (value) =>
            ["button", "submit", "reset"].some((type) => type === value),
        default: "button",
        required: false,
    },
    isReversed: {
        type: Boolean,
        default: false,
        required: false,
    },
});

const ACTION_TYPES_CLASSES = {
    default: {
        primary:
            "text-white dark:text-main-white border-main-color bg-main-color hover:bg-main-color/90",
        default:
            "border-main-white dark:border-main-gray hover:bg-main-white dark:hover:bg-main-gray",
        hovering:
            "border-transparent  hover:bg-main-white dark:hover:bg-main-gray",
        text: "text-main-gray dark:text-main-white hover:text-main-gray/60 dark:hover:text-main-white/60 border-transparent",
    },
    danger: {
        primary:
            "text-white dark:text-main-white border-main-error-red bg-main-error-red hover:bg-main-error-red/90",
        default:
            "text-main-error-red border-main-error-red hover:bg-main-white dark:hover:bg-main-gray",
        hovering:
            "text-main-error-red border-transparent  hover:bg-main-white dark:hover:bg-main-gray",
        text: "text-main-error-red hover:text-main-error-red/60 border-transparent",
    },
    disabled: {
        primary:
            "text-white dark:text-main-black border-main-white dark:border-main-gray bg-main-white dark:bg-main-gray",
        default:
            "text-main-white dark:text-main-gray border-main-white dark:border-main-gray ",
        hovering: "text-main-white dark:text-main-gray border-transparent",
        text: "text-main-white dark:text-main-white/50 border-transparent",
    },
};

const sizeMap = {
    xs: { text: "text-xs", icon: "h-3 w-3" },
    sm: { text: "text-sm", icon: "h-4 w-4" },
    md: { text: "text-base", icon: "h-5 w-5" },
    lg: { text: "text-lg", icon: "h-6 w-6" },
    xl: { text: "text-xl", icon: "h-7 w-7" },
    "2xl": { text: "text-2xl", icon: "h-8 w-8" },
    "3xl": { text: "text-3xl", icon: "h-9 w-9" },
    "4xl": { text: "text-4xl", icon: "h-10 w-10" },
    "5xl": { text: "text-5xl", icon: "h-11 w-11" },
    "6xl": { text: "text-6xl", icon: "h-14 w-14" },
};

const typeClass = computed(() => {
    return ACTION_TYPES_CLASSES[props.action][props.type];
});

const roundedClass = computed(() => {
    return props.isRounded ? "rounded-full" : "rounded-lg";
});

const sizeTextClass = computed(() => {
    return sizeMap[props.size].text;
});

const sizeIconClass = computed(() => {
    return sizeMap[props.size].icon;
});


</script>
<template>
    <button
        v-bind="$attrs"
        class="flex flex-row items-center justify-start max-w-full p-2 gap-1 border-2 transition-all truncate overflow-hidden whitespace-nowrap"
        :class="[
            roundedClass,
            typeClass,
            sizeTextClass,
            {'hover:scale-105': props.action !== 'disabled'},
            { 'flex-row-reverse': isReversed },
        ]"
        :type="props.formType"
    >
        <BaseIcon
            v-if="props.iconName"
            :iconName="props.iconName"
            class="fill-current"
            :class="[sizeIconClass]"
        />
        {{ props.text }}
    </button>
</template>
