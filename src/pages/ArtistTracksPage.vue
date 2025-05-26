<script setup>
import UserLayout from "@layouts/UserLayout.vue";
import { useAlbumsStore } from "@stores/albums";
import { useAuthStore } from "@stores/auth";
import { useMessageStore } from "@stores/message";
import { useModalsStore } from "@stores/modals";
import { usePlayerStore } from "@stores/player";
import { useTracksStore } from "@stores/tracks";
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useArtistsStore } from "@stores/artists";
import Track from "@components/Track.vue";
import TrackSkeleton from "@components/TrackSkeleton.vue";

const props = defineProps({
    artistId: {
        type: String,
        required: false,
    },
});

const artistsStore = useArtistsStore();
const messageStore = useMessageStore();

const isLoading = ref(true);
const artistData = ref({});

onMounted(async () => {
    isLoading.value = true;
    try {
        artistData.value = await artistsStore.getArtistById(props.artistId);
    } catch (error) {
        messageStore.showMessage("Ошибка при загрузке страницы.");
    } finally {
        isLoading.value = false;
    }
});

const artistTrackList = computed(() => {
    return artistData.value.tracks?.map((track) => track.id);
});
</script>
<template>
    <UserLayout>
        <h1 class="text-4xl font-bold tracking-tight truncate mb-4">
            Популярные треки {{ artistData.displayName }}
        </h1>
        <template v-if="isLoading">
            <TrackSkeleton v-for="id in 10" :key="id" :isShowImage="true" />
        </template>
        <template v-else-if="artistData?.tracks?.length > 0">
            <Track
                v-for="track in artistData.tracks"
                :key="track.id"
                :data="track"
                :isShowImage="true"
                :list="artistTrackList"
            />
        </template>
        <template v-else>
            <p class="text-main-white/80 text-lg py-4 text-center">
                Треки не найдены.
            </p>
        </template>
    </UserLayout>
</template>
