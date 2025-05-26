<script setup>
import Chat from "@components/Chat.vue";
import ChatSkeleton from "@components/ChatSkeleton.vue";
import SearchInput from "@components/SearchInput.vue";
import { useAuthStore } from "@stores/auth";
import { useChatsStore } from "@stores/chats";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import Fuse from "fuse.js";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import UserLayout from "@layouts/UserLayout.vue";

const route = useRoute();

const chatsStore = useChatsStore();
const authStore = useAuthStore();

const currentUserId = computed(() => authStore.currentUserId);

// Функция для получения собеседника
const getCompanion = (participants) => {
    return participants.find((user) => user.id !== currentUserId.value);
};

const searchRequest = ref("");

const fuse = computed(() => {
    return new Fuse(chatsStore.chats, {
        keys: [
            { name: "participants.displayName", weight: 0.7 },
            { name: "messages.content.value", weight: 0.5 },
        ],
        threshold: 0.3,
        minMatchCharLength: 2,
        includeMatches: true,
        shouldSort: true,
        distance: 100,
        location: 0,
    });
});

const showedChats = computed(() => {
    if (!searchRequest.value.trim()) {
        return chatsStore.chats;
    } else {
        return fuse.value
            .search(searchRequest.value)
            .map((result) => result.item);
    }
});

const selectedChatId = computed(() => {
    return route.params.chatId ? route.params.chatId : null;
});
</script>
<template>
    <UserLayout>
        <div class="flex flex-row w-full h-full">
            <!-- Чаты -->
            <div
                class="flex flex-col h-full w-24 md:w-1/3 border-r-2 border-main-gray pr-2 gap-2"
            >
                <!-- Шапка чатов -->
                <RouterLink
                    :to="{ name: 'chats-empty' }"
                    class="hidden md:flex flex-row gap-2 items-center"
                >
                    <BaseIcon
                        iconName="MessageIcon"
                        class="fill-main-white w-9 h-9"
                    />
                    <span
                        class="text-main-white text-4xl font-bold tracking-tight truncate"
                        >Чаты</span
                    >
                </RouterLink>

                <SearchInput
                    class="hidden md:flex"
                    v-model="searchRequest"
                    placeholder="Поиск"
                />
                <div
                    class="flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden"
                >
                    <!-- Чаты -->
                    <template v-if="chatsStore.isInitialLoading">
                        <ChatSkeleton v-for="skeleton in 5" />
                    </template>
                    <template v-else>
                        <Chat
                            v-for="chat in showedChats"
                            :key="chat.id"
                            :id="chat.id"
                            :isSelected="selectedChatId === chat.id"
                            :lastMessage="chat.lastMessage"
                            :companion="getCompanion(chat.participants)"
                        />
                    </template>
                </div>
            </div>
            <div class="pl-2 flex-1"><RouterView /></div></div
    ></UserLayout>
</template>
