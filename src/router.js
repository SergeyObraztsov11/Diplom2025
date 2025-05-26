import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { watch } from "vue";

const routes = [
    {
        path: "/login",
        name: "login",
        component: () => import("@pages/AuthPage.vue"),
    },
    {
        path: "/registration",
        name: "registration",
        component: () => import("@pages/RegPage.vue"),
    },
    {
        path: "/",
        name: "home",
        component: () => import("@pages/HomePage.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/chats",
        name: "chats",
        component: () => import("@pages/ChatsPage/index.vue"),
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "chats-empty",
                component: () => import("@pages/ChatsPage/ChatEmpty.vue"),
            },
            {
                path: ":chatId",
                name: "chat-details",
                component: () => import("@pages/ChatsPage/ChatMessages.vue"),
                props: true,
            },
        ],
    },
    {
        path: "/album/:albumId",
        name: "album",
        component: () => import("@pages/AlbumPage.vue"),
        meta: { requiresAuth: true },
        props: true,
    },
    {
        path: "/artist/:artistId",
        name: "artist",
        component: () => import("@pages/ArtistPage.vue"),
        meta: { requiresAuth: true },
        props: true,
    },
    {
        path: "/artist/:artistId/tracks",
        name: "artist-tracks",
        component: () => import("@pages/ArtistTracksPage.vue"),
        meta: { requiresAuth: true },
        props: true,
    },
    {
        path: "/artist/:artistId/albums",
        name: "artist-albums",
        component: () => import("@pages/ArtistAlbumsPage.vue"),
        meta: { requiresAuth: true },
        props: true,
    },
    {
        path: "/liked/tracks",
        name: "liked_tracks",
        component: () => import("@pages/LikedTracksPage.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/liked/albums",
        name: "liked_albums",
        component: () => import("@pages/LikedAlbumsPage.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/search",
        name: "search",
        component: () => import("@pages/SearchPage.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/admin-panel",
        name: "admin-panel",
        component: () => import("@pages/AdminPanel/index.vue"),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
        },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: () => import("@pages/PageNotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory("/Diplom2025/"),
    routes,
});

router.beforeEach(async (to, from, next) => {
    document.body.classList.add("loading");

    const authStore = useAuthStore();

    // Дожидаемся инициализации авторизации
    if (authStore.isAuthStateChangesLoading) {
        await authStore.initAuth();
    }

    // Если пользователь авторизован, ждем загрузки данных пользователя
    if (authStore.isAuthenticated && !authStore.isUserDataLoaded) {
        // Ждем, пока isUserDataLoaded станет true
        await new Promise((resolve) => {
            const stop = watch(
                () => authStore.isUserDataLoaded,
                (val) => {
                    if (val) {
                        stop();
                        resolve();
                    }
                }
            );
        });
    }

    const isAuth = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    // 1. Если пользователь не авторизован (гость)
    if (!isAuth) {
        // Разрешаем только login и registration
        if (to.name === "login" || to.name === "registration") {
            next();
            return;
        }
        // Всё остальное запрещено
        next("/registration");
        return;
    }

    // 2. Если пользователь авторизован и админ
    if (isAdmin) {
        // Разрешаем только админ-панель
        if (to.meta.requiresAdmin) {
            next();
            return;
        }
        // Всё остальное запрещено
        next("/admin-panel");
        return;
    }

    // 3. Если пользователь авторизован и не админ
    // Запрещаем доступ к login, registration и admin-panel
    if (
        to.name === "login" ||
        to.name === "registration" ||
        to.meta.requiresAdmin
    ) {
        next("/");
        return;
    }

    // Всё остальное разрешено
    next();
});

router.afterEach(() => {
    document.body.classList.remove("loading");
});

export default router;
