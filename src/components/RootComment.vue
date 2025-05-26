<script setup>
import moment from "@/config/momentConfig";
import { useCommentsStore } from "@stores/comments";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed, ref, onMounted } from "vue";
import ReplyComment from "./ReplyComment.vue";
import CreateComment from "./CreateComment.vue";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import { useModalsStore } from "@stores/modals";
import { formatDate } from "@/utils/formatDate";
import { useAuthStore } from "@stores/auth";

const props = defineProps({
    comment: {
        type: Object,
        required: true,
    },
    updateRootComments: {
        type: Function,
        required: true,
    },
});

const modalsStore = useModalsStore();
const commentsStore = useCommentsStore();
const authStore = useAuthStore();

const showReplies = ref(false);
const replyComments = ref([]);
const isShowCreateComment = ref(false);
// Проверяем, есть ли у комментария ответы
const hasReplies = computed(() => props.comment.replies > 0);

const loadReplys = async () => {
    replyComments.value = await commentsStore.getAlbumReplyComments(
        props.comment.album.id,
        props.comment.id
    );
};

const toggleShowReplies = async () => {
    // Загружаем ответы если не загружали до этого
    if (!showReplies.value && replyComments.value.length === 0) {
        await loadReplys();
    }
    showReplies.value = !showReplies.value;
};

// Функция для создания ответа
const createReply = async (text) => {
    await commentsStore.uploadComment(
        props.comment.album.id,
        text,
        props.comment.id
    );
    isShowCreateComment.value = false;
    await loadReplys();
    await props.updateRootComments();
};

// Функция для склонения слова "комментарий"
const getRepliesCountText = (count) => {
    if (count === 1) {
        return "1 ответ";
    } else if (count > 1 && count < 5) {
        return `${count} ответа`;
    } else {
        return `${count} ответов`;
    }
};

const onOpenReportModal = () => {
    modalsStore.openModal("report", {
        type: "comment",
        targetId: props.comment.id,
        targetUserId: props.comment.user.id,
    });
};
</script>

<template>
    <div class="flex w-full flex-col py-2 items-start gap-1">
        <!-- Заголовок комментария -->
        <div class="flex flex-row w-full items-center gap-2">
            <img
                v-if="comment.user?.imageURL"
                :src="comment.user.imageURL"
                class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex flex-col gap-1">
                <div class="flex flex-row items-center gap-2">
                    <span class="font-medium hover:underline hover:text-white">
                        {{ comment.user?.displayName}}
                    </span>
                    <span class="text-sm text-main-white/50">
                        {{ formatDate(comment.createdAt) }}
                    </span>
                </div>
                <p class="text-main-white/80">{{ comment.text }}</p>
            </div>
            <DropDownMenuLayout>
                <template v-slot:trigger>
                    <button
                        class="flex items-center justify-center transition-all"
                    >
                        <BaseIcon
                            iconName="MoreHorizIcon"
                            class="fill-white w-4 h-4"
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
                class="text-sm font-medium text-left text-main-white/50 hover:text-white transition-colors"
            >
                Ответить
            </button>
            <button
                v-if="hasReplies"
                @click="toggleShowReplies"
                class="flex flex-row w-fit text-sm font-medium hover:text-white transition-colors"
            >
                <BaseIcon
                    iconName="ArrowRightIcon"
                    class="fill-current transform transition-transform duration-200"
                    :class="showReplies ? 'rotate-90' : '-rotate-90'"
                />
                <span>{{
                    showReplies
                        ? "Скрыть"
                        : getRepliesCountText(props.comment.replies)
                }}</span>
            </button>
        </div>
    </div>

    <div
        v-if="showReplies"
        class="flex flex-col pl-6 border-l-2 border-main-gray gap-2"
    >
        <ReplyComment
            v-for="reply in replyComments"
            :comment="reply"
            :updateRootComments="props.updateRootComments"
            :updateReplyComments="loadReplys"
        />
    </div>
</template>
