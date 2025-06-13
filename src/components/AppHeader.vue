<script setup>
import { useAuthStore } from "@stores/auth";
import { useModalsStore } from "@stores/modals";
import { useThemeStore } from "@stores/theme";
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import MyImage from "@ui/MyImage.vue";
import { ref, onMounted, onUnmounted, watch } from "vue";
import BaseTooltip from "@ui/BaseTooltip.vue";
const authStore = useAuthStore();
const themeStore = useThemeStore();
const modalsStore = useModalsStore();

const menuItems = ref([
    {
        icon: "HomeIcon",
        text: "Главная",
        to: { name: "home" },
    },
    {
        icon: "SearchIcon",
        text: "Поиск",
        to: { name: "search" },
    },
    {
        icon: "FavoriteFillIcon",
        text: "Мне нравится",
        to: { name: "liked_tracks" },
    },
    {
        icon: "MessageIcon",
        text: "Сообщения",
        to: { name: "chats-empty" },
    },
]);

const width = ref(80); // Начальная ширина
const isExpanded = ref(false);
const minWidth = 80; // Минимальная ширина
const maxWidth = 300; // Максимальная ширина (уменьшено)
const collapseThreshold = 140; // Порог схлопывания

const onClickOpenProfile = () => {
    modalsStore.openModal("profile");
};

const onClickSwitchTheme = () => {
    themeStore.toggleTheme();
};

const onClickCreateAlbum = () => {
    modalsStore.openModal("createAlbum");
};

const onClickLogout = async () => {
    await authStore.logoutUser();
};

const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width.value;

    function onMouseMove(e) {
        const newWidth = startWidth + (e.clientX - startX);
        width.value = Math.min(Math.max(newWidth, minWidth), maxWidth);
        isExpanded.value = width.value > collapseThreshold;
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Схлопываем если ширина меньше порога
        if (width.value < collapseThreshold) {
            width.value = minWidth;
            isExpanded.value = false;
        } else {
            // Если больше порога, разворачиваем до минимальной расширенной ширины
            width.value = Math.max(width.value, 240);
            isExpanded.value = true;
        }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
};

// Следим за размером экрана
const handleResize = () => {
    if (window.innerWidth < 768) {
        // 768px - breakpoint для md в Tailwind
        width.value = minWidth;
        isExpanded.value = false;
    }
};

// Добавляем слушатель при монтировании
onMounted(() => {
    handleResize(); // Проверяем сразу при загрузке
    window.addEventListener("resize", handleResize);
});

// Удаляем слушатель при размонтировании
onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});
</script>

<template>
    <header
        class="h-screen flex flex-col px-2 items-center dark:bg-main-black select-none relative divide-y-2 divide-main-gray"
        :style="{ width: `${width}px` }"
    >
        <!-- Ресайз хендлер -->
        <div
            class="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-main-gray hover:bg-main-white/20 transition-all"
            @mousedown="startResize"
        ></div>
        
        <!-- Навигация -->
        <nav class="flex flex-col w-full items-center">
            <RouterLink
                v-for="item in menuItems"
                :key="item.to.name"
                :to="item.to"
                :title="item.text"
                class="flex flex-row h-16 w-full text-base items-center gap-4 hover:text-white font-medium p-2 transition-all rounded-xl"
                :class="[
                    { 'justify-center': !isExpanded },
                    $route.name === item.to.name
                        ? 'text-white bg-main-gray/20'
                        : 'text-main-white/50',
                ]"
            >
                <BaseIcon :iconName="item.icon" class="fill-current h-6 w-6" />
                <span v-show="isExpanded" class="truncate font-medium">{{
                    item.text
                }}</span>
            </RouterLink>
        </nav>

        <div class="flex flex-row w-full items-center justify-center mt-auto">
            <!-- Профиль -->
            <DropDownMenuLayout placement="top-right" class="w-full">
                <template v-slot:trigger>
                    <button
                        class="flex flex-row h-16 w-full text-base items-center justify-center gap-4 text-main-white/80 hover:text-white font-medium p-2 transition-all rounded-xl"
                        :class="{ 'justify-center': !isExpanded }"
                    >
                        <div
                            class="h-10 w-10 overflow-hidden rounded-full flex-shrink-0"
                        >
                            <MyImage
                                loadingIcon="user"
                                :url="authStore.currentUserData?.imageURL"
                            />
                        </div>

                        <span
                            v-show="isExpanded"
                            class="truncate transition-all"
                            >{{ authStore.currentUserData?.displayName }}</span
                        >
                    </button>
                </template>
                <template v-slot:content>
                    <DropDownMenuItem
                        @click="onClickOpenProfile"
                        iconName="PersonIcon"
                        text="Профиль"
                    />

                    <DropDownMenuItem
                        @click="onClickCreateAlbum"
                        iconName="AddIcon"
                        text="Создать альбом"
                    />
                    <!-- <DropDownMenuItem
                        @click="onClickSwitchTheme"
                        :iconName="
                            themeStore.currentTheme === 'dark'
                                ? 'LightModeIcon'
                                : 'DarkModeIcon'
                        "
                        :text="
                            themeStore.currentTheme === 'dark'
                                ? 'Светлая'
                                : 'Темная'
                        "
                    /> -->
                    <DropDownMenuItem
                        @click="onClickLogout"
                        :isRed="true"
                        iconName="LogoutIcon"
                        text="Выход"
                    />
                </template>
            </DropDownMenuLayout>
        </div>
    </header>
</template>
