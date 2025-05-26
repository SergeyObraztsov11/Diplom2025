<script setup>
import AppHeader from "@components/AppHeader.vue";
import AppPlayer from "@components/AppPlayer.vue";
import ModalWindow from "@modals/ModalWindow.vue";
import { useAuthStore } from "@stores/auth";
import { useChatsStore } from "@stores/chats";
import MessageBus from "@ui/MessageBus.vue";
import { watch, onMounted, onUnmounted } from "vue";

const authStore = useAuthStore();
const chatsStore = useChatsStore();

let isChatsSubscribed = false;

const trySubscribeToChats = () => {
    if (!isChatsSubscribed && authStore.currentUserId) {
        chatsStore.subscribeToChats();
        isChatsSubscribed = true;
    }
};

onMounted(() => {
    trySubscribeToChats();
    watch(
        () => authStore.currentUserId,
        (val) => {
            if (val) trySubscribeToChats();
        }
    );
});

onUnmounted(() => {
    chatsStore.unsubscribeChats();
    isChatsSubscribed = false;
});
</script>

<template>
    <router-view />
    <MessageBus />
    <ModalWindow />
</template>

<style>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
