<script setup>
import DropDownMenuItem from "@ui/DropDownMenu/DropDownMenuItem.vue";
import DropDownMenuLayout from "@ui/DropDownMenu/DropDownMenuLayout.vue";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { ref } from "vue";

const emit = defineEmits(["selected", "deleted"]);

const props = defineProps({
    initialImageURl: {
        type: String,
        default: null,
        required: false,
    },
    noImageIconName: {
        type: String,
        default: null,
        required: false,
    },
    noImageIconText: {
        type: String,
        default: null,
        required: false,
    },
});

const previewImage = ref(null);
const isDeleted = ref(false);

const selected = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    isDeleted.value = false;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
    emit("selected", file);
};

const deleted = () => {
    isDeleted.value = true;
    emit("deleted");
};

const imageInput = ref();
const onClickSelect = () => imageInput.value.click();
const onClickDelete = () => deleted();
</script>
<template>
    <DropDownMenuLayout>
        <template v-slot:trigger>
            <div class="overflow-hidden" v-bind="$attrs">
                <img
                    v-if="!isDeleted && (initialImageURl || previewImage)"
                    class="h-full w-full object-cover"
                    :src="previewImage ? previewImage : initialImageURl"
                />
                <div
                    v-else
                    class="h-full w-full flex flex-col bg-main-white dark:bg-main-gray items-center justify-center"
                >
                    <BaseIcon
                        size="50%"
                        :iconName="
                            props.noImageIconName
                                ? props.noImageIconName
                                : 'UploadImageIcon'
                        "
                        class="fill-white dark:fill-main-white"
                    />
                    <span v-if="props.noImageIconText" class="text-white">{{
                        props.noImageIconText
                    }}</span>
                </div>

                <input
                    ref="imageInput"
                    type="file"
                    class="hidden"
                    accept=".png, .jpeg, .jpg"
                    @change="selected"
                />
            </div>
        </template>
        <template v-slot:content>
            <DropDownMenuItem
                @click="onClickSelect"
                iconName="UploadImageIcon"
                text="Загрузить"
            />
            <DropDownMenuItem
                v-if="props.initialImageURl || (previewImage && !isDeleted)"
                @click="onClickDelete"
                iconName="DeleteIcon"
                :isRed="true"
                text="Удалить изображение"
            />
        </template>
    </DropDownMenuLayout>
</template>
