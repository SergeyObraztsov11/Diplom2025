<script setup>
import { usePlayerStore } from "@stores/player";
import BaseButton from "@ui/BaseButton.vue";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const playerStore = usePlayerStore();

let timer = null;
const isProgressDragging = ref(false);
const progressCurrentValue = ref(0);

onMounted(() => {
    timer = setInterval(() => {
        playerStore.updateCurrentTime();
    }, 500);
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});

// Обработчик начала перемещения ползунка
const handleInput = (event) => {
    isProgressDragging.value = true;
    progressCurrentValue.value = Number(event.target.value);
};

// Обработчик окончания перемещения ползунка
const handleChange = (event) => {
    isProgressDragging.value = false;
    playerStore.setCurrentTime(Number(event.target.value));
};

const onClickToggleTrack = () => {
    if (playerStore.isPaused) {
        playerStore.resumeCurrentTrack();
    } else {
        playerStore.pauseCurrentTrack();
    }
};

const onClickPlayNextTrack = () => {
    playerStore.playNextTrack();
};

const onClickPlayPreviousTrack = () => {
    playerStore.playPreviousTrack();
};

// const onClickShuffleToggle = () => {
//     playerStore.isShuffle = !playerStore.isShuffle;
// };
const onClickLoopToggle = () => {
    playerStore.loopStatusToggle();
};

const onClickVolumeToggle = () => {
    playerStore.isMuted = !playerStore.isMuted;
};

const onClickLikeToggle = () => {
    playerStore.likeToggle();
};

const loopIconName = computed(() => {
    return playerStore.currentLoopStatus ===
        playerStore.loopStatuses.SINGLE_TRACK
        ? "LoopOneIcon"
        : "LoopIcon";
});

const isLiked = computed(() => playerStore.isLiked);

const isCanPlayPreviousTrack = computed(() => {
    if (
        playerStore.currentLoopStatus === playerStore.loopStatuses.OFF &&
        playerStore.isCurrentTrackFirst
    ) {
        return false;
    }

    return true;
});

const isCanPlayNextTrack = computed(() => {
    if (
        playerStore.currentLoopStatus === playerStore.loopStatuses.OFF &&
        playerStore.isCurrentTrackLast
    ) {
        return false;
    }

    return true;
});

const pushToAlbum = () => {
    if (playerStore.currentTrackData?.album?.id) {
        router.push({
            name: "album",
            params: { albumId: playerStore.currentTrackData.album.id },
        });
    }
};

const pushToArtist = () => {
    if (playerStore.currentTrackData?.author?.id) {
        router.push({
            name: "artist",
            params: { artistId: playerStore.currentTrackData.author.id },
        });
    }
};

// Функция для копирования ссылки (необходимо реализовать логику)
const copyLink = async () => {
    if (!playerStore.currentTrackData?.id) {
        console.error("Нет данных о текущем треке для копирования ссылки.");
        return;
    }
    const trackUrl = `${window.location.origin}/album/${playerStore.currentTrackData.album.id}?trackId=${playerStore.currentTrackData.id}`;
    try {
        await navigator.clipboard.writeText(trackUrl);
        // Возможно, показать сообщение об успешном копировании
        console.log("Ссылка скопирована:", trackUrl);
    } catch (err) {
        console.error("Ошибка при копировании ссылки:", err);
        // Возможно, показать сообщение об ошибке
    }
};
</script>

<template>
    <div
        v-if="playerStore.isPlayerOpen"
        class="sticky bottom-0 left-0 right-0 bg-white dark:bg-main-black z-10 backdrop-blur-sm"
    >
        <!-- Прогресс-бар -->
        <input
            class="h-1 w-full cursor-pointer"
            id="progress"
            type="range"
            :min="0"
            :max="playerStore.audioDuration"
            step="1"
            :value="
                isProgressDragging
                    ? progressCurrentValue
                    : playerStore.audioCurrentTime
            "
            @input="handleInput"
            @change="handleChange"
        />

        <!-- Основной контейнер плеера -->
        <!-- Используем flexbox на мобильных, grid на md и выше -->
        <div
            class="flex flex-row items-center p-2 gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-2"
        >
            <!-- Левая секция: Обложка, Название, Исполнитель, Лайк, Опции -->
            <!-- flex-grow на мобильных, чтобы занять место -->
            <!-- На grid (md+), занимает первую колонку -->
            <div
                class="flex items-center gap-2 flex-grow md:flex-grow-0 min-w-0 md:min-w-[180px]"
            >
                <!-- Обложка - сохраняем размер -->
                <div class="h-20  w-20 rounded-md overflow-hidden flex-shrink-0">
                    <MyImage
                        :url="playerStore?.currentTrackData?.album?.imageURL"
                    />
                </div>

                <!-- Информация о треке и исполнителе - текст обрезается -->
                <div class="flex flex-col justify-center min-w-0">
                    <RouterLink
                        :to="{
                            name: 'album',
                            params: {
                                albumId: playerStore.currentTrackData.album.id,
                            },
                        }"
                        class="min-w-0"
                    >
                        <span
                            class="font-semibold text-lg truncate block hover:text-white"
                        >
                            {{ playerStore.currentTrackData.title }}
                        </span>
                    </RouterLink>

                    <RouterLink
                        :to="{
                            name: 'artist',
                            params: {
                                artistId:
                                    playerStore.currentTrackData.author.id,
                            },
                        }"
                        class="min-w-0"
                    >
                        <span class="truncate block hover:underline">
                            {{
                                playerStore.currentTrackData.author.displayName
                            }}
                        </span>
                    </RouterLink>
                </div>

                <!-- Кнопки Лайк и Опции -->
                <div
                    class="flex items-center gap-1 flex-shrink-0 ml-auto md:ml-0"
                >
                    <BaseButton
                        @click="onClickLikeToggle"
                        type="text"
                        size="2xl"
                        :iconName="
                            playerStore.isLiked
                                ? 'FavoriteFillIcon'
                                : 'FavoriteIcon'
                        "
                        :title="
                            playerStore.isLiked ? 'Нравится' : 'Не нравится'
                        "
                    />
                    <DropDownMenuLayout placement="top-right">
                        <template v-slot:trigger>
                            <BaseButton
                                type="text"
                                size="2xl"
                                iconName="MoreHorizIcon"
                            />
                        </template>
                        <template v-slot:content>
                            <DropDownMenuItem
                                @click="onClickLikeToggle"
                                :iconName="
                                    isLiked
                                        ? 'FavoriteFillIcon'
                                        : 'FavoriteIcon'
                                "
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
            </div>

            <!-- Центральная секция: Кнопки управления воспроизведением -->
            <!-- justify-center для центрирования внутри этого блока -->
            <!-- order-first на мобильных, чтобы быть первым элементом в flex row -->
            <!-- На grid (md+), занимает вторую колонку, которая auto по ширине и центрирует содержимое -->
            <div
                class="flex items-center justify-center gap-2 flex-shrink-0 order-first md:order-none"
            >
                <BaseButton
                    @click="onClickPlayPreviousTrack"
                    :action="isCanPlayPreviousTrack ? 'default' : 'disabled'"
                    :disabled="!isCanPlayPreviousTrack"
                    type="text"
                    size="6xl"
                    iconName="PreviousArrowIcon"
                />

                <BaseButton
                    @click="onClickToggleTrack"
                    type="text"
                    size="6xl"
                    :iconName="
                        playerStore.isPaused
                            ? 'PlayCircleIcon'
                            : 'PauseCircleIcon'
                    "
                />

                <BaseButton
                    @click="onClickPlayNextTrack"
                    type="text"
                    :action="isCanPlayNextTrack ? 'default' : 'disabled'"
                    :disabled="!isCanPlayNextTrack"
                    size="6xl"
                    iconName="NextArrowIcon"
                />
            </div>

            <!-- Правая секция: Повтор, Громкость -->
            <!-- hidden на мобильных, flex на md+ -->
            <!-- justify-end для выравнивания вправо -->
            <!-- На grid (md+), занимает третью колонку -->
            <div
                class="hidden md:flex items-center justify-end gap-2 flex-shrink-0"
            >
                <!-- Кнопка повтора -->
                <BaseButton
                    @click="onClickLoopToggle"
                    type="text"
                    size="2xl"
                    :action="
                        playerStore.currentLoopStatus ===
                        playerStore.loopStatuses.OFF
                            ? 'disabled'
                            : 'default'
                    "
                    :iconName="loopIconName"
                />

                <BaseButton
                    @click="onClickVolumeToggle"
                    type="text"
                    size="2xl"
                    :iconName="
                        !playerStore.isMuted ? `VolumeUpIcon` : `VolumeOffIcon`
                    "
                />
                <!-- Ползунок громкости - сохраняем размер -->
                <input
                    id="volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    class="w-28 h-1 cursor-pointer"
                    v-model.number="playerStore.volume"
                />
            </div>
        </div>
    </div>
</template>
