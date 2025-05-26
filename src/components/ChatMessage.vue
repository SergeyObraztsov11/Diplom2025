<script setup>
import { ref, computed } from "vue";
import moment from "@/config/momentConfig";

const props = defineProps({
    sender: {
        type: Object,
        required: true,
    },
    content: {
        type: Object,
        required: true,
    },
    timestamp: {
        type: Object,
        required: true,
    },
    isCurrentUserMessage: {
        type: Boolean,
        default: false,
        required: false,
    },
});

const formattedDate = computed(() => {
    const date = props.timestamp.toDate();
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
    <div
        class="flex flex-col w-full"
        :class="isCurrentUserMessage ? 'items-end' : 'items-start'"
    >
        <div
            class="flex flex-col w-fit max-w-full sm:max-w-[70%] p-3 rounded-2xl break-words"
            :class="[
                isCurrentUserMessage
                    ? 'bg-main-white/10 ml-6 items-end'
                    : 'bg-main-gray mr-6 items-start',
            ]"
        >
            <div
                class="flex flex-row w-full gap-2 mb-1 items-center"
                :class="isCurrentUserMessage ? 'justify-end' : 'justify-start'"
            >
                <span class="text-white font-semibold truncate">
                    {{ sender.displayName }}
                </span>
                <span class="text-xs text-main-white/50 truncate">
                    {{ formattedDate }}
                </span>
            </div>
            <p
                class="flex w-fit text-main-white text-pretty"
                :class="isCurrentUserMessage ? 'text-right' : 'text-left'"
            >
                {{ props.content.value }}
            </p>
        </div>
    </div>
</template>
