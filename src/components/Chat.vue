<script setup>
import { ref, computed } from "vue";
import moment from "@/config/momentConfig";
import MyImage from "@ui/MyImage.vue";

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    isSelected: {
        type: Boolean,
        required: true,
    },
    lastMessage: {
        type: Object,
        required: false,
    },
    companion: {
        type: Object,
        required: true,
    },
});

const formattedDate = computed(() => {
    const date = props.lastMessage.timestamp.toDate();
    const now = moment();
    const commentTime = moment(date);

    const diffInMinutes = now.diff(commentTime, "minutes");
    const diffInHours = now.diff(commentTime, "hours");
    const diffInDays = now.diff(commentTime, "days");
    const diffInWeeks = now.diff(commentTime, "weeks");
    const diffInYears = now.diff(commentTime, "years");

    if (diffInMinutes < 1) {
        return "только что";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}м`;
    } else if (diffInHours < 24) {
        return `${diffInHours}ч`;
    } else if (diffInDays < 7) {
        return `${diffInDays}д`;
    } else if (diffInWeeks < 52) {
        return `${diffInWeeks}н`;
    } else {
        return `${diffInYears}г`;
    }
});
</script>

<template>
    <RouterLink
        :to="{ name: 'chat-details', params: { chatId: props.id } }"
        class="flex flex-row h-20 p-2 items-center justify-center gap-2 rounded-lg"
        :class="
            props.isSelected ? 'bg-main-gray' : 'hover:bg-main-gray transition'
        "
    >
        <div
            class="h-16 w-16 rounded-full overflow-hidden shrink-0 border border-main-black"
        >
            <MyImage :url="props.companion.imageURL" loadingIcon="user" />
        </div>
        <div
            class="hidden md:flex flex-col justify-around h-full flex-grow min-w-0"
        >
            <div class="flex flex-row gap-1 items-center justify-between">
                <span class="text-lg font-semibold truncate">
                    {{ props.companion.displayName }}
                </span>
                <!-- Время последнего сообщения -->
                <span class="text-main-white/50 text-sm whitespace-nowrap">{{
                    formattedDate
                }}</span>
            </div>
            <div
                v-if="props.lastMessage"
                class="flex flex-row gap-1 items-center justify-start text-main-white/50"
            >
                <span class="text-base whitespace-nowrap">
                    {{ props.lastMessage.sender.displayName }}:
                </span>
                <!-- Последнее сообщение -->
                <span class="text-base truncate">
                    {{ props.lastMessage.content.value }}
                </span>
            </div>
        </div>
    </RouterLink>
</template>
