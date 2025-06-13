<script setup>
import AppFooter from "@components/AppFooter.vue";
</script>
<template>
    <div class="min-h-screen flex flex-col bg-main-gray p-8 gap-12">
        <slot></slot>
        <AppFooter />
    </div>
</template>
