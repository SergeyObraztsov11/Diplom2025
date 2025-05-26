<script setup>
import { formatDate } from "@/utils/formatDate";
import { getDoc } from "firebase/firestore";
import { ref, onMounted } from "vue";

const props = defineProps({
    comment: {
        type: Object,
        required: true,
    },
});

const user = ref(null);
const isLoading = ref(true);

onMounted(async () => {
    isLoading.value = true;
    try {
        const userDoc = await getDoc(props.comment.user);
        if (userDoc.exists()) {
            user.value = {
                id: userDoc.id,
                ...userDoc.data(),
            };
        }
    } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div
        class="flex flex-col gap-2 max-h-32 overflow-y-auto border-2 border-main-gray rounded-lg p-2"
    >
        <div class="flex flex-row items-center gap-2">
            <img
                v-if="user?.imageURL"
                :src="user.imageURL"
                class="w-8 h-8 rounded-full object-cover"
            />
            <span class="font-semibold">{{ user?.displayName }}</span>
            <span class="text-sm text-main-white/50">
                {{ formatDate(comment.createdAt) }}
            </span>
        </div>
        <p class="text-main-white break-words whitespace-normal w-full">
            {{ comment.text }}
        </p>
    </div>
</template>
