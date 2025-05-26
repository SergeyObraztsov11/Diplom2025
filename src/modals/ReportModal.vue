<script setup>
import { useAuthStore } from "@stores/auth";
import { useModalsStore } from "@stores/modals";
import { useReportsStore } from "@stores/reports";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed, onMounted, ref } from "vue";
import ModalsLayout from "@modals/ModalsLayout.vue";

const modalsStore = useModalsStore();
const authStore = useAuthStore();
const reportsStore = useReportsStore();

const isLoading = ref(false);
const errors = ref([]);

// Форма
const form = ref({
    reason: "",
    description: "",
});

// Причины жалоб
const reasons = [
    { value: "spam", label: "Спам" },
    { value: "rules", label: "Нарушение правил" },
    { value: "content", label: "Запрещенный контент" },
    { value: "other", label: "Другое" },
];

// Заголовок в зависимости от типа
const modalTitle = computed(() => {
    const type = modalsStore.modalData.type;
    const titles = {
        album: "Жалоба на альбом",
        user: "Жалоба на пользователя",
        comment: "Жалоба на комментарий",
    };
    return titles[type] || "Жалоба";
});

// Валидация формы
const validateForm = () => {
    errors.value = [];
    if (!form.value.reason) {
        errors.value.push("Выберите причину жалобы");
    }
    if (!form.value.description) {
        errors.value.push("Опишите причину жалобы");
    } else if (form.value.description.length < 10) {
        errors.value.push("Описание должно содержать минимум 10 символов");
    }
    return errors.value.length === 0;
};

// Отправка жалобы
const submitReport = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;

        const report = {
            type: modalsStore.modalData.type,
            targetId: modalsStore.modalData.targetId,
            targetUserId: modalsStore.modalData.targetUserId,
            reporterUserId: authStore.currentUserId,
            reason: form.value.reason,
            description: form.value.description,
        };
        await reportsStore.createReport(report);

        modalsStore.closeModal();
    } catch (error) {
        errors.value.push("Ошибка при отправке жалобы");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

// Закрытие формы
const onClickClose = () => {
    if (form.value.reason || form.value.description) {
        const isCloseModalConfirm = confirm(
            "Вы уверены, что хотите покинуть эту страницу? Ваши последние изменения не будут сохранены."
        );
        if (!isCloseModalConfirm) return;
    }
    modalsStore.closeModal();
};
</script>

<template>
    <ModalsLayout :title="modalTitle" @close="onClickClose">
        <div class="flex w-[500px] max-w-full flex-col gap-4 px-6 pb-6">
            <!-- Форма -->
            <form @submit.prevent="submitReport" class="flex flex-col gap-4">
                <!-- Причина жалобы -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Причина жалобы</label>
                    <select
                        v-model="form.reason"
                        class="bg-main-black p-2 border-2 border-main-gray rounded-lg focus:border-main-white transition-colors"
                    >
                        <option value="" disabled>Выберите причину</option>
                        <option
                            v-for="reason in reasons"
                            :key="reason.value"
                            :value="reason.value"
                        >
                            {{ reason.label }}
                        </option>
                    </select>
                </div>

                <!-- Описание -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Описание</label>
                    <textarea
                        v-model="form.description"
                        rows="4"
                        placeholder="Опишите причину жалобы"
                        class="bg-main-black p-2 border-2 border-main-gray rounded-lg focus:border-main-white transition-colors resize-none"
                    ></textarea>
                </div>

                <!-- Ошибки -->
                <ul v-if="errors.length" class="text-red-500 text-sm">
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>

                <!-- Кнопки -->
                <div class="flex justify-end gap-2">
                    <button
                        type="button"
                        @click="onClickClose"
                        class="px-4 py-2 text-main-white/50 hover:text-main-white transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="flex flex-row px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <template v-if="isLoading">
                            <BaseIcon
                                iconName="ProgressActivityIcon"
                                class="fill-current"
                            />
                            <span>Отправка...</span>
                        </template>

                        <span v-else>Отправить жалобу</span>
                    </button>
                </div>
            </form>
        </div>
    </ModalsLayout>
</template>
