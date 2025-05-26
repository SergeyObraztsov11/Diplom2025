<script setup>
import { ref } from "vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";

const props = defineProps({
    url: {
        type: String,
        required: false,
        default: null,
    },
    loadingIcon: {
        type: String,
        required: false,
        validator: (value) => ["user", "note"].includes(value),
        default: "note",
    },
});

const isImageLoaded = ref(false);
const isImageError = ref(false);

const onHandleImageError = () => {
    isImageError.value = true;
};

const onHandleImageLoad = () => {
    isImageLoaded.value = true;
};
</script>
<template>
    <div  v-bind="$attrs" class="h-full aspect-square">
        <img
            v-show="isImageLoaded"
            class="h-full w-full object-cover"
            :src="props.url"
            @error="onHandleImageError"
            @load="onHandleImageLoad"
        />
        <div
            v-if="!isImageLoaded"
            class="flex w-full h-full items-center justify-center bg-main-white dark:bg-main-gray"
        >
            <BaseIcon
                v-if="props.loadingIcon === 'note'"
                size="50%"
                iconName="MusicNoteIcon"
                class="fill-white dark:fill-main-white"
            />
            <BaseIcon
                v-else-if="props.loadingIcon === 'user'"
                size="50%"
                iconName="PersonIcon"
                class="fill-white dark:fill-main-white"
            />
        </div>
    </div>
</template>
