<script setup>
import MyImage from "@ui/MyImage.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import BaseTooltip from "@ui/BaseTooltip.vue";

const props = defineProps({
    album: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div
        class="flex flex-col w-[250px] h-[300px] justify-between flex-shrink-0 hover:scale-105 p-2 transition-all"
    >
        <!-- Изображение -->
        <RouterLink
            :to="{ name: 'album', params: { albumId: props.album.id } }"
            class="rounded-xl overflow-hidden"
        >
            <MyImage :url="props.album.imageURL" loadingIcon="note" />
        </RouterLink>

        <!-- Текстовый блок -->
        <div class="flex flex-col justify-between">
            <div
                class="text-main-black dark:text-main-white flex flex-row items-center justify-between"
            >
                <RouterLink
                    :to="{ name: 'album', params: { albumId: props.album.id } }"
                    class="dark:hover:text-white font-semibold truncate"
                >
                    {{ props.album.title }}
                </RouterLink>

                <BaseIcon
                    v-if="props.album.isExplicit"
                    class="fill-current h-4 w-4"
                    iconName="ExplicitIcon"
                />
                <!-- <BaseTooltip
                    v-if="props.isExplicit"
                    text="Материал 18+"
                    position="bottom"
                >
                    <BaseIcon
                        class="fill-current h-4 w-4"
                        iconName="ExplicitIcon"
                    />
                </BaseTooltip> -->
            </div>

            <div class="">
                <RouterLink
                    :to="{
                        name: 'artist',
                        params: { artistId: props.album.author.id },
                    }"
                    class="text-sm text-main-black/60 dark:text-white/50 hover:underline underline-offset-1 truncate"
                    >{{ props.album.author.displayName }}</RouterLink
                >
            </div>
        </div>
    </div>
</template>
