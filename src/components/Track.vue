<script setup>
import { useAuthStore } from "@stores/auth";
import { useMessageStore } from "@stores/message";
import { usePlayerStore } from "@stores/player";
import { useTracksStore } from "@stores/tracks";
import BaseButton from "@ui/BaseButton.vue";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import TrackImageButton from "./TrackImageButton.vue";
import TrackNumberButton from "./TrackNumberButton.vue";
import MyImage from "@ui/MyImage.vue";
import moment from "moment";

const props = defineProps({
    isShowImage: {
        type: Boolean,
        default: true,
        required: false,
    },
    index: {
        type: Number,
        default: null,
        required: false,
    },
    data: {
        type: Object,
        required: true,
    },
    list: {
        type: Array,
        required: false,
        default: () => [],
    },
});

const router = useRouter();
const tracksStore = useTracksStore();
const playerStore = usePlayerStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const isHover = ref(false);

const isLiked = computed(() => {
    return authStore.currentUserData?.likedTracks?.includes(props.data.id);
});

const isCurrentTrack = computed(() => {
    return props.data.id === playerStore?.currentTrackData?.id;
});

const onClickLike = () => {
    if (isLiked.value) {
        tracksStore.dislikeTrack(props.data.id);
    } else {
        tracksStore.likeTrack(props.data.id);
    }
};

const onClickToggle = () => {
    if (
        props.data.id === playerStore.currentTrackData?.id &&
        playerStore.isPaused
    ) {
        playerStore.resumeCurrentTrack();
    } else if (
        props.data.id === playerStore.currentTrackData?.id &&
        !playerStore.isPaused
    ) {
        playerStore.pauseCurrentTrack();
    } else {
        // const trackList = props.list ? props.list : [props.data.id];
        playerStore.playTrackList({ id: props.data.id, trackList: props.list });
    }
};
const pushToAlbum = () => {
    router.push({ name: "album", params: { albumId: props.data.album.id } });
};

const pushToArtist = () => {
    router.push({
        name: "artist",
        params: { artistId: props.data.author.id },
    });
};

const copyLink = async () => {
    try {
        // Генерируем ссылку на трек

        const trackLink = `${window.location.origin}/album/${props.data.album.id}?trackId=${props.data.id}`;
        await navigator.clipboard.writeText(trackLink);

        messageStore.showMessage(
            `Ссылка на трек ${props.data.title} (${props.data.album.title}) успешно скопирована.`
        );
    } catch (error) {
        messageStore.showMessage(`Произошла ошибка при копированнии ссылки.`);
    }
};

const formattedDuration = computed(() => {
    const duration = props.data.duration;
    if (!duration) return "0:00";

    // Получаем часы из длительности
    const hours = Math.floor(duration / 3600);
    // Если есть часы, показываем их, иначе только минуты и секунды
    const format = hours > 0 ? "H:mm:ss" : "m:ss";

    return moment.utc(duration * 1000).format(format);
});
</script>
<template>
    <div
        class="flex flex-row items-center justify-start rounded-lg list-none h-16 p-2 gap-4 hover:bg-main-white dark:hover:bg-main-gray transition-all w-full"
        :class="{ 'bg-main-white dark:bg-main-gray': isCurrentTrack }"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
    >
        <button
            @click="onClickToggle"
            class="flex h-full flex-shrink-0 aspect-square items-center justify-center"
        >
            <TrackImageButton
                v-if="props.isShowImage"
                :image-url="props.data.imageURL"
                :track-id="props.data.id"
                :is-hover="isHover"
            />
            <TrackNumberButton
                v-else
                :index="props.index"
                :track-id="props.data.id"
                :is-hover="isHover"
            />
        </button>

        <div class="flex flex-row items-center min-w-0 flex-1 gap-4">
            <span
                class="truncate font-semibold hover:text-black dark:hover:text-white"
            >
                {{ props.data.title }}
            </span>

            <BaseIcon
                v-if="props.data.isExplicit"
                iconName="ExplicitIcon"
                class="flex-shrink-0 fill-main-light-gray"
            />
        </div>

        <span v-show="isHover" class="text-main-white/50 p-2 transition">{{
            formattedDuration
        }}</span>
        <BaseButton
            @click="onClickLike"
            class="flex-shrink-0"
            type="text"
            :iconName="isLiked ? 'FavoriteFillIcon' : 'FavoriteIcon'"
            :title="isLiked ? 'Нравится' : 'Не нравится'"
        />
        <DropDownMenuLayout placement="bottom-left">
            <template v-slot:trigger>
                <BaseButton
                    class="ml-auto"
                    type="text"
                    iconName="MoreHorizIcon"
                />
            </template>
            <template v-slot:content>
                <DropDownMenuItem
                    @click="onClickLike"
                    :iconName="isLiked ? 'FavoriteFillIcon' : 'FavoriteIcon'"
                    :text="isLiked ? 'Нравится' : 'Не нравится'"
                />
                <DropDownMenuItem
                    @click="pushToAlbum"
                    iconName="ArrowTopRightIcon"
                    text="Перейти к альбому"
                />
                <DropDownMenuItem
                    @click="pushToArtist"
                    iconName="ArrowTopRightIcon"
                    text="Перейти к исполнителю"
                />
                <DropDownMenuItem
                    @click="copyLink"
                    iconName="ShareIcon"
                    text="Копировать ссылку"
                />
            </template>
        </DropDownMenuLayout>
    </div>
</template>
