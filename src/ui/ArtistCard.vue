<script setup>
import MyImage from "@ui/MyImage.vue";

const props = defineProps({
    artist: {
        type: String,
        required: true,
    },
    artistId: {
        type: String,
        required: true,
    },
    imageURL: {
        type: String,
        default: null,
    },
});
</script>

<template>
    <div
        class="flex flex-col w-[250px] h-[300px] p-2 flex-shrink-0 hover:scale-105 transition-all"
    >
        <!-- Изображение -->
        <RouterLink
            :to="{ name: 'artist', params: { artistId: props.artistId } }"
            class="rounded-full overflow-hidden"
        >
            <MyImage :url="props.imageURL" loadingIcon="user" />
        </RouterLink>

        <!-- Текстовый блок -->

        <div class="flex w-full items-center justify-center py-2">
            <RouterLink
                :to="{ name: 'artist', params: { artistId: props.artistId } }"
                class="text-main-black dark:text-white font-semibold truncate hover:underline underline-offset-1"
            >
                {{ props.artist }}
            </RouterLink>
        </div>
    </div>
</template>
