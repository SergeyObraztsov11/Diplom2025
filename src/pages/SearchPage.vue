<script setup>
import { useAlbumsStore } from "@/stores/albums";
import { useArtistsStore } from "@/stores/artists";
import { useTracksStore } from "@/stores/tracks";
import Track from "@components/Track.vue";
import AlbumCard from "@ui/AlbumCard.vue";
import AlbumCardSkeleton from "@ui/AlbumCardSkeleton.vue";
import ArtistCard from "@ui/ArtistCard.vue";
import CardsGrid from "@ui/CardsGrid.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { debounce } from "lodash";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserLayout from "@layouts/UserLayout.vue";
import Fuse from "fuse.js";
import { Swiper, SwiperSlide } from "swiper/vue"; // Импортируем компоненты Swiper
import { Navigation, A11y, Mousewheel } from "swiper/modules"; // Импортируем нужные модули (например, Navigation для стрелок)
import "swiper/swiper-bundle.css"; // Импортируем стили Swiper

const router = useRouter();
const route = useRoute();
const tracksStore = useTracksStore();
const albumsStore = useAlbumsStore();
const artistsStore = useArtistsStore();
// Определяем модули Swiper, которые будем использовать
const modules = [A11y, Mousewheel];

const isLoading = ref(true); // Загрузка
const searchRequest = ref(""); // Запрос для поиска
const allDataForSearch = ref([]);
const selectedGenres = ref([]);

const allGenres = ref([
    { label: "Поп-музыка", value: "pop" },
    { label: "Рэп и хип-хоп", value: "rap-hip-hop" },
    { label: "Танцевальная", value: "dance" },
    { label: "Классическая", value: "classic" },
    { label: "Блюз", value: "blues" },
    { label: "Панк", value: "punk" },
    { label: "R&B", value: "r-b" },
    { label: "Другое", value: "other" },
]);

const initailLoadData = async () => {
    const tracksPromise = tracksStore.getAllTracks();
    const albumsPromise = albumsStore.getAllAlbums();
    const artistsPromise = artistsStore.getAllArtists();

    const [tracks, albums, artists] = await Promise.all([
        tracksPromise,
        albumsPromise,
        artistsPromise,
    ]);

    allDataForSearch.value = [
        ...tracks.map((item) => ({ ...item, type: "track" })), // Добавляем тип для идентификации
        ...albums.map((item) => ({ ...item, type: "album" })), // Добавляем тип
        ...artists.map((item) => ({ ...item, type: "artist" })), // Добавляем тип
    ];
};

const fuse = computed(() => {
    return new Fuse(allDataForSearch.value, {
        keys: [
            { name: "title", weight: 0.7 }, // Название трека/альбома
            { name: "displayName", weight: 0.8 }, // Имя исполнителя (у треков/альбомов это вложенные поля)
            { name: "author.displayName", weight: 0.5 }, // Имя автора трека/альбома (если есть)
            { name: "description", weight: 0.3 }, // Описание альбома/исполнителя
            { name: "album.title", weight: 0.4 }, // Название альбома для трека (если есть)
            { name: "album.description", weight: 0.2 },
            { name: "author.description", weight: 0.1 },
        ],
        threshold: 0.3, // Чувствительность поиска (0 - точное совпадение, 1 - любое)
        distance: 100, // Максимальное расстояние для нечеткого поиска
        minMatchCharLength: 1, // Минимальная длина запроса для нечеткого поиска
        shouldSort: true, // Сортировать по релевантности
        includeMatches: true,
        includeScore: true, // Включить оценку релевантности
    });
});

const searchResults = computed(() => {
    let searchResult = allDataForSearch.value;

    // Применяем текстовый поиск, если есть запрос
    if (searchRequest.value.trim()) {
        searchResult = fuse.value
            .search(searchRequest.value)
            .map((result) => result.item);
    }

    // Применяем фильтрацию по жанрам
    if (selectedGenres.value.length > 0) {
        searchResult = searchResult.filter((item) => {
            // Проверяем, есть ли жанр элемента в выбранных жанрах
            return selectedGenres.value.includes(item.genre);
        });
    }

    const foundTracks = searchResult
        .filter((item) => item.type === "track")
        .slice(0, 10);
    const foundAlbums = searchResult
        .filter((item) => item.type === "album")
        .slice(0, 10);
    const foundArtists = searchResult
        .filter((item) => item.type === "artist")
        .slice(0, 10);

    return {
        tracks: foundTracks || [],
        albums: foundAlbums || [],
        artists: foundArtists || [],
    };
});

const isHaveSearchResuls = computed(() => {
    return (
        searchResults.value?.artists?.length > 0 ||
        searchResults.value?.tracks?.length > 0 ||
        searchResults.value?.albums?.length > 0
    );
});
// Инициализируем searchRequest из URL при загрузке
onMounted(async () => {
    try {
        isLoading.value = true;
        if (route.query.request) {
            searchRequest.value = route.query.request;
        }
        if (route.query.genres) {
            selectedGenres.value = route.query.genres;
        }
        await initailLoadData();
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
});

const clearSearchRequest = () => {
    searchRequest.value = "";
};

watch(
    [searchRequest, selectedGenres],
    ([newRequest, newGenres]) => {
        const newQuery = {
            ...route.query,
            request: newRequest.trim() !== "" ? newRequest : undefined,
            genres: newGenres.length > 0 ? newGenres : undefined,
        };
        router.replace({ query: newQuery });
    },
    { immediate: false }
);

const toggleGenre = (ganreValue) => {
    if (!selectedGenres.value.includes(ganreValue)) {
        selectedGenres.value = [...selectedGenres.value, ganreValue];
    } else {
        selectedGenres.value = selectedGenres.value.filter(
            (ganre) => ganre !== ganreValue
        );
    }
};

const getGenreStatus = (ganreValue) => {
    return selectedGenres.value.includes(ganreValue);
};
</script>
<template>
    <UserLayout>
        <div class="flex h-full flex-col gap-4">
            <!-- Хедер -->

            <!-- Блок с заголовком -->
            <div>
                <h1 class="text-4xl font-bold tracking-tight truncate">
                    Поиск
                </h1>
            </div>

            <!-- Строка поиска -->
            <div
                class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
            >
                <div>
                    <BaseIcon
                        iconName="SearchIcon"
                        class="fill-current h-6 w-6"
                    />
                </div>

                <input
                    v-model="searchRequest"
                    type="text"
                    spellcheck="false"
                    class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                    placeholder="Треки, альбомы, исполнители"
                />
                <button @click="clearSearchRequest">
                    <BaseIcon
                        iconName="CloseIcon"
                        class="fill-current h-6 w-6"
                    />
                </button>
            </div>

            <!-- Перемещаем Swiper с жанрами в отдельный блок -->
            <div class="flex flex-col gap-4">
                <Swiper
                    :space-between="16"
                    :modules="modules"
                    slides-per-view="auto"
                    class="w-full"
                    :mousewheel="true"
                >
                    <SwiperSlide
                        v-for="ganre in allGenres"
                        :key="ganre.value"
                        class="!w-fit"
                    >
                        <button
                            @click="toggleGenre(ganre.value)"
                            class="px-4 py-2 bg-main-gray rounded-full transition hover:scale-95"
                            :class="
                                getGenreStatus(ganre.value)
                                    ? 'bg-main-white/20'
                                    : 'bg-main-gray'
                            "
                        >
                            {{ ganre.label }}
                        </button>
                    </SwiperSlide>
                </Swiper>

                <!-- Результаты поиска -->
                <div
                    v-if="isLoading"
                    class="flex-1 items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-4">
                        <BaseIcon
                            iconName="ProgressActivityIcon"
                            class="h-16 w-16 fill-current"
                        />
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-2xl font-bold">Загрузка...</span>
                        </div>
                    </div>
                </div>
                <div
                    v-else-if="!isLoading && !isHaveSearchResuls"
                    class="flex flex-1 h-full items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-4">
                        <BaseIcon
                            iconName="SearchOffIcon"
                            class="h-16 w-16 fill-current"
                        />
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-2xl font-bold"
                                >Ничего не найдено</span
                            >
                            <span class="text-main-white/50"
                                >Попробуйте изменить запрос</span
                            >
                        </div>
                    </div>
                </div>
                <div v-else class="flex flex-col gap-6">
                    <!-- Треки -->
                    <div
                        v-if="searchResults?.tracks?.length > 0"
                        class="flex flex-col gap-2"
                    >
                        <h2 class="text-xl font-bold">Треки</h2>
                        <Track
                            v-for="track in searchResults.tracks"
                            :key="track.id"
                            :data="track"
                            :isShowImage="true"
                            :list="
                                searchResults.tracks.map((track) => track.id)
                            "
                        />
                    </div>
                    <!-- Альбомы -->
                    <div
                        v-if="searchResults?.albums?.length > 0"
                        class="flex flex-col gap-2"
                    >
                        <h2 class="text-xl font-bold">Альбомы</h2>
                        <CardsGrid>
                            <AlbumCard
                                v-for="album in searchResults.albums"
                                :album="album"
                                :key="album.id"
                            />
                        </CardsGrid>
                    </div>
                    <div
                        v-if="searchResults?.artists?.length > 0"
                        class="flex flex-col gap-2"
                    >
                        <h2 class="text-xl font-bold">Исполнители</h2>
                        <CardsGrid>
                            <ArtistCard
                                v-for="artist in searchResults.artists"
                                :key="artist.id"
                                :artist="artist.displayName"
                                :artistId="artist.id"
                                :imageURL="artist.imageURL"
                            />
                        </CardsGrid>
                    </div>
                </div>
            </div>
        </div>
    </UserLayout>
</template>
