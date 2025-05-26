<script setup>
import { formatDate } from "@/utils/formatDate";
import BaseIcon from "@ui/Icons/BaseIcon.vue";

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
});

</script>

<template>
    <div class="flex flex-col max-h-60 overflow-y-auto gap-4 p-4 border-2 border-main-gray rounded-lg">
        <!-- Основная информация -->
        <div class="flex gap-4">
            <!-- Аватар -->
            <div class="relative">
                <img
                    v-if="user?.imageURL"
                    :src="user.imageURL"
                    class="w-32 h-32 rounded-lg object-cover"
                    :alt="user?.displayName"
                />
                <div
                    v-else
                    class="w-32 h-32 rounded-lg bg-main-gray flex items-center justify-center"
                >
                    <BaseIcon
                        iconName="PersonIcon"
                        class="fill-current w-16 h-16"
                    />
                </div>
            </div>

            <!-- Информация о пользователе -->
            <div class="flex-1 flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-sm text-main-white/50"
                        >Имя пользователя</span
                    >
                    <span class="text-lg font-semibold">{{
                        user?.displayName
                    }}</span>
                </div>

                <div class="flex flex-col gap-1">
                    <span class="text-sm text-main-white/50"
                        >Дата регистрации</span
                    >
                    <span>{{ formatDate(user?.createdAt) }}</span>
                </div>
            </div>
        </div>

        <!-- Описание -->
        <div v-if="user?.description" class="flex flex-col gap-1">
            <span class="text-sm text-main-white/50">Описание</span>
            <p class="text-pretty">
                {{ user?.description }}
            </p>
        </div>

        <!-- Социальные сети -->
        <!-- <div v-if="user?.socialLinks?.length" class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <BaseIcon
                    iconName="LinkIcon"
                    class="fill-current w-4 h-4 text-main-white/50"
                />
                <span class="text-sm text-main-white/50">Социальные сети</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <a
                    v-for="(link, index) in user.socialLinks"
                    :key="index"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-1.5 bg-main-white/5 hover:bg-main-white/10 rounded-full transition-colors"
                >
                    <BaseIcon
                        :iconName="getSocialIcon(link.name)"
                        class="fill-current w-4 h-4"
                    />
                    <span class="text-sm">{{ link.name }}</span>
                </a>
            </div>
        </div> -->
    </div>
</template>
