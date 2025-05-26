<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed } from "vue";
import { usePlayerStore } from "@stores/player";

const props = defineProps({
    index: {
        type: Number,
        required: true,
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
            return playerStore.isPaused ? 'PlayArrowIcon' : 'PauseIcon';
        }
        return 'CircleIcon';
    }
    
    if (props.isHover) {
        return 'PlayArrowIcon';
    }
    
    return null;
});

const shouldPulse = computed(() => {
    return isCurrentTrack.value && !playerStore.isPaused && !props.isHover;
});

</script>

<template>
    <div class="flex h-full aspect-square items-center justify-center relative">
        <div class="flex-1 items-center justify-center">
            <span v-if="!shouldShowControls">{{ index }}</span>
        </div>

        <div
            v-show="shouldShowControls"
            class="absolute inset-0 flex items-center justify-center"
        >
            <BaseIcon
                v-if="currentIcon"
                :iconName="currentIcon"
                :class="[
                    'fill-main-black dark:fill-main-white',
                    { 'animate-pulse duration-1000': shouldPulse }
                ]"
            />
        </div>
    </div>
</template>
