<script setup>
import Track from "@components/Track.vue";
import TrackSkeleton from "./TrackSkeleton.vue";
import { computed } from "vue";

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: true,
        required: false,
    },
    isShowImages: {
        type: Boolean,
        default: true,
        required: false,
    },
    tracksData: {
        type: Array,
        default: [],
        required: false,
    },
});

const trackDataIdList = computed(() => {
    return props.tracksData.map((track) => {
        return track.id;
    });
});
</script>

<template>
    <div class="flex flex-col w-full gap-2">
        <template v-if="props.isLoading">
            <TrackSkeleton
                v-for="n in 10"
                :key="n"
                :isShowImage="props.isShowImages"
            />
        </template>
        <template v-else>
            <Track
                v-for="(track, index) in props.tracksData"
                :key="track.id"
                :data="track"
                :isShowImage="props.isShowImages"
                :index="index + 1"
                :list="trackDataIdList"
            />
        </template>
    </div>
</template>
