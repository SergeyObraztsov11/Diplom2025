<script setup>
import moment from "@/config/momentConfig";
import CreateComment from "@components/CreateComment.vue";
import RootComment from "@components/RootComment.vue";
import Track from "@components/Track.vue";
import TrackSkeleton from "@components/TrackSkeleton.vue";
import UserLayout from "@layouts/UserLayout.vue";
import { useAlbumsStore } from "@stores/albums";
import { useAuthStore } from "@stores/auth";
import { useCommentsStore } from "@stores/comments";
import { useMessageStore } from "@stores/message";
import { useModalsStore } from "@stores/modals";
import { usePlayerStore } from "@stores/player";
import { useTracksStore } from "@stores/tracks";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
    albumId: {
        type: String,
        required: true,
    },
});

const route = useRoute();
const router = useRouter();

const tracksStore = useTracksStore();
const messageStore = useMessageStore();
const authStore = useAuthStore();
const albumStore = useAlbumsStore();
const commentsStore = useCommentsStore();
const playerStore = usePlayerStore();
const modalsStore = useModalsStore();

const isLoading = ref(true);

const album = ref({});
const albumComments = ref([]);

// Форматирование даты
const formattedDate = computed(() => {
    if (!album.value.createdAt) return "Дата создания не указана";
    return moment(album.value.createdAt.toDate()).format("D MMMM YYYY");
});

// Загрузка комментариев
const loadComments = async () => {
    albumComments.value = await commentsStore.getAlbumRootComments(
        props.albumId
    );
};
// Проверка, понравился ли альбом пользователю
const isAlbumLiked = computed(() => {
    return albumStore.likedAlbums?.includes(album.value.id);
});
// Функция для обработки начального воспроизведения по параметру URL
const handleInitialTrackPlayback = () => {
    const trackIdFromParams = route.query?.trackId;
    const albumTracksId = album.value.tracks.map((track) => track.id);

    if (trackIdFromParams && albumTracksId.includes(trackIdFromParams)) {
        // Запускаем трек если он найден
        playerStore.playTrackList({
            id: route.query.trackId,
            trackList: albumTracksId,
        });
        // Удаляем параметр trackId из URL
        const newQuery = { ...route.query };
        delete newQuery.trackId;

        router.replace({
            name: route.name,
            params: route.params,
            query: newQuery,
        });
    }
};
onMounted(async () => {
    isLoading.value = true;
    try {
        const albumData = await albumStore.getAlbumById(props.albumId);

        const tracks = await tracksStore.getTracksById(
            albumData.tracks.map((track) => track.id)
        );
        album.value = {
            ...albumData,
            tracks: tracks,
        };

        albumComments.value = await commentsStore.getAlbumRootComments(
            props.albumId
        );
        // Проверяем наличие параметра trackId в URL
        handleInitialTrackPlayback();
    } catch (error) {
        messageStore.showMessage("Ошибка при загрузке альбома");
        console.log(error);
        router.push({ name: "home" });
    } finally {
        isLoading.value = false;
    }
});
// Функция для создания комментария
const createComment = async (text) => {
    await commentsStore.uploadComment(album.value.id, text);
    await loadComments(); // Перезагрузка комментариев после добавления
};

// Функция для воспроизведения альбома
const onClickPlayAlbum = () => {
    const firstTrackId = album.value.tracks[0].id;
    playerStore.playTrackList({
        id: firstTrackId,
        trackList: album.value.tracks.map((track) => track.id),
    });
};

// Функция для лайка альбома
const onClickLike = async () => {
    if (isAlbumLiked.value) {
        await albumStore.dislikeAlbum(album.value.id);
    } else {
        await albumStore.likeAlbum(album.value.id);
    }
};

// Функция для копирования ссылки на альбом
const onCopyLink = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        messageStore.showMessage(
            `Ссылка на альбом ${album.value.title} успешно скопирована.`
        );
    } catch (error) {
        messageStore.showMessage(`Произошла ошибка при копированнии ссылки.`);
    }
};

const onOpenReportModal = () => {
    modalsStore.openModal("report", {
        type: "album",
        targetId: album.value.id,
        targetUserId: album.value.author.id,
    });
};

// Добавляем вычисляемое свойство для подсчета общего количества комментариев
const totalCommentsCount = computed(() => {
    return albumComments.value.reduce((total, comment) => {
        return total + 1 + (comment.replies || 0); // +1 для самого комментария и +replies для ответов
    }, 0);
});
// Функция для склонения слова "комментарий"
const getRepliesCountText = (count) => {
    if (count === 1) {
        return "1 комментарий";
    } else if (count > 1 && count < 5) {
        return `${count} комментария`;
    } else {
        return `${count} комментариев`;
    }
};

const formattedGenre = computed(() => {
    const allGenres = [
        { label: "Поп-музыка", value: "pop" },
        { label: "Рэп и хип-хоп", value: "rap-hip-hop" },
        { label: "Танцевальная", value: "dance" },
        { label: "Классическая", value: "classic" },
        { label: "Блюз", value: "blues" },
        { label: "Панк", value: "punk" },
        { label: "R&B", value: "r-b" },
        { label: "Другое", value: "other" },
    ];
    return (
        allGenres.find((genre) => genre.value === album.value.genre)?.label ||
        "Жанр не указан"
    );
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
</script>
<template>
    <UserLayout>
        <div class="flex flex-col lg:flex-row gap-4">
            <!-- Основной контент -->
            <section class="flex flex-col flex-1 gap-4">
                <!-- Хедер альбома -->
                <div class="flex flex-row gap-4">
                    <!-- Картинка альбома -->
                    <div
                        class="w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                        <MyImage
                            :url="album.imageURL"
                            class="w-full h-full shadow-xl"
                            icon="playlist"
                        />
                    </div>
                    <!-- Информация -->
                    <div class="flex flex-col justify-around w-full">
                        <p class="text-sm font-medium text-white/80">Альбом</p>
                        <!-- Скелетон для названия альбома -->
                        <div
                            v-if="isLoading"
                            class="h-9 md:h-12 w-64 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                        <h1
                            v-else
                            class="text-4xl font-bold tracking-tight text-white truncate"
                        >
                            {{ album.title }}
                        </h1>
                        <!-- Скелетон для названия альбома -->
                        <div v-if="isLoading" class="flex gap-2">
                            <div
                                class="h-5 w-32 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                            ></div>
                            <div
                                class="h-5 w-24 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                            ></div>
                        </div>
                        <div
                            v-else
                            class="flex items-end gap-2 text-white/80 truncate"
                        >
                            <RouterLink
                                class="text-sm font-medium hover:text-white hover:underline truncate"
                                :to="{
                                    name: 'artist',
                                    params: { artistId: album.author.id },
                                }"
                            >
                                {{ album.author.displayName }}
                            </RouterLink>
                            •
                            <span class="text-sm whitespace-nowrap">
                                {{ formattedDate }}
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
                            </template>
                            <template v-else>
                                <button
                                    @click="onClickPlayAlbum"
                                    title="Слушать"
                                    class="p-2 flex items-center justify-center bg-main-color hover:bg-blue-600 rounded-full transition-all"
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
                                            isAlbumLiked
                                                ? 'FavoriteFillIcon'
                                                : 'FavoriteIcon'
                                        "
                                        class="fill-white w-6 h-6"
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
                                            @click="onClickPlayAlbum"
                                            iconName="PlayArrowIcon"
                                            text="Слушать"
                                        />
                                        <DropDownMenuItem
                                            @click="onClickLike"
                                            :iconName="
                                                isAlbumLiked
                                                    ? 'FavoriteFillIcon'
                                                    : 'FavoriteIcon'
                                            "
                                            :text="
                                                isAlbumLiked
                                                    ? 'Нравится'
                                                    : 'Не нравится'
                                            "
                                        />
                                        <DropDownMenuItem
                                            @click="onCopyLink"
                                            iconName="ShareIcon"
                                            text="Копировать ссылку"
                                        />
                                        <DropDownMenuItem
                                            @click="onOpenReportModal"
                                            iconName="ReportIcon"
                                            :isRed="true"
                                            text="Пожаловаться на альбом"
                                        />
                                    </template>
                                </DropDownMenuLayout>
                            </template>
                        </div>
                    </div>
                </div>
                <!-- Список треков -->
                <div class="flex flex-col gap-4">
                    <template v-if="!isLoading">
                        <Track
                            v-for="(track, index) in album.tracks"
                            :is-show-image="false"
                            :index="index + 1"
                            :key="track.id"
                            :data="track"
                            :list="album.tracks.map((track) => track.id)"
                        />
                    </template>
                    <template v-else>
                        <TrackSkeleton
                            :is-show-image="false"
                            v-for="i in 5"
                            :key="i"
                        />
                    </template>
                </div>
                <template v-if="!isLoading">
                    <!-- Кол-во комментариев и сортировка -->
                    <div
                        class="flex flex-row gap-4 items-center justify-between"
                    >
                        <!-- Количество комментариев -->
                        <span class="text-lg font-bold">
                            {{ getRepliesCountText(totalCommentsCount) }}
                        </span>
                        <!-- Сортировка -->
                        <!-- <DropDownSelect
                        :options="[
                            { value: 'desc', label: 'Сначала новые' },
                            { value: 'asc', label: 'Сначала старые' },
                        ]"
                        @changeSortOrder="changeSortOrder"
                    /> -->
                    </div>

                    <!-- Создание комментария -->
                    <CreateComment @createComment="createComment" />

                    <!-- Список комментариев -->
                    <div class="flex flex-col gap-2">
                        <RootComment
                            v-for="rootComment in albumComments"
                            :key="rootComment.id"
                            :comment="rootComment"
                            :updateRootComments="loadComments"
                        />
                    </div>
                </template>
            </section>

            <!-- Сайдбар с информацией -->
            <section class="lg:max-w-80 lg:w-fit lg:min-w-60 space-y-6">
                <!-- Об альбоме -->
                <div>
                    <h2 class="text-xl font-bold mb-3">Об альбоме</h2>
                    <div v-if="isLoading" class="space-y-2">
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
                    <p
                        v-else
                        class="text-base text-main-white text-pretty"
                    >
                        {{ album.description }}
                    </p>
                </div>

                <!-- Информация об исполнителе -->
                <div>
                    <h2 class="text-xl font-bold mb-3">Об исполнителе</h2>
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            v-if="isLoading"
                            class="w-12 h-12 rounded-full bg-main-gray animate-pulse"
                        ></div>
                        <RouterLink
                            v-else
                            class="w-12 h-12 rounded-full overflow-hidden"
                            :to="{
                                name: 'artist',
                                params: { artistId: album.author.id },
                            }"
                        >
                            <MyImage
                                :url="album.author.imageURL"
                                class="w-full h-full"
                            />
                        </RouterLink>
                        <div class="flex-1">
                            <div v-if="isLoading" class="space-y-2">
                                <div
                                    class="h-6 w-32 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                                ></div>
                                <div
                                    class="h-5 w-24 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                                ></div>
                            </div>
                            <div class="justify-around" v-else>
                                <RouterLink
                                    class="text-base font-semibold hover:text-white hover:underline truncate"
                                    :to="{
                                        name: 'artist',
                                        params: { artistId: album.author.id },
                                    }"
                                >
                                    {{ album.author.displayName }}
                                </RouterLink>
                                <p class="text-base text-main-white/50">
                                    {{
                                        getFormatedListenersCount(
                                            album.author.listenersCount
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div v-if="isLoading" class="space-y-2">
                        <div
                            class="h-5 w-full bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                        <div
                            class="h-5 w-4/5 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                    </div>
                    <p
                        v-else
                        class="text-base text-pretty line-clamp-5"
                    >
                        {{ album.author.description }}
                    </p>
                </div>

                <!-- Детали -->
                <div>
                    <h2 class="text-xl font-bold mb-3">Детали</h2>
                    <div v-if="isLoading" class="space-y-2">
                        <div
                            class="h-5 w-36 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                        <div
                            class="h-5 w-24 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                        <div
                            class="h-5 w-32 bg-main-light-gray dark:bg-main-gray rounded animate-pulse"
                        ></div>
                    </div>
                    <div v-else class="space-y-2 text-base">
                        <p>Дата выхода: {{ formattedDate }}</p>
                        <p>Жанр: {{ formattedGenre }}</p>
                    </div>
                </div>
            </section>
        </div>
    </UserLayout>
</template>
