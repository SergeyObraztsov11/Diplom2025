<script setup>
import BaseButton from "@ui/BaseButton.vue";
import { ref, computed, watch } from "vue";

const emit = defineEmits(["createComment", "cancel"]);

const comment = ref("");

const isDisabled = computed(() => {
    return comment.value.length <= 3 || comment.value.length >= 100;
});

const onClickCancel = () => {
    emit("cancel");
    comment.value = "";
};

const onClickCreateComment = () => {
    if (isDisabled.value) return;
    emit("createComment", comment.value.trim());
    comment.value = "";
};

const rowsCount = computed(() => {
    return comment.value.split("\n").length || 1;
});
</script>
<template>
    <div class="flex w-full flex-col gap-2">
        <textarea
            v-model="comment"
            :rows="rowsCount"
            class="w-full bg-transparent resize-none border-b-2 border-main-white/50 focus:border-main-white focus:outline-none py-2 placeholder:text-main-white/50 transition-colors"
            placeholder="Оставьте комментарий"
        />
        <div class="flex flex-row items-center justify-end gap-2">
            <button
                type="button"
                @click="onClickCancel"
                class="px-4 py-2 text-main-white/50 hover:text-main-white transition-colors"
            >
                Отмена
            </button>
            <button
                @click="onClickCreateComment"
                :disabled="isDisabled"
                class="px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-full transition-colors disabled:opacity-50"
            >
                <span>Отправить</span>
            </button>
        </div>
    </div>
</template>
