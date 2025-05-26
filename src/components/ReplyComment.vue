<script setup>
import moment from "@/config/momentConfig";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import CreateComment from "@components/CreateComment.vue";
import { useCommentsStore } from "@stores/comments";
import { computed, ref, onMounted } from "vue";
import { useModalsStore } from "@stores/modals";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import { update } from "lodash";

const props = defineProps({
    comment: Object,
    updateRootComments: Function,
    updateReplyComments: Function,
});

const commentsStore = useCommentsStore();
const modalsStore = useModalsStore();

const isShowCreateComment = ref(false);

const formattedDate = computed(() => {
    const date = props.comment.createdAt
        ? props.comment.createdAt.toDate()
        : new Date();

    const now = moment(); // Текущая дата
    const commentTime = moment(date); // Дата комментария
    // Разница в минутах
    const diffInMinutes = now.diff(commentTime, "minutes");

    if (diffInMinutes < 60 * 24) {
        return commentTime.fromNow(); // X минут назад
    } else {
        return commentTime.format("D MMMM YYYY"); // Форматируем дату
    }
});

// Функция для создания ответа
const createReply = async (text) => {
    await commentsStore.uploadComment(
        props.comment.album.id,
        text,
        props.comment.parent.id
    );
    await props.updateReplyComments();
    await props.updateRootComments();
    isShowCreateComment.value = false;
};

const onOpenReportModal = () => {
    modalsStore.openModal("report", {
        type: "comment",
        targetId: props.comment.id,
    });
};
</script>
<template>
    <div class="flex w-full flex-col py-1 items-start gap-1">
        <!-- Заголовок комментария -->
        <div class="flex flex-row w-full items-center gap-2">
            <img
                v-if="comment.user?.imageURL"
                :src="comment.user.imageURL"
                class="w-8 h-8 rounded-full object-cover"
            />
            <div class="flex flex-col gap-1">
                <div class="flex flex-row items-center gap-2">
                    <span class="text-sm font-medium">{{
                        comment.user.displayName
                    }}</span>
                    <span class="text-xs text-main-white/50">{{
                        formattedDate
                    }}</span>
                </div>
                <p class="text-sm text-main-white/80">{{ comment.text }}</p>
            </div>
            <DropDownMenuLayout>
                <template v-slot:trigger>
                    <button
                        class="flex items-center justify-center transition-all"
                    >
                        <BaseIcon
                            iconName="MoreHorizIcon"
                            class="fill-white w-3 h-3"
                        />
                    </button>
                </template>
                <template v-slot:content>
                    <DropDownMenuItem
                        @click="onOpenReportModal"
                        iconName="ReportIcon"
                        :isRed="true"
                        text="Пожаловаться на комментарий"
                    />
                </template>
            </DropDownMenuLayout>
        </div>

        <!-- Нижняя часть комментария -->
        <div class="flex flex-col gap-2">
            <CreateComment
                v-if="isShowCreateComment"
                @createComment="createReply"
                @cancel="isShowCreateComment = false"
            />
            <button
                v-else
                @click="isShowCreateComment = true"
                class="text-xs font-medium text-main-white/50 hover:text-white transition-colors"
            >
                Ответить
            </button>
        </div>
    </div>
</template>
