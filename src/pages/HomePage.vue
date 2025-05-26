<script setup>
import { useWindowSize } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

import Track from "@components/Track.vue";
import TrackSkeleton from "@components/TrackSkeleton.vue";
import AlbumCardSkeleton from "@ui/AlbumCardSkeleton.vue";
import AlbumCard from "@ui/AlbumCard.vue";
import SectionHeader from "@ui/SectionHeader.vue";
import CardsGrid from "@ui/CardsGrid.vue";

import { A11y, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/vue";

import { useAlbumsStore } from "@stores/albums";
import { useAuthStore } from "@stores/auth";
import { useTracksStore } from "@stores/tracks";
import UserLayout from "@layouts/UserLayout.vue";

const tracksStore = useTracksStore();
const albumsStore = useAlbumsStore();
const authStore = useAuthStore();
const modules = [Navigation, A11y];

const isLoading = ref(true);
const popularTracks = ref([]);
const popularAlbums = ref([]);
const featuredAlbums = ref([]);
const likedTracks = ref([]);
const likedAlbums = ref([]);

onMounted(async () => {
    try {
        isLoading.value = true;
        const [tracks, albums, likedTracksData, likedAlbumsData] = await Promise.all([
            tracksStore.getAllTracks(),
            albumsStore.getAllAlbums(),
            tracksStore.getLikedTracks(),
            albumsStore.getLikedAlbums()
        ]);
        popularTracks.value = tracks;
        popularAlbums.value = albums;
        featuredAlbums.value = albums.slice(0, 2);
        likedTracks.value = likedTracksData;
        likedAlbums.value = likedAlbumsData;
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <UserLayout>
        <div class="flex flex-col gap-16">
            <!-- Большие карточки альбомов -->
            <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <template v-if="isLoading">
                    <div
                        v-for="i in 2"
                        :key="i"
                        class="aspect-[16/9] bg-main-gray animate-pulse rounded-3xl"
                    />
                </template>
                <template v-else-if="featuredAlbums.length > 0">
                    <RouterLink
                        v-for="album in featuredAlbums"
                        :key="album.id"
                        :to="{ name: 'album', params: { albumId: album.id } }"
                        class="group relative aspect-[16/9] overflow-hidden rounded-3xl"
                    >
                        <img
                            :src="album.imageURL"
                            :alt="album.title"
                            class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        />
                        <div
                            class="absolute z-10 inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 flex flex-col justify-end"
                        >
                            <h3 class="text-3xl font-bold text-white mb-3 tracking-tight">
                                {{ album.title }}
                            </h3>
                            <p class="text-white/90 text-lg">
                                {{ album.author.displayName }}
                            </p>
                        </div>
                    </RouterLink>
                </template>
            </section>

            <!-- Любимые треки -->
            <section v-if="likedTracks.length > 0" class="flex flex-col gap-6">
                <h1 class="text-4xl font-bold tracking-tight">
                    Любимые треки
                </h1>
                <div class="flex flex-col gap-3 bg-main-gray/30 rounded-2xl p-4">
                    <Track
                        v-for="track in likedTracks"
                        :key="track.id"
                        :data="track"
                        :isShowImage="true"
                        :list="likedTracks.map((track) => track.id)"
                    />
                </div>
            </section>

            <!-- Любимые альбомы -->
            <section v-if="likedAlbums.length > 0" class="flex flex-col gap-6">
                <h1 class="text-4xl font-bold tracking-tight">
                    Любимые альбомы
                </h1>
                <Swiper
                    :space-between="40"
                    :modules="modules"
                    navigation
                    slides-per-view="auto"
                    class="w-full"
                >
                    <SwiperSlide
                        v-for="album in likedAlbums"
                        :key="album.id"
                        class="!w-fit"
                    >
                        <AlbumCard :album="album" />
                    </SwiperSlide>
                </Swiper>
            </section>

            <!-- Популярные треки -->
            <section class="flex flex-col gap-6">
                <h1 class="text-4xl font-bold tracking-tight">
                    Популярные треки
                </h1>
                <div class="flex flex-col gap-3 bg-main-gray/30 rounded-2xl p-4">
                    <template v-if="isLoading">
                        <TrackSkeleton v-for="i in 5" :key="i" />
                    </template>
                    <template v-else>
                        <Track
                            v-for="track in popularTracks"
                            :key="track.id"
                            :data="track"
                            :isShowImage="true"
                            :list="popularTracks.map((track) => track.id)"
                        />
                    </template>
                </div>
            </section>

            <!-- Популярные альбомы -->
            <section class="flex flex-col gap-6">
                <h1 class="text-4xl font-bold tracking-tight">
                    Популярные альбомы
                </h1>
                <template v-if="isLoading">
                    <div class="flex p-2 flex-row w-full overflow-x-hidden gap-6">
                        <AlbumCardSkeleton v-for="i in 3" :key="i" />
                    </div>
                </template>
                <template v-else-if="popularAlbums.length > 0">
                    <Swiper
                        :space-between="40"
                        :modules="modules"
                        navigation
                        slides-per-view="auto"
                        class="w-full"
                    >
                        <SwiperSlide
                            v-for="album in popularAlbums"
                            :key="album.id"
                            class="!w-fit"
                        >
                            <AlbumCard :album="album" />
                        </SwiperSlide>
                    </Swiper>
                </template>
                <template v-else>
                    <p class="text-main-white/80 text-lg py-4 text-center">
                        Альбомы не найдены.
                    </p>
                </template>
            </section>
        </div>
    </UserLayout>
</template>
