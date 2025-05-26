<script setup>
import Track from "@components/Track.vue";
import TrackSkeleton from "@components/TrackSkeleton.vue";
import UserLayout from "@layouts/UserLayout.vue";
import { useMessageStore } from "@stores/message";
import { useTracksStore } from "@stores/tracks";
import { computed, onMounted, ref } from "vue";

const tracksStore = useTracksStore();
const messageStore = useMessageStore();

const isLoading = ref(true);
const tracks = ref([]);

onMounted(async () => {
    try {
        isLoading.value = true;
        tracks.value = await tracksStore.getLikedTracks();
    } catch (error) {
        messageStore.showMessage("Ошибка при загрузке страницы.");
    } finally {
        isLoading.value = false;
    }
});

const trackList = computed(() => tracks.value.map((track) => track.id));
</script>
<template>
    <UserLayout>
        <h1 class="text-4xl font-bold tracking-tight truncate mb-4">
            Мне нравится
        </h1>
        <template v-if="isLoading">
            <div class="flex flex-col gap-2">
                <TrackSkeleton v-for="id in 10" :key="id" :isShowImage="true" />
            </div>
        </template>
        <template v-else-if="tracks.length > 0">
            <div class="flex flex-col gap-2">
                <Track
                    v-for="track in tracks"
                    :key="track.id"
                    :data="track"
                    :isShowImage="true"
                    :list="trackList"
                />
            </div>
        </template>
        <template v-else>
            <p class="text-main-white/80 text-lg py-4 text-center">
                Треки не найдены.
            </p>
        </template>
    </UserLayout>
</template>
