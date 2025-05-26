<script setup>
import { ref, computed } from "vue";
import { useModalsStore } from "@stores/modals";

const props = defineProps({
    report: {
        type: Object,
        required: true,
    },
});

const modalsStore = useModalsStore();

// Маппинг значений
const typeMap = {
    comment: "Комментарий",
    album: "Альбом",
    user: "Пользователь",
};

// Маппинг статусов с цветами
const statusMap = {
    pending: "Ожидает",
    resolved: "Решено",
    rejected: "Отклонено",
};

const reasonMap = {
    spam: "Спам",
    rules: "Нарушение правил",
    content: "Запрещенный контент",
};

// Функция форматирования
const formatValue = (value, map) => {
    return map[value] || value;
};

// Функция форматирования даты
const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    // Если это Timestamp из Firestore
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
    }
    // Если это обычная дата
    return timestamp.toLocaleDateString();
};

const onOpenActionModal = () => {
    modalsStore.openModal("reportAction", {
        report: props.report,
    });
};
</script>

<template>
    <tr class="hover:bg-main-black/50 transition-colors">
        <td class="p-4 text-main-white/80 text-center">
            {{ formatValue(report.type, typeMap) }}
        </td>
        <td class="p-4 text-main-white/80 text-center">
            {{ formatValue(report.reason, reasonMap) }}
        </td>
        <td class="p-4">
            <div
                class="flex w-fit px-1 rounded-full mx-auto"
                :class="{
                    'bg-yellow-500/20 text-yellow-500':
                        report.status === 'pending',
                    'bg-green-500/20 text-green-500':
                        report.status === 'resolved',
                    'bg-red-500/20 text-red-500': report.status === 'rejected',
                }"
            >
                {{ formatValue(report.status, statusMap) }}
            </div>
        </td>
        <td class="p-4 text-main-white/80 text-center">
            {{ formatDate(report.createdAt) }}
        </td>
        <td class="p-4 text-main-white/80 text-center">
            {{ formatDate(report.resolvedAt) }}
        </td>
        <td class="p-4">
            <button
                @click="onOpenActionModal"
                class="mx-auto flex px-4 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
            >
                Обработать
            </button>
        </td>
    </tr>
</template>
