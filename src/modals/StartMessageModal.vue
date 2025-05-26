<script setup>
import ModalsLayout from "@modals/ModalsLayout.vue";
import { useArtistsStore } from "@stores/artists";
import { useChatsStore } from "@stores/chats";
import { useModalsStore } from "@stores/modals";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const artistsStore = useArtistsStore();
const chatsStore = useChatsStore();
const modalsStore = useModalsStore();

const isInitLoading = ref(false);
const isSubmitLoading = ref(false); 
const errors = ref([]);
const targetUser = ref(null);
const message = ref("");

onMounted(async () => {
    try {
        isInitLoading.value = true;
        targetUser.value = await artistsStore.getArtistById(
            modalsStore.modalData.targetUserId
        );
    } catch (error) {
        console.log(error);
    } finally {
        isInitLoading.value = false;
    }
});

const validateForm = () => {
    errors.value = [];
    if (message.value.length === 0) {
        errors.value.push("Введите сообщение");
        return false;
    }
    if (message.value.length < 5) {
        errors.value.push("Слишком короткое сообщение");
        return false;
    }
    if (message.value.length > 200) {
        errors.value.push("Слишком длинное сообщение");
        return false;
    }
    return true;
};

const submitForm = async () => {
    try {
        isSubmitLoading.value = true;

        if (!validateForm()) return;
        // Создание чата
        const newChatId = await chatsStore.createChatWithUser(
            targetUser.value.id
        );
        // Отправка первого сообщения
        await chatsStore.sendMessage(newChatId, message.value);
        // Перенапрявление
        router.push({
            name: "chat-details",
            params: { chatId: newChatId },
        });
        // Закрытие формы после отправки
        modalsStore.closeModal();
    } catch (error) {
        console.log(error);
    } finally {
        isSubmitLoading.value = false;
    }
};
// Закрытие формы
const onClickClose = () => {
    modalsStore.closeModal();
};
</script>

<template>
    <ModalsLayout title="Новое сообщение" @close="onClickClose">
        <div class="flex w-[500px] max-w-full flex-col gap-4 px-6 pb-6">
            <!-- Форма -->
            <form @submit.prevent="submitForm" class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-4">
                    <MyImage
                        :url="targetUser?.imageURL"
                        loadingIcon="user"
                        class="h-16 w-16 rounded-full overflow-hidden"
                    />
                    <div
                        v-if="isInitLoading"
                        class="bg-main-gray animate-pulse h-6 w-1/2 rounded"
                    ></div>
                    <span v-else class="text-base font-semibold truncate">
                        {{ targetUser?.displayName }}
                    </span>
                </div>

                <textarea
                    v-model.trim="message"
                    class="h-32 w-full text-base p-2 border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white resize-none"
                ></textarea>

                <ul
                    v-if="errors.length > 0"
                    class="text-main-error-red list-disc list-inside"
                >
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
                <div class="flex justify-end gap-2">
                    <button
                        type="button"
                        @click="onClickClose"
                        class="px-4 py-2 text-main-white/50 hover:text-main-white transition-colors rounded-lg"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        :disabled="isInitLoading || isSubmitLoading"
                        class="flex flex-row items-center justify-center gap-2 px-4 py-2 bg-main-gray hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                    >
                        <template v-if="isSubmitLoading">
                            <BaseIcon
                                iconName="ProgressActivityIcon"
                                class="fill-current w-5 h-5"
                            />
                            <span>Отправка...</span>
                        </template>
                        <template v-else><span>Отправить</span></template>
                    </button>
                </div>
            </form>
        </div>
    </ModalsLayout>
</template>
