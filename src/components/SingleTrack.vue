<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import moment from "moment";

const props = defineProps({
    track: {
        type: Object,
        required: true,
    },
});

const isPlaying = ref(false);
const audio = ref(null);
const currentTime = ref(0);
const duration = ref(0);

const togglePlay = () => {
    if (!audio.value) {
        audio.value = new Audio(props.track.audioURL);
        setupAudioListeners();
    }

    if (isPlaying.value) {
        audio.value.pause();
    } else {
        audio.value.play();
    }

    isPlaying.value = !isPlaying.value;
};

const setupAudioListeners = () => {
    audio.value.addEventListener("timeupdate", () => {
        currentTime.value = audio.value.currentTime;
    });

    audio.value.addEventListener("loadedmetadata", () => {
        duration.value = audio.value.duration;
    });

    audio.value.addEventListener("ended", () => {
        isPlaying.value = false;
        currentTime.value = 0;
    });
};

const handleSeek = (event) => {
    if (!audio.value) return;

    const seekTime =
        (event.offsetX / event.target.offsetWidth) * duration.value;
    audio.value.currentTime = seekTime;
    currentTime.value = seekTime;
};

const getFormatedDuration = (duration) => {
    if (!duration) return "0:00";
    // Получаем часы из длительности
    const hours = Math.floor(duration / 3600);
    // Если есть часы, показываем их, иначе только минуты и секунды
    const format = hours > 0 ? "H:mm:ss" : "m:ss";

    return moment.utc(duration * 1000).format(format);
};

onUnmounted(() => {
    if (audio.value) {
        audio.value.pause();
        audio.value = null;
    }
});
</script>

<template>
    <div class="flex flex-row items-center gap-2 p-2 bg-main-gray rounded-lg">
        <button
            @click="togglePlay"
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-main-white/10"
        >
            <BaseIcon
                :iconName="isPlaying ? 'PauseIcon' : 'PlayArrowIcon'"
                class="fill-main-white h-8 w-8"
            />
        </button>

        <div class="flex flex-col w-full">
            <div class="flex flex-row items-center justify-start gap-1">
                <span class="font-medium text-lg">{{ track.title }}</span>
                <BaseIcon
                    v-if="track.isExplicit"
                    iconName="ExplicitIcon"
                    class="fill-main-white h-4 w-4"
                />
            </div>
            <div class="flex flex-row items-center gap-2">
                <span class="text-sm text-main-white/50">
                    {{ getFormatedDuration(currentTime) }}
                </span>

                <div
                    class="flex-1 h-1 bg-main-white/20 rounded-full cursor-pointer relative"
                    @click="handleSeek"
                >
                    <div
                        class="absolute h-full bg-main-white rounded-full"
                        :style="{ width: `${(currentTime / duration) * 100}%` }"
                    ></div>
                </div>

                <span class="text-sm text-main-white/50">
                    {{ getFormatedDuration(duration) }}
                </span>
            </div>
        </div>
    </div>
</template>
