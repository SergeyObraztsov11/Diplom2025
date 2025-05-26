<script setup>
import { ref, watchEffect, markRaw } from 'vue';

const props = defineProps({
    iconName: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        default: "20px",
        required: false,
    }
});

const iconComponent = ref(null);

watchEffect(async () => {   
    try {
        const imported = await import(`./${props.iconName}.vue`);
        iconComponent.value = markRaw(imported.default);
    } catch (error) {
        console.error(`Ошибка загрузки иконки: ${props.iconName}`);
    }
});
</script>

<template>
    <component
        v-if="iconComponent"
        :width="props.size"
        :height="props.size"
        class="flex-shrink-0"
        :is="iconComponent"
        v-bind="$attrs"
    ></component>
</template>
