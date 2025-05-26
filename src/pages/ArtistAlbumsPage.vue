<script setup>
import UserLayout from "@layouts/UserLayout.vue";
import { useAlbumsStore } from "@stores/albums";
import { useMessageStore } from "@stores/message";
import AlbumCard from "@ui/AlbumCard.vue";
import AlbumCardSkeleton from "@ui/AlbumCardSkeleton.vue";
import CardsGrid from "@ui/CardsGrid.vue";
import { onMounted, ref } from "vue";
import { useArtistsStore } from "@stores/artists";

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
</script>

<template>
    <UserLayout>
        <!-- Список альбомов -->
        <h1 class="text-4xl font-bold tracking-tight truncate mb-4">
            Популярные альбомы {{ artistData.displayName }}
        </h1>
        <template v-if="isLoading">
            <CardsGrid>
                <AlbumCardSkeleton v-for="i in 8" :key="i" />
            </CardsGrid>
        </template>
        <template v-else-if="artistData.albums.length > 0">
            <CardsGrid>
                <AlbumCard
                    v-for="album in artistData.albums"
                    :album="album"
                    :key="album.id"
                />
                </CardsGrid>
        </template>
        <template v-else>
            <p class="text-main-white/80 text-lg py-4 text-center">
                Альбомы не найдены.
            </p>
        </template>
    </UserLayout>
</template>
