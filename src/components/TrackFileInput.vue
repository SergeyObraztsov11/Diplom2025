<script setup>
const emit = defineEmits(["file-selected"]);

const props = defineProps({
    index: {
        type: Number,
        required: false,
    },
});

const handleFileChange = (event) => {
    const file = event.target.files[0];
    // if (file) {
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         emit("file-selected", file);
    //     };
    //     reader.readAsDataURL(file);
    // }
    if (file) {
        emit("file-selected", { file: file, index: props.index });
    }
};
</script>
<template>
    <input
        ref="fileInput"
        type="file"
        accept=".mp3"
        @change="handleFileChange"
    />
</template>
