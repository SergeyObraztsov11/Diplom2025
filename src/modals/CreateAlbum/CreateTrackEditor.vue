<script setup>
import { computed, ref } from "vue";

const emit = defineEmits(["track-created", "close"]);

const title = ref("");
const audioFile = ref(null);
const isExplicit = ref(false);
const duration = ref(null);

const errors = ref([]);

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener("loadedmetadata", () => {
        duration.value = parseFloat(audio.duration);
    });
    audioFile.value = file;

    if (!title.value) {
        title.value = file.name;
    }
};

const close = () => {
    emit("close");
};

const validateForm = () => {
    const validationErrors = [];

    if (!title.value || title.value.trim() === "") {
        validationErrors.push("Введите название трека");
    }
    if (!audioFile.value) {
        validationErrors.push("Загрузите аудиофайл");
    }

    errors.value = validationErrors;
    return errors.value.length === 0;
};

const create = () => {
    errors.value = [];

    if (!validateForm()) {
        console.log("Form validation failed.");
        return;
    }

    const data = {
        title: title.value.trim(),
        audioFile: audioFile.value,
        isExplicit: isExplicit.value,
        duration: duration.value,
    };
    emit("track-created", data);
};

const audioInput = ref();
const openAudioFileSelect = () => audioInput.value.click();
</script>
<template>
    <div class="flex flex-col w-full gap-2">
        <input
            v-model.trim="title"
            type="text"
            placeholder="Название трека"
            class="focus:border-main-white border-2 border-main-gray rounded-lg p-2 bg-transparent appearance-none focus:outline-none"
        />

        <input
            ref="audioInput"
            type="file"
            accept=".mp3"
            class="hidden"
            @change="handleFileChange"
        />

        <div class="flex flex-row gap-2">
            <input
                v-model="isExplicit"
                id="explicit"
                type="checkbox"
                title="Контент для взрослых"
            />
            <label for="explicit">Контент для взрослых</label>
        </div>
        <div class="text-sm text-main-white/50">
            <span>Ограничения для аудиофайла:</span>
            <ul class="list-disc list-inside">
                <li>
                    Аудиофайл не должен превышать 100 МБ и должен быть в формате
                    MP3.
                </li>
                <li>Аудиофайл не должен нарушать авторские и смежные права.</li>
            </ul>
        </div>

        <ul
            v-if="errors.length"
            class="text-main-error-red list-disc list-inside"
        >
            <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>

        <div class="flex flex-row w-full gap-2 items-center justify-start">
            <button
                type="button"
                @click="close"
                class="mr-auto px-4 py-2 text-main-white/50 hover:text-main-white transition-colors rounded-lg"
            >
                Отмена
            </button>
            <button
                type="button"
                @click="openAudioFileSelect"
                class="px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
            >
                {{ audioFile ? audioFile.name : "Выбрать файл" }}
            </button>
            <button
                type="button"
                @click="create"
                class="px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                :class="{
                    'opacity-50':
                        errors.length > 0 || !title || !audioFile || !duration,
                }"
            >
                Добавить
            </button>
        </div>
    </div>
</template>
