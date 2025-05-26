<script setup>
import ImageInput from "@components/ImageInput.vue";
import ModalsLayout from "@modals/ModalsLayout.vue";
import { useAlbumsStore } from "@stores/albums";
import { useMessageStore } from "@stores/message";
import { useModalsStore } from "@stores/modals";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import moment from "moment";
import { computed, ref } from "vue";
import CreateTrackEditor from "./CreateTrackEditor.vue";

const modalsStore = useModalsStore();
const albumsStore = useAlbumsStore();
const messageStore = useMessageStore();

const isLoading = ref(false);
const errors = ref([]);

const albumTitle = ref("");
const albumDescription = ref("");
const albumImageFile = ref(null);
const isHidden = ref(false);
const trackList = ref([]);
const selectedGenre = ref("");

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

const albumTotalDuration = computed(() => {
    return trackList.value.reduce(
        (accumulator, track) => accumulator + (track.duration || 0),
        0
    );
});

const albumFormattedDuration = computed(() => {
    if (!moment || albumTotalDuration.value === 0) return "00:00";

    const albumDuration = albumTotalDuration.value;
    const duration = moment.duration(albumDuration, "seconds");
    return moment.utc(duration.asMilliseconds()).format("mm:ss");
});

const albumInfo = computed(() => {
    if (!moment) return "Информация об альбоме недоступна";

    if (trackList.value.length === 0) {
        return "Пустой альбом";
    }
    return `Треков: ${trackList.value.length}, Длительность: ${albumFormattedDuration.value}`;
});

const onClickSuccess = async () => {
    errors.value = [];

    if (!validateForm()) {
        console.log("Form validation failed.");
        return;
    }

    try {
        isLoading.value = true;

        const albumData = {
            title: albumTitle.value.trim(),
            description: albumDescription.value
                ? albumDescription.value.trim()
                : "",
            duration: albumTotalDuration.value,
            imageFile: albumImageFile.value,
            isHidden: isHidden.value,
            genre: selectedGenre.value,
            isExplicit: trackList.value.some(
                (track) => track.isExplicit === true
            ),
        };

        const tracksData = trackList.value.map((track, index) => {
            return {
                title: track.title.trim(),
                audioFile: track.audioFile,
                isExplicit: track.isExplicit || false,
                duration: track.duration || 0,
                order: index + 1,
                genre: selectedGenre.value,
            };
        });

        console.log(
            "Attempting to create album with data:",
            albumData,
            "and tracks:",
            tracksData
        );

        await albumsStore.createAlbum({ albumData, tracksData });
        messageStore.showMessage(
            `Альбом "${albumData.title}" успешно загружен!`
        );
        modalsStore.closeModal();
    } catch (error) {
        messageStore.showMessage(`Ошибка: ${error}`);
    } finally {
        isLoading.value = false;
    }
};

const isOpenEditor = ref(false);

const openEditor = () => {
    isOpenEditor.value = true;
};
const closeEditor = () => {
    isOpenEditor.value = false;
};
const trackCreated = (trackData) => {
    trackList.value.push(trackData);
    console.log("Track created:", trackData);
    closeEditor();
};

const deleteTrack = (index) => {
    trackList.value.splice(index, 1);
};

const onImageSelect = (file) => {
    albumImageFile.value = file;
};
const onImageDelete = () => {
    albumImageFile.value = null;
};

const validateForm = () => {
    const validationErrors = [];

    if (!albumTitle.value || albumTitle.value.trim() === "") {
        validationErrors.push("Введите название альбома");
    }
    if (!albumImageFile.value) {
        validationErrors.push("Загрузите обложку альбома");
    }
    if (!selectedGenre.value) {
        validationErrors.push("Выберите жанр");
    }
    if (trackList.value.length === 0) {
        validationErrors.push("Добавьте хотя бы один трек");
    }
    trackList.value.forEach((track, index) => {
        if (!track.title || track.title.trim() === "") {
            validationErrors.push(`Введите название для трека ${index + 1}`);
        }
        if (!track.audioFile) {
            validationErrors.push(`Загрузите аудиофайл для трека ${index + 1}`);
        }
        if (track.duration === 0) {
            console.warn(`Трек ${index + 1} имеет нулевую длительность.`);
        }
    });

    errors.value = validationErrors;
    return errors.value.length === 0;
};

const getFormattedDuration = (value) => {
    if (!moment) return "00:00";
    const duration = moment.duration(value, "seconds");
    return moment.utc(duration.asMilliseconds()).format("mm:ss");
};

const onClickClose = () => {
    const isFormDirty =
        albumTitle.value ||
        albumDescription.value ||
        albumImageFile.value ||
        trackList.value.length > 0 ||
        selectedGenre.value;
    if (isFormDirty) {
        const isCloseModalConfirm = confirm(
            "Вы уверены, что хотите покинуть эту страницу? Ваши последние изменения не будут сохранены."
        );
        if (!isCloseModalConfirm) return;
    }
    modalsStore.closeModal();
};
</script>
<template>
    <ModalsLayout title="Создание альбома" @close="onClickClose">
        <div class="flex flex-col gap-4 w-[600px] max-w-full pb-6 px-6">
            <div class="flex flex-row gap-2">
                <ImageInput
                    class="h-28 w-28 rounded-lg"
                    noImageIconText="Обложка"
                    @selected="onImageSelect"
                    @deleted="onImageDelete"
                />
                <div class="flex flex-col w-full gap-2">
                    <input
                        v-model.trim="albumTitle"
                        type="text"
                        class="flex w-full text-lg p-2 border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white"
                        placeholder="Название альбома"
                    />
                    <textarea
                        v-model.trim="albumDescription"
                        class="w-full p-2 border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white resize-none"
                        placeholder="Описание"
                        name=""
                        id=""
                        rows="3"
                    ></textarea>

                    <!-- <div class="flex gap-2 items-center">
                        <input
                            id="isHidden"
                            v-model="isHidden"
                            type="checkbox"
                            title="Скрыть альбом из поиска и рекомендаций"
                        />
                        <label for="isHidden"
                            >Скрыть альбом из поиска и рекомендаций</label
                        >
                    </div> -->
                    <div class="text-main-white/50">
                        {{ albumInfo }}
                    </div>
                </div>
            </div>

            <select
                v-model="selectedGenre"
                class="bg-main-black focus:bg-main-gray h-10 p-2 border-2 border-main-gray focus:border-main-white transition-colors rounded-lg"
            >
                <option value="">Выберите жанр</option>
                <option
                    v-for="genre in allGenres"
                    :key="genre.value"
                    :value="genre.value"
                >
                    {{ genre.label }}
                </option>
            </select>

            <div
                v-show="trackList.length > 0"
                class="max-h-60 flex flex-col overflow-y-auto gap-2"
            >
                <div
                    v-for="(track, index) in trackList"
                    :key="index"
                    class="flex flex-row w-full h-14 items-center p-2 gap-2 rounded-lg hover:bg-main-white dark:hover:bg-main-gray"
                >
                    <span class="text-main-light-gray p-2">{{
                        index + 1
                    }}</span>
                    <span class="font-semibold truncate">{{
                        track.title
                    }}</span>

                    <BaseIcon
                        v-if="track.isExplicit"
                        iconName="ExplicitIcon"
                        class="fill-main-light-gray"
                    />

                    <span
                        v-if="track.audioFile"
                        class="ml-auto truncate text-main-white/50"
                    >
                        {{ track.audioFile.name }}
                    </span>
                    <span v-else class="ml-auto truncate text-red-500">
                        Файл не выбран
                    </span>

                    <span class="text-main-white/50">{{
                        getFormattedDuration(track.duration)
                    }}</span>

                    <button
                        @click="deleteTrack(index)"
                        class="p-2 text-red-500 hover:text-red-500/50 transition-colors"
                        title="Удалить трек"
                    >
                        <BaseIcon
                            iconName="DeleteIcon"
                            class="fill-current w-5 h-5"
                        />
                    </button>
                </div>
            </div>

            <button
                v-if="!isOpenEditor"
                @click="openEditor"
                class="flex flex-row w-full h-14 py-2 px-4 items-center justify-start gap-2 bg-main-gray transition hover:bg-main-white/20 rounded-lg text-main-white"
            >
                <BaseIcon iconName="AddIcon" class="fill-current w-6 h-6" />
                <span>Добавить</span>
                <BaseIcon
                    iconName="ArrowRightIcon"
                    class="ml-auto fill-current w-6 h-6"
                />
            </button>
            <CreateTrackEditor
                v-else
                @close="closeEditor"
                @track-created="trackCreated"
            />

            <ul
                v-if="errors.length"
                class="p-2 text-main-error-red list-disc list-inside"
            >
                <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>

            <div class="flex justify-end gap-2">
                <button
                    type="button"
                    @click="onClickClose"
                    class="px-4 py-2 text-main-white/50 hover:text-main-white transition-colors rounded-lg"
                >
                    Отмена
                </button>
                <button
                    type="button"
                    @click="onClickSuccess"
                    :disabled="isLoading"
                    class="flex flex-row items-center justify-center gap-2 px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                    :class="{
                        'opacity-50': !(
                            albumTitle &&
                            albumDescription &&
                            albumImageFile &&
                            trackList.length > 0
                        ),
                    }"
                >
                    <template v-if="isLoading">
                        <BaseIcon
                            iconName="ProgressActivityIcon"
                            class="fill-current w-5 h-5"
                        />
                        <span>Создание...</span>
                    </template>

                    <span v-else>Опубликовать</span>
                </button>
            </div>
        </div>
    </ModalsLayout>
</template>
