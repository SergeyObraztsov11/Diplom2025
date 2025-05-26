<script setup>

const props = defineProps({
    options: {
        type: Array,
        validator: (value) => {
            return value.every((option) => {
                return typeof option.value === "string" && typeof option.label === "string";
            });
        },
        required: true,
    },
});

const emit = defineEmits(["changeSortOrder"]);

const changeSortOrder = (event) => {
    emit("changeSortOrder", event.target.value);
};
</script>

<template>
    <select
        @change="changeSortOrder"
        class="bg-transparent text-main-black dark:text-main-white focus:outline-none"
    >
        <option
            v-for="option in options"
            :value="option.value"
            :key="option.value"
            class="dark:bg-main-black appearance-none"
        >
            {{ option.label }}
        </option>
    </select>
</template>
