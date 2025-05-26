import { useAuthStore } from "@stores/auth";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useTracksStore } from "@stores/tracks";

export const usePlayerStore = defineStore("player", () => {
    const tracksStore = useTracksStore();
    const authStore = useAuthStore();

    const isPlayerOpen = ref(false); // Открыт ли плеер
    const isLoading = ref(true); // Статус загрузки

    const currentTrackData = ref(null); // Данные запущенного трека
    const _currentTrackList = ref([]); // Очередь треков
    const _audio = ref(new Audio());

    const isPaused = ref(false); // Статус паузы
    const isShuffle = ref(false); // TODO: Случайный порядок воспроизведения

    // Индекс текущего трека в очереди
    const currentTrackIndex = computed(() => {
        return _currentTrackList.value.indexOf(currentTrackData.value?.id);
    });
    // Является ли текущий трек последним в очереди
    const isCurrentTrackLast = computed(() => {
        if (!_currentTrackList.value || !currentTrackData.value) return false;
        const isLast =
            currentTrackIndex.value === _currentTrackList.value.length - 1;
        return isLast;
    });
    // Является ли текущий трек первым в очереди
    const isCurrentTrackFirst = computed(() => {
        if (!_currentTrackList.value || !currentTrackData.value) return false;
        const isFirst = currentTrackIndex.value === 0;
        return isFirst;
    });

    const isLiked = computed(() => {
        if (!currentTrackData.value) return false;
        return authStore.currentUserData.likedTracks.includes(
            currentTrackData.value.id
        );
    });

    const likeToggle = async () => {
        const currentTrackId = currentTrackData.value.id;
        if (isLiked.value) {
            await tracksStore.dislikeTrack(currentTrackId);
        } else {
            await tracksStore.likeTrack(currentTrackId);
        }
    };

    const loopStatuses = {
        OFF: "OFF", // 1 - Выключено
        ON: "ON", // 2 - Зацикливание плейлиста
        SINGLE_TRACK: "SINGLE_TRACK", // 3 - Проигрывается только один трек
    };

    const currentLoopStatus = ref(loopStatuses.OFF);

    const loopStatusToggle = () => {
        switch (currentLoopStatus.value) {
            case loopStatuses.OFF: {
                currentLoopStatus.value = loopStatuses.ON;
                break;
            }
            case loopStatuses.ON: {
                currentLoopStatus.value = loopStatuses.SINGLE_TRACK;
                break;
            }
            case loopStatuses.SINGLE_TRACK: {
                currentLoopStatus.value = loopStatuses.OFF;
                break;
            }
            default: {
                currentLoopStatus.value = loopStatuses.OFF;
                break;
            }
        }
    };

    // Запускает трек из списка
    const playTrackList = async ({ id, trackList }) => {
        _currentTrackList.value = trackList;
        playTrack(id ? id : trackList[0]);
    };

    // Следующий трек
    const playNextTrack = () => {
        const index = currentTrackIndex.value;
        const isLastTrack = isCurrentTrackLast.value;
        const loopStatus = currentLoopStatus.value;

        // Определяем индекс следующего трека в зависимости от режима воспроизведения
        const nextIndex = getNextTrackIndex(index, isLastTrack, loopStatus);
        if (nextIndex === null) return;

        // Запускаем следующий трек
        playTrack(_currentTrackList.value[nextIndex]);
    };
    // Предыдущий трек
    const playPreviousTrack = () => {
        const index = currentTrackIndex.value;
        const isFirstTrack = isCurrentTrackFirst.value;
        const loopStatus = currentLoopStatus.value;

        // Определяем индекс предыдущего трека в зависимости от режима воспроизведения
        const previousIndex = getPreviousTrackIndex(
            index,
            isFirstTrack,
            loopStatus
        );
        if (previousIndex === null) return;

        // Запускаем предыдущий трек
        playTrack(_currentTrackList.value[previousIndex]);
    };
    // Вспомогательная функция для определения индекса следующего трека
    const getNextTrackIndex = (currentIndex, isLastTrack, loopStatus) => {
        if (loopStatus === loopStatuses.SINGLE_TRACK) {
            return currentIndex; // Повтор текущего трека
        }

        if (loopStatus === loopStatuses.ON) {
            return isLastTrack ? 0 : currentIndex + 1; // Зацикливание плейлиста
        }

        if (loopStatus === loopStatuses.OFF && !isLastTrack) {
            return currentIndex + 1; // Обычное воспроизведение
        }

        return null;
    };

    // Вспомогательная функция для определения индекса предыдущего трека
    const getPreviousTrackIndex = (currentIndex, isFirstTrack, loopStatus) => {
        if (loopStatus === loopStatuses.SINGLE_TRACK) {
            return currentIndex; // Повтор текущего трека
        }

        if (loopStatus === loopStatuses.ON) {
            // Если трек первый и зациклен, то переходим к последнему треку
            return isFirstTrack
                ? _currentTrackList.value.length - 1
                : currentIndex - 1;
        }

        if (loopStatus === loopStatuses.OFF) {
            return isFirstTrack ? null : currentIndex - 1;
        }

        console.log("Достигнуто начало плейлиста");
        return null;
    };

    // Запуск трека в плеере
    const playTrack = async (id) => {
        isLoading.value = true; // Начало загрузки
        try {
            const trackData = await tracksStore.getTrackById(id);

            if (trackData) {
                currentTrackData.value = trackData;
                isPlayerOpen.value = true;
                _audio.value.src = trackData.audioURL;
                _audio.value.addEventListener("ended", () => playNextTrack());
                _audio.value.load();
                await _audio.value.play();
                isPaused.value = false;

            }
        } catch (error) {
            isPaused.value = true;
        } finally {
            isLoading.value = false;
        }
    };
    const audioCurrentTime = ref(0); // Текущее время воспроизведения
    const audioDuration = ref(0); // Длительность текущего трека

    const _isMuted = ref(false);
    const isMuted = computed({
        get: () => _isMuted.value,
        set: (newValue) => {
            _audio.value.volume = newValue ? 0 : volume.value;
            _isMuted.value = newValue;
        },
    });

    const _volume = ref(0.5); // Звук от 0 до 1
    const volume = computed({
        get: () => _volume.value,
        set: (newVolume) => {
            if (_audio.value) {
                _audio.value.volume = newVolume;
            }
            isMuted.value = false;
            _volume.value = newVolume;
        },
    });
    // Пауза
    const pauseCurrentTrack = () => {
        if (_audio.value) {
            _audio.value.pause();
            isPaused.value = true;
        }
    };

    // Продолжение
    const resumeCurrentTrack = () => {
        if (_audio.value) {
            _audio.value.play();
            isPaused.value = false;
        }
    };

    const updateCurrentTime = () => {
        if (_audio.value) {
            audioCurrentTime.value = _audio.value.currentTime;
            audioDuration.value = _audio.value.duration;
        }
    };

    const setCurrentTime = (newCurrentTime) => {
        _audio.value.currentTime = newCurrentTime;
    };
    return {
        isCurrentTrackFirst,
        isCurrentTrackLast,
        currentTrackIndex,
        isLiked,
        likeToggle,
        isPlayerOpen,
        currentTrackData,
        isLoading,
        isPaused,
        volume,
        isShuffle,
        playTrack,
        pauseCurrentTrack,
        resumeCurrentTrack,
        updateCurrentTime,
        audioDuration,
        audioCurrentTime,
        setCurrentTime,
        playTrackList,
        playNextTrack,
        playPreviousTrack,
        isMuted,
        currentLoopStatus,
        loopStatuses,
        loopStatusToggle,
    };
});
