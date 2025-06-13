<script setup>
import Track from "@components/Track.vue";
import TrackSkeleton from "@components/TrackSkeleton.vue";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import { useAlbumsStore } from "@stores/albums";
import { useArtistsStore } from "@stores/artists";
import { useAuthStore } from "@stores/auth";
import { useChatsStore } from "@stores/chats";
import { useTracksStore } from "@stores/tracks";
import AlbumCard from "@ui/AlbumCard.vue";
import AlbumCardSkeleton from "@ui/AlbumCardSkeleton.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import SectionHeader from "@ui/SectionHeader.vue";
import { A11y, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserLayout from "@layouts/UserLayout.vue";
import { useMessageStore } from "@stores/message";
import { useModalsStore } from "@stores/modals";
import { usePlayerStore } from "@stores/player";

const props = defineProps({
    artistId: {
        type: String,
        required: false,
    },
});

const modules = [Navigation, A11y];
const router = useRouter();
const route = useRoute();

const tracksStore = useTracksStore();
const artistsStore = useArtistsStore();
const albumsStore = useAlbumsStore();
const authStore = useAuthStore();
const chatsStore = useChatsStore();
const messageStore = useMessageStore();
const modalsStore = useModalsStore();
const playerStore = usePlayerStore();

const isLoading = ref(true);

const artistData = ref({});

onMounted(async () => {
    isLoading.value = true;
    try {
        artistData.value = await artistsStore.getArtistById(props.artistId);
    } catch (error) {
        messageStore.showMessage("Ошибка при загрузке страницы исполнителя.");
    } finally {
        isLoading.value = false;
    }
});

const getFormatedListenersCount = (count) => {
    if (count === 1) {
        return "1 слушатель";
    } else if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M слушателей`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K слушателей`;
    }
    return `${count} слушателей`;
};

const artistTrackList = computed(() => {
    return artistData.value.tracks.map((track) => track.id);
});

const isArtistLiked = computed(() => {
    return authStore?.currentUserData?.likedArtists?.includes(
        artistData.value.id
    );
});

const onClickLike = async () => {
    if (isArtistLiked.value) {
        await artistsStore.dislikeArtist(artistData.value.id);
    } else {
        await artistsStore.likeArtist(artistData.value.id);
    }
};

const onSendMessage = async () => {
    try {
        // Проверяем существование чата
        const existingChat = await chatsStore.getChatByUser(
            artistData.value.id
        );

        if (existingChat) {
            // Если чат существует - переходим к нему
            router.push({
                name: "chat-details",
                params: { chatId: existingChat.id },
            });
        } else {
            // Если чата нет - открываем модалку для первого сообщения
            modalsStore.openModal("startMessage", {
                targetUserId: artistData.value.id,
            });
        }
    } catch (error) {
        messageStore.showMessage("Ошибка при проверке чата");
        console.log(error);
    }
};

const onOpenReportModal = () => {
    modalsStore.openModal("report", {
        type: "user",
        targetId: artistData.value.id,
        targetUserId: artistData.value.id,
    });
};

const onClickPlayPopularTracks = () => {
    playerStore.playTrackList({
        trackList: artistTrackList.value,
    });
};

const displayedTracks = computed(() => {
    return artistData.value?.tracks?.slice(0, 5);
});

const disabledAlbums = computed(() => {
    return artistData.value?.albums?.slice(0, 5);
});
</script>

<template>
    <UserLayout>
        <div class="flex flex-col lg:flex-row gap-4">
            <section class="flex flex-col min-w-0 flex-shrink flex-1 gap-4">
                <!-- Шапка исполнителя -->
                <div class="flex flex-row gap-4">
                    <!-- Аватар исполнителя -->
                    <div
                        class="w-48 h-48 flex-shrink-0 overflow-hidden rounded-full"
                    >
                        <template v-if="isLoading">
                            <div
                                class="w-full h-full bg-main-light-gray dark:bg-main-gray rounded-full animate-pulse"
                            ></div>
                        </template>
                        <template v-else>
                            <MyImage
                                :url="artistData?.imageURL"
                                class="w-full h-full shadow-xl"
                                icon="playlist"
                            />
                        </template>
                    </div>
                    <!-- Информация -->
                    <div class="flex flex-col justify-around w-full">
                        <p class="text-sm font-medium text-white/50">
                            Исполнитель
                        </p>
                        <div
                            v-if="isLoading"
                            class="h-9 md:h-12 w-64 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                        <h1
                            v-else
                            class="text-4xl font-bold tracking-tight text-white truncate"
                        >
                            {{ artistData.displayName }}
                        </h1>
                        <!-- Кол-во слушателей -->
                        <div
                            v-if="isLoading"
                            class="bg-main-gray animate-pulse h-6 w-32 rounded-full"
                        ></div>
                        <div
                            v-else
                            class="flex flex-row w-fit items-center gap-1 py-1 px-2 bg-main-gray text-main-white text-sm rounded-full"
                        >
                            <BaseIcon
                                iconName="PersonIcon"
                                class="fill-white w-4 h-4"
                            />
                            <span class="truncate">
                                {{
                                    getFormatedListenersCount(
                                        artistData.listenersCount
                                    )
                                }}
                            </span>
                        </div>

                        <!-- Кнопки -->
                        <div class="flex items-center gap-3">
                            <template v-if="isLoading">
                                <div
                                    class="bg-main-gray animate-pulse rounded-full w-10 h-10"
                                ></div>
                                <div
                                    class="bg-main-gray animate-pulse rounded-full w-8 h-8"
                                ></div>
                                <div
                                    class="bg-main-gray animate-pulse rounded-full w-8 h-8"
                                ></div>
                                <div
                                    class="bg-main-gray animate-pulse rounded-full w-8 h-8"
                                ></div>
                            </template>
                            <template v-else>
                                <button
                                    class="p-2 flex items-center justify-center bg-main-color hover:bg-blue-600 rounded-full transition-all"
                                    title="Слушать популярное"
                                    @click="onClickPlayPopularTracks"
                                >
                                    <BaseIcon
                                        iconName="PlayArrowIcon"
                                        class="fill-white w-6 h-6"
                                    />
                                </button>
                                <button
                                    @click="onClickLike"
                                    title="Нравится"
                                    class="p-2 flex items-center justify-center hover:scale-110 transition-all"
                                >
                                    <BaseIcon
                                        :iconName="
                                            isArtistLiked
                                                ? 'FavoriteFillIcon'
                                                : 'FavoriteIcon'
                                        "
                                        class="fill-white w-6 h-6"
                                    />
                                </button>
                                <button
                                    @click="onSendMessage"
                                    title="Написать сообщение"
                                    class="p-2 flex items-center justify-center hover:scale-110 transition-all"
                                >
                                    <BaseIcon
                                        iconName="MessageIcon"
                                        class="fill-white w-5 h-5"
                                    />
                                </button>
                                <DropDownMenuLayout>
                                    <template v-slot:trigger>
                                        <button
                                            class="p-2 flex items-center justify-center hover:scale-110 transition-all"
                                        >
                                            <BaseIcon
                                                iconName="MoreHorizIcon"
                                                class="fill-white w-6 h-6"
                                            />
                                        </button>
                                    </template>
                                    <template v-slot:content>
                                        <DropDownMenuItem
                                            @click="onClickPlayPopularTracks"
                                            iconName="PlayArrowIcon"
                                            text="Слушать"
                                        />
                                        <DropDownMenuItem
                                            @click="onClickLike"
                                            :iconName="
                                                isArtistLiked
                                                    ? 'FavoriteFillIcon'
                                                    : 'FavoriteIcon'
                                            "
                                            :text="
                                                isArtistLiked
                                                    ? 'Нравится'
                                                    : 'Не нравится'
                                            "
                                        />
                                        <DropDownMenuItem
                                            @click="onOpenReportModal"
                                            iconName="ReportIcon"
                                            :isRed="true"
                                            text="Пожаловаться на профиль"
                                        />
                                    </template>
                                </DropDownMenuLayout>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Популярные треки -->
                <div class="flex flex-col w-full gap-2">
                    <RouterLink
                        :to="{
                            name: 'artist-tracks',
                            params: {
                                artistId: artistData.id,
                            },
                        }"
                        class="text-2xl font-semibold hover:text-main-white/80 transition-colors"
                    >
                        Популярное
                    </RouterLink>
                    <template v-if="isLoading">
                        <TrackSkeleton
                            v-for="id in 5"
                            :key="id"
                            :isShowImage="true"
                        />
                    </template>
                    <template v-else-if="displayedTracks?.length > 0">
                        <Track
                            v-for="track in displayedTracks"
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
                </div>

                <div class="flex flex-col w-full gap-2">
                    <RouterLink
                        :to="{
                            name: 'artist-albums',
                            params: {
                                artistId: artistData.id,
                            },
                        }"
                        class="text-2xl font-semibold hover:text-main-white/80 transition-colors"
                    >
                        Альбомы
                    </RouterLink>
                    <!-- Скелетоны при загрузке -->
                    <template v-if="isLoading">
                        <div
                            class="flex p-2 flex-row w-full overflow-x-hidden gap-4"
                        >
                            <AlbumCardSkeleton v-for="i in 3" :key="i" />
                        </div>
                    </template>
                    <template v-else-if="disabledAlbums?.length > 0">
                        <Swiper
                            :space-between="32"
                            :modules="modules"
                            navigation
                            slides-per-view="auto"
                            class="w-full"
                        >
                            <SwiperSlide
                                v-for="album in disabledAlbums"
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
                </div>
            </section>
            <!-- Сайдбар с информацией -->
            <section class="lg:max-w-80 lg:w-fit lg:min-w-60 space-y-6">
                <div>
                    <h2 class="text-xl font-bold mb-3">Об исполнителе</h2>
                    <template v-if="isLoading">
                        <div class="space-y-2">
                            <div
                                class="h-5 w-full bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                            ></div>
                            <div
                                class="h-5 w-3/4 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                            ></div>
                            <div
                                class="h-5 w-5/6 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                            ></div>
                        </div>
                    </template>
                    <template v-else>
                        <p
                            v-if="artistData.description"
                            class="text-base text-pretty text-main-white"
                        >
                            {{ artistData.description }}
                        </p>
                        <p v-else class="text-base text-main-white/80">
                            Описание отсутствует.
                        </p>
                    </template>
                </div>
                <div>
                    <!-- Скелетон элементов ссылки -->
                    <template v-if="isLoading">
                        <div
                            v-for="i in 4"
                            class="flex flex-col w-full gap-1 justify-between"
                        >
                            <div
                                class="h-5 w-1/2 bg-main-gray rounded animate-pulse"
                            ></div>

                            <div
                                class="h-5 w-full bg-main-gray rounded animate-pulse"
                            ></div>
                        </div>
                    </template>
                    <template v-else-if="artistData?.socialLinks?.length > 0">
                        <h2 class="text-xl font-bold mb-3">Ссылки</h2>
                        <div
                            v-for="socialLink in artistData.socialLinks"
                            class="flex flex-col w-full gap-1 justify-between"
                        >
                            <a
                                :href="socialLink.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                :title="socialLink.name"
                                class="hover:text-white transition h-5 flex flex-row w-fit items-center gap-1"
                            >
                                <span class="text-base truncate">
                                    {{ socialLink.name }}
                                </span>
                                <BaseIcon
                                    iconName="ArrowOutIcon"
                                    class="fill-current w-5 h-5"
                                />
                            </a>
                            <a
                                :href="socialLink.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                :title="socialLink.name"
                                class="h-5 w-full text-main-white/50 truncate hover:text-main-white hover:underline transition"
                            >
                                {{ socialLink.url }}
                            </a>
                        </div>
                    </template>
                </div>
            </section>
        </div>
    </UserLayout>
</template>
