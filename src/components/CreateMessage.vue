<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { ref, computed, watch } from "vue";

const emit = defineEmits(["send"]);
const messageText = ref("");

const isValid = computed(() => {
    return messageText.value.length > 0;
});

// Обработчик нажатия клавиш
const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
    }
};

const onSendMessage = () => {
    if (!messageText.value.trim()) return;
    emit("send", messageText.value);
    messageText.value = "";
};
</script>

<template>
    <div class="flex flex-row w-full items-end gap-2">
        <textarea
            v-model.trim="messageText"
            class="flex focus:border-main-white/50 w-full p-2 text-base bg-transparent border-2 border-main-gray rounded-xl resize-none placeholder:text-main-white/50 transition-colors"
            placeholder="Сообщение"
            @keydown="onKeyDown"
            rows="1"
        />
        <button
            @click="onSendMessage"
            class="px-4 py-2 bg-main-gray rounded-full transition hover:bg-main-white/10 disabled:opacity-50"
            :disabled="!isValid"
            title="Отправить"
        >
            Отправить
            <!-- <BaseIcon iconName="SendIcon" class="fill-current w-6 h-6" /> -->
        </button>
    </div>
</template>
