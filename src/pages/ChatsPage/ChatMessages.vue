<script setup>
import ChatMessage from "@components/ChatMessage.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import CreateMessage from "@components/CreateMessage.vue";
import { useChatsStore } from "@stores/chats";
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useAuthStore } from "@stores/auth";
import MyImage from "@ui/MyImage.vue";

const props = defineProps({
    chatId: {
        type: String,
        required: true,
    },
});

const chatsStore = useChatsStore();
const authStore = useAuthStore();

// Получаем id текущего пользователя
const currentUserId = computed(() => authStore.currentUserId);

const currentChat = computed(() => {
    return chatsStore.chats.find((chat) => {
        return chat.id === props.chatId;
    });
});

const isCurrentUserMessage = (senderId) => {
    return senderId === currentUserId.value;
};
const onSendMessage = (text) => {
    chatsStore.sendMessage(props.chatId, text);
};

// ref на контейнер с сообщениями
const messagesContainer = ref(null);
// Функция для прокрутки вниз
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
                messagesContainer.value.scrollHeight;
        }
    });
};
// CПрокручиваем вниз при мантировании
onMounted(() => {
    scrollToBottom();
});
// Cледим за изменением сообщений для прокрутки вниз
watch(
    () => currentChat.value?.messages?.length,
    () => {
        scrollToBottom();
    }
);
</script>
<template>
    <div class="flex flex-col w-full h-full gap-2">
        <!-- <div class="flex flex-row p-2 w-full gap-2 items-center">
            <button>
                <BaseIcon iconName="CloseIcon" class="fill-main-white h-6 w-6" />
            </button>
            
            <div
                class="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-main-black"
            >
                <MyImage :url="null" loadingIcon="user" />
            </div>

            <div class="text-lg truncate font-semibold hover:text-white">
                Название пользователя
            </div>
        </div> -->
        <div
            ref="messagesContainer"
            class="flex flex-col w-full h-full overflow-y-auto gap-2"
        >
            <ChatMessage
                v-for="message in currentChat?.messages"
                :isCurrentUserMessage="isCurrentUserMessage(message.sender.id)"
                :sender="message.sender"
                :content="message.content"
                :timestamp="message.timestamp"
            />
        </div>
        <CreateMessage @send="onSendMessage" />
    </div>
</template>
