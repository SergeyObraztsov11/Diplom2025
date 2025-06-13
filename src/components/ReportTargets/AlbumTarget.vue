<script setup>
import { ref, onMounted } from "vue";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import SingleTrack from "@components/SingleTrack.vue";
import { formatDate } from "@/utils/formatDate";

const props = defineProps({
    album: {
        type: Object,
        required: true,
    },
});

const tracks = ref([]);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const tracksPromises = props.album.tracks.map(async (trackRef) => {
            const trackDoc = await getDoc(trackRef);
            if (trackDoc.exists()) {
                return { id: trackDoc.id, ...trackDoc.data() };
            }
            return null;
        });
        tracks.value = (await Promise.all(tracksPromises)).filter(Boolean);
    } catch (error) {
        console.error("Ошибка при получении треков:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div
        class="flex flex-col gap-4 max-h-80 border-2 border-main-gray rounded-lg p-4 overflow-y-auto"
    >
        <!-- Информация об альбоме -->
        <div class="flex gap-4">
            <img
                v-if="album?.imageURL"
                :src="album.imageURL"
                class="w-24 h-24 rounded-lg object-cover"
                alt="Обложка альбома"
            />
            <div class="flex flex-col justify-center gap-2">
                <span class="text-2xl font-semibold">{{ album.title }}</span>
                <span class="text-sm text-main-white/50">{{
                    formatDate(album.createdAt)
                }}</span>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-sm text-main-white/50">Описание</span>
            <p class="text-pretty">{{ album?.description }}</p>
        </div>
        <!-- Список треков -->
        <div class="flex flex-col gap-2">
            <div v-if="isLoading" class="text-center">Загрузка треков...</div>
            <div v-else-if="tracks.length === 0" class="text-center">
                Нет треков
            </div>
            <div v-else class="flex flex-col gap-1">
                <SingleTrack
                    v-for="track in tracks"
                    :key="track.id"
                    :track="track"
                />
            </div>
        </div>
    </div>
</template>
