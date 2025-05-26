<script setup>
import { useAuthStore } from "@stores/auth";
import { useModalsStore } from "@stores/modals";
import { useReportsStore } from "@stores/reports";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed, ref } from "vue";
import ModalsLayout from "@modals/ModalsLayout.vue";
import CommentTarget from "@components/ReportTargets/CommentTarget.vue";
import UserTarget from "@components/ReportTargets/UserTarget.vue";
import AlbumTarget from "@components/ReportTargets/AlbumTarget.vue";
const modalsStore = useModalsStore();
const authStore = useAuthStore();
const reportsStore = useReportsStore();

const isLoading = ref(false);
const errors = ref([]);

// Cостояние для шага
const currentStep = ref("view"); // 'view' | 'action'

const report = computed(() => {
    return modalsStore.modalData?.report ? modalsStore.modalData.report : null;
});

// Форма
const form = ref({
    status: "",
    action: "",
    notes: "",
});

// Действия
const actions = [
    { value: "delete", label: "Удалить" },
    { value: "ban", label: "Заблокировать" },
    { value: "skip", label: "Пропустить" },
];

// Статусы
const statuses = [
    { value: "resolved", label: "Решено" },
    { value: "rejected", label: "Отклонено" },
];

// Добавляем маппинги для форматирования
const typeMap = {
    comment: "Комментарий",
    album: "Альбом",
    user: "Пользователь",
};

const reasonMap = {
    spam: "Спам",
    rules: "Нарушение правил",
    content: "Запрещенный контент",
    other: "Другое",
};

const formatValue = (value, map) => {
    return map[value] || value;
};

// Валидация формы
const validateForm = () => {
    errors.value = [];
    if (!form.value.status) {
        errors.value.push("Выберите статус");
    }
    if (form.value.status === "resolved" && !form.value.action) {
        errors.value.push("Выберите действие");
    }
    if (!form.value.notes) {
        errors.value.push("Добавьте примечание");
    }
    return errors.value.length === 0;
};

// Обработка жалобы
const submitAction = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;
        await reportsStore.updateReportStatus(report.value.id, {
            status: form.value.status,
            action: form.value.action,
            notes: form.value.notes,
            adminId: authStore.currentUserId,
        });

        modalsStore.closeModal();
    } catch (error) {
        errors.value.push("Ошибка при обработке жалобы");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

// Закрытие формы
const onClickClose = () => {
    // if (form.value.status || form.value.action || form.value.notes) {
    //     const isCloseModalConfirm = confirm(
    //         "Вы уверены, что хотите покинуть эту страницу? Ваши последние изменения не будут сохранены."
    //     );
    //     if (!isCloseModalConfirm) return;
    // }
    modalsStore.closeModal();
};

// Функция перехода к следующему шагу
const nextStep = () => {
    currentStep.value = "action";
};

// Функция возврата к просмотру
const prevStep = () => {
    currentStep.value = "view";
};

const targetComponents = {
    comment: CommentTarget,
    user: UserTarget,
    album: AlbumTarget,
};

const modalTitle = computed(() => {
    return currentStep.value === "view"
        ? "Информация жалобы"
        : "Вынесение вердикта";
});
</script>

<template>
    <ModalsLayout :title="modalTitle" @close="onClickClose">
        <div
            class="flex w-[700px] max-w-full max-h-screen flex-col gap-4 px-6 pb-6 overflow-y-auto"
        >
            <!-- Шаг 1: Просмотр жалобы -->
            <div v-if="currentStep === 'view'" class="flex flex-col gap-4">
                <!-- Информация о жалобе -->
                <!-- <h1 class="text-2xl font-medium">Информация жалобы</h1> -->

                <!-- Тип и причина -->
                <div class="flex flex-row gap-4">
                    <div class="flex flex-col gap-1 w-1/2">
                        <span class="text-sm text-main-white/50">Тип</span>
                        <span>{{ formatValue(report.type, typeMap) }}</span>
                    </div>
                    <div class="flex flex-col gap-1 w-1/2">
                        <span class="text-sm text-main-white/50">Причина</span>
                        <span>{{ formatValue(report.reason, reasonMap) }}</span>
                    </div>
                </div>

                <!-- Описание жалобы -->
                <div class="flex flex-col gap-1">
                    <span class="text-sm text-main-white/50"
                        >Описание от пользователя</span
                    >
                    <p
                        class="text-main-white break-words whitespace-normal w-full max-h-32 overflow-y-auto"
                    >
                        {{ report.description }}
                    </p>
                </div>

                <!-- Целевой объект -->
                <div class="flex flex-col gap-1">
                    <span class="text-sm text-main-white/50">
                        Объект жалобы
                    </span>
                    <component
                        :is="targetComponents[report.type]"
                        :comment="
                            report.type === 'comment' ? report.target : null
                        "
                        :user="report.type === 'user' ? report.target : null"
                        :album="report.type === 'album' ? report.target : null"
                    />
                </div>

                <!-- Кнопка перехода к действию -->
                <div class="flex justify-end">
                    <button
                        @click="nextStep"
                        class="flex flex-row items-center gap-2 px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                    >
                        <span>Вынести вердикт</span>
                        <BaseIcon
                            iconName="ArrowRightIcon"
                            class="fill-current"
                        />
                    </button>
                </div>
            </div>

            <!-- Шаг 2: Вынесение вердикта -->
            <div v-else class="flex flex-col gap-4">
                <!-- Форма -->
                <form
                    @submit.prevent="submitAction"
                    class="flex flex-col gap-4"
                >
                    <!-- Статус -->
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Статус</label>
                        <select
                            v-model="form.status"
                            class="bg-main-black p-2 border-2 border-main-gray rounded-lg focus:border-main-white transition-colors"
                        >
                            <option value="" disabled>Выберите статус</option>
                            <option
                                v-for="status in statuses"
                                :key="status.value"
                                :value="status.value"
                            >
                                {{ status.label }}
                            </option>
                        </select>
                    </div>
                    <!-- Действие -->
                    <div
                        v-if="form.status !== 'rejected'"
                        class="flex flex-col gap-2"
                    >
                        <label class="text-sm font-medium">Действие</label>
                        <select
                            v-model="form.action"
                            class="bg-main-black p-2 border-2 border-main-gray rounded-lg focus:border-main-white transition-colors"
                        >
                            <option value="" disabled>Выберите действие</option>
                            <option
                                v-for="action in actions"
                                :key="action.value"
                                :value="action.value"
                            >
                                {{ action.label }}
                            </option>
                        </select>
                    </div>
                    <!-- Примечание -->
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Примечание</label>
                        <textarea
                            v-model="form.notes"
                            rows="4"
                            placeholder="Добавьте примечание"
                            class="bg-main-black p-2 border-2 border-main-gray rounded-lg focus:border-main-white transition-colors resize-none"
                        ></textarea>
                    </div>

                    <!-- Ошибки -->
                    <ul v-if="errors.length" class="text-red-500 text-sm">
                        <li v-for="error in errors" :key="error">
                            {{ error }}
                        </li>
                    </ul>

                    <!-- Кнопки -->
                    <div class="flex justify-start gap-2">
                        <button
                            @click="prevStep"
                            class="px-4 py-2 mr-auto text-main-white/50 hover:text-main-white transition-colors"
                        >
                            Назад
                        </button>
                        <button
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
                                <span>Обработка...</span>
                            </template>
                            <span v-else>Применить</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </ModalsLayout>
</template>
