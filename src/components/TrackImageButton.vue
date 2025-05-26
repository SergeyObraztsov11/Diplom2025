<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import { computed } from "vue";
import { usePlayerStore } from "@stores/player";

const props = defineProps({
    imageUrl: {
        type: String,
        required: false,
    },
    trackId: {
        type: String,
        required: true,
    },
    isHover: {
        type: Boolean,
        default: false,
    },
});

const playerStore = usePlayerStore();

const isCurrentTrack = computed(
    () => props.trackId === playerStore?.currentTrackData?.id
);
const shouldShowControls = computed(
    () => isCurrentTrack.value || props.isHover
);

const currentIcon = computed(() => {
    if (isCurrentTrack.value) {
        if (props.isHover) {
            return playerStore.isPaused ? "PlayArrowIcon" : "PauseIcon";
        }
        return "CircleIcon";
    }

    if (props.isHover) {
        return "PlayArrowIcon";
    }

    return null;
});

const shouldPulse = computed(() => {
    return isCurrentTrack.value && !playerStore.isPaused && !props.isHover;
});
</script>

<template>
    <div class="flex h-full w-full relative rounded-md overflow-hidden z-auto">
        <MyImage :url="imageUrl" />
        <div
            v-show="shouldShowControls"
            class="absolute inset-0 h-full w-full flex justify-center items-center bg-black/30 dark:bg-black/50 transition-all duration-200"
        >
            <BaseIcon
                v-if="currentIcon"
                :iconName="currentIcon"
                :class="[
                    'fill-main-black dark:fill-main-white',
                    { 'animate-pulse duration-1000': shouldPulse },
                ]"
            />
        </div>
    </div>
</template>
