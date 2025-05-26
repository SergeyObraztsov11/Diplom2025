<script setup>
import BaseIcon from "@ui/Icons/BaseIcon.vue";

import { ref, watch } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
    placeholder: {
        type: String,
        required: true,
    },
    modelValue: {
        type: String,
        default: "",
    },
});

const searchRequest = ref(props.modelValue);

watch(
    () => props.modelValue,
    (val) => {
        if (val !== searchRequest.value) {
            searchRequest.value = val;
        }
    }
);

watch(searchRequest, (value) => {
    emit("update:modelValue", value);
});

const clearSearchRequest = () => {
    searchRequest.value = "";
};
</script>
<template>
    <div
        class="flex flex-row h-12 w-full items-center gap-2 p-2 border-2 border-main-gray text-main-gray rounded-full transition-colors focus-within:border-main-white focus-within:bg-main-gray focus-within:text-main-white"
    >
        <div>
            <BaseIcon iconName="SearchIcon" class="fill-current h-6 w-6" />
        </div>

        <input
            v-model.trim="searchRequest"
            type="text"
            spellcheck="false"
            class="w-full h-full outline-none bg-transparent text-main-white placeholder:text-main-white/50"
            :placeholder="props.placeholder"
        />
        <button @click="clearSearchRequest">
            <BaseIcon iconName="CloseIcon" class="fill-current h-6 w-6" />
        </button>
    </div>
</template>
