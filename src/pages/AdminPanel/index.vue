<script setup>
import AdminPanelLayout from "@layouts/AdminPanelLayout.vue";
import ReportTableRow from "@components/ReportTableRow.vue";
import { ref, computed, onMounted } from "vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { useAuthStore } from "@stores/auth";
import { useReportsStore } from "@stores/reports";
import Fuse from "fuse.js";

const authStore = useAuthStore();
const reportsStore = useReportsStore();
const reports = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Добавляем состояние поиска
const searchQuery = ref("");

// Создаем экземпляр Fuse с расширенными полями поиска
const fuse = computed(() => {
    return new Fuse(reports.value, {
        keys: [
            "description",
            "reason",
            "type",
            "targetData.displayName", // Поиск по имени целевого объекта
            "targetData.title", // Поиск по названию альбома
            "targetData.text", // Поиск по тексту комментария
            "reporterData.displayName", // Поиск по имени отправителя
            "resolvedByData.displayName", // Поиск по имени модератора
           
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
    });
});

// Получение жалоб
const loadReports = async () => {
    try {
        isLoading.value = true;
        reports.value = await reportsStore.fetchReports();
        console.log(reports.value);
    } catch (err) {
        error.value = "Ошибка при загрузке жалоб";
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadReports();
});

const types = [
    { value: "comment", label: "Комментарии" },
    { value: "album", label: "Альбомы" },
    { value: "user", label: "Пользователи" },
];
// Статусы
const statuses = [
    { value: "pending", label: "Ожидает" },
    { value: "resolved", label: "Решено" },
    { value: "rejected", label: "Отклонено" },
];

// Причины жалоб
const reasons = [
    { value: "spam", label: "Спам" },
    { value: "rules", label: "Нарушение правил" },
    { value: "content", label: "Запрещенный контент" },
    { value: "other", label: "Другое" },
];

// Обновляем фильтры
const filters = ref({
    type: "",
    status: "",
    reason: "", // Добавляем фильтр по причине
});

// Сортировка
const sortBy = ref("createdAt");
const sortOrder = ref("desc");

// Отфильтрованные и отсортированные данные
const filteredReports = computed(() => {
    let result = [...reports.value];

    // Поиск
    if (searchQuery.value) {
        result = fuse.value.search(searchQuery.value).map((item) => item.item);
    }

    // Фильтрация
    if (filters.value.type) {
        result = result.filter((report) => report.type === filters.value.type);
    }
    if (filters.value.status) {
        result = result.filter(
            (report) => report.status === filters.value.status
        );
    }
    if (filters.value.reason) {
        result = result.filter(
            (report) => report.reason === filters.value.reason
        );
    }

    // Сортировка
    result.sort((a, b) => {
        const aValue = a[sortBy.value];
        const bValue = b[sortBy.value];
        if (sortOrder.value === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return result;
});

// Обработчики для фильтров и сортировки
const handleFilterChange = (key, value) => {
    filters.value[key] = value;
};

const handleSort = (key) => {
    if (sortBy.value === key) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
        sortBy.value = key;
        sortOrder.value = "asc";
    }
};

// Добавь объект с заголовками
const headers = {
    type: "Тип",
    reason: "Причина",
    status: "Статус",
    createdAt: "Дата создания",
    resolvedAt: "Дата решения",
    actions: "Действия",
};
</script>

<template>
    <AdminPanelLayout>
        <div class="flex flex-row items-end justify-between px-8 py-4">
            <h1 class="text-nowrap text-2xl font-semibold">
                Панель администратора
            </h1>
            <button class="text-main-white/50 hover:text-main-white transition  underline" @click="authStore.logoutUser">
                Выход
            </button>
        </div>

        <!-- Фильтры -->
        <div class="flex gap-4 px-8 py-4">
            <select
                v-model="filters.type"
                @change="handleFilterChange('type', $event.target.value)"
                class="bg-main-black focus:bg-main-gray h-10 p-2 border-2 border-main-gray focus:border-main-white transition-colors rounded-lg"
            >
                <option value="">Все типы</option>
                <option
                    v-for="type in types"
                    :key="type.value"
                    :value="type.value"
                >
                    {{ type.label }}
                </option>
            </select>

            <select
                v-model="filters.status"
                @change="handleFilterChange('status', $event.target.value)"
                class="bg-main-black focus:bg-main-gray h-10 p-2 border-2 border-main-gray focus:border-main-white transition-colors rounded-lg"
            >
                <option value="">Все статусы</option>
                <option
                    v-for="status in statuses"
                    :key="status.value"
                    :value="status.value"
                >
                    {{ status.label }}
                </option>
            </select>

            <select
                v-model="filters.reason"
                @change="handleFilterChange('reason', $event.target.value)"
                class="bg-main-black focus:bg-main-gray h-10 p-2 border-2 border-main-gray focus:border-main-white transition-colors rounded-lg"
            >
                <option value="">Все причины</option>
                <option
                    v-for="reason in reasons"
                    :key="reason.value"
                    :value="reason.value"
                >
                    {{ reason.label }}
                </option>
            </select>

            <div
                class="flex flex-row h-10 items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
            >
                <BaseIcon iconName="SearchIcon" class="fill-current h-5 w-5" />
                <input
                    v-model="searchQuery"
                    placeholder="Поиск"
                    type="text"
                    spellcheck="true"
                    class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
                />
            </div>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="isLoading" class="px-8 py-4">Загрузка жалоб...</div>

        <!-- Сообщение об ошибке -->
        <div v-else-if="error" class="px-8 py-4 text-red-500">
            {{ error }}
        </div>

        <!-- Таблица -->
        <div v-else class="px-8 py-4 overflow-x-auto">
            <table
                class="min-w-full bg-main-gray border-2 border-main-white/50 rounded-lg shadow-lg overflow-hidden"
            >
                <thead>
                    <tr class="bg-main-black/50">
                        <th
                            v-for="(header, key) in headers"
                            :key="key"
                            @click="handleSort(key)"
                            class="p-4 border-b border-main-white/20 text-main-white font-semibold uppercase tracking-wider cursor-pointer hover:bg-main-black/70 transition-colors"
                        >
                            <div class="flex flex-row justify-center">
                                <span class="truncate">{{ header }}</span
                                ><span v-if="sortBy === key" class="ml-1">
                                    {{ sortOrder === "asc" ? "↑" : "↓" }}
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-main-white/20">
                    <ReportTableRow
                        v-for="report in filteredReports"
                        :key="report.id"
                        :report="report"
                    />
                </tbody>
            </table>
        </div>
    </AdminPanelLayout>
</template>
