<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";

const openHelpFile = () => {
    window.open("/РуководствоОператора.pdf", "_blank");
};

</script>

<template>
    <footer class="flex text-sm flex-col w-full gap-2">
        <div class="flex flex-row w-full gap-6">
            <button
                @click="openHelpFile"
                class="flex flex-row items-center gap-2 hover:underline"
            >
                <BaseIcon iconName="HelpIcon" class="w-4 h-4 fill-current" />
                <span>Справочная информация</span>
            </button>
        </div>
        <div class="text-left text-main-white/50">
            Веб-приложение &laquo;Цифровая социальная платформа&raquo;
        </div>
    </footer>
</template>
