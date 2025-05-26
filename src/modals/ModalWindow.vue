<script setup>
import { useModalsStore } from "@stores/modals";
const modalsStore = useModalsStore();
</script>
<template>
    <Teleport to="#modal">
        <component v-if="modalsStore.isOpen" :is="modalsStore.modalComponent"
    /></Teleport>
</template>
