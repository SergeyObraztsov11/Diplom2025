<script setup>
import { ref, onMounted } from "vue";

defineProps({
    album: {
        type: Object,
        required: true,
    },
});

</script>

<template>
    <div
        class="flex flex-col gap-2 max-h-80 border-2 border-main-gray rounded-lg p-2 overflow-y-auto"
    >
        <!-- <div class="flex flex-row gap-4">
            <img
                v-if="album?.imageURL"
                :src="album.imageURL"
                class="w-24 h-24 rounded-lg object-cover"
            />
            <div class="flex flex-col gap-1">
                <span class="font-semibold">{{ album?.title }}</span>
                <span class="text-base text-main-white/50">
                    {{ album?.description }}
                </span>
                <div
                    class="flex flex-row items-center gap-2 text-sm text-main-white/50"
                >
                    <span>{{ album?.tracksCount }} треков</span>
                    <span>•</span>
                    <span>{{ formatDuration(album?.duration) }}</span>
                </div>
            </div>
        </div> -->
    </div>
</template>
