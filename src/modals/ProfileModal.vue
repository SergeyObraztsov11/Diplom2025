<script setup>
import { useAuthStore } from "@stores/auth";
import { useMessageStore } from "@stores/message";
import { useModalsStore } from "@stores/modals";
import BaseIcon from "@ui/Icons/BaseIcon.vue";
import { computed, onMounted, ref } from "vue";
import ImageInput from "@components/ImageInput.vue";
import ModalsLayout from "@modals/ModalsLayout.vue";

const modalsStore = useModalsStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const isLoading = ref(false);
const errors = ref([]);

const initialDisplayName = ref(null);
const newDisplayName = ref(null);
const newDescription = ref(null);

const socialLinks = ref([]);
const newSocialLink = ref({ name: "", url: "" });

const initialAvatarURL = ref(null);
const selectedAvatarFile = ref(null);
const deleteAvatar = ref(false);

onMounted(() => {
    const {
        imageURL,
        displayName,
        description,
        socialLinks: initialLinks,
    } = authStore.currentUserData;
    initialAvatarURL.value = imageURL;
    initialDisplayName.value = displayName;
    newDisplayName.value = displayName;
    newDescription.value = description || "";
    socialLinks.value = initialLinks || [];
});

const onAvatarSelect = (file) => {
    selectedAvatarFile.value = file;
    deleteAvatar.value = false;
};

const onAvatarDelete = () => {
    selectedAvatarFile.value = null;
    deleteAvatar.value = true;
};

const addSocialLink = () => {
    if (socialLinks.value.length >= 5) {
        errors.value.push("Максимальное количество социальных сетей - 5");
        return;
    }

    if (!newSocialLink.value.name || !newSocialLink.value.url) {
        errors.value.push("Заполните название и ссылку");
        return;
    }
    if (!newSocialLink.value.url.match(/^https?:\/\//i)) {
        errors.value.push("Введите корректную ссылку");
        return;
    }
    if (
        socialLinks.value.some((link) => link.name === newSocialLink.value.name)
    ) {
        errors.value.push("Такая социальная сеть уже добавлена");
        return;
    }

    socialLinks.value.push({ ...newSocialLink.value });
    newSocialLink.value = { name: "", url: "" };
};

const removeSocialLink = (index) => {
    socialLinks.value.splice(index, 1);
};

const isSocialLinksChanged = computed(() => {
    const initialLinks = authStore.currentUserData.socialLinks || [];
    if (initialLinks.length !== socialLinks.value.length) return true;

    return socialLinks.value.some((link, index) => {
        const initialLink = initialLinks[index];
        return link.name !== initialLink.name || link.url !== initialLink.url;
    });
});

const validateForm = () => {
    const validationErrors = [];

    if (!newDisplayName.value || newDisplayName.value.trim() === "") {
        validationErrors.push("Введите имя пользователя");
    } else if (newDisplayName.value.trim().length < 5) {
        validationErrors.push(
            "Имя пользователя должно содержать минимум 5 символов"
        );
    } else if (newDisplayName.value.trim().length > 20) {
        validationErrors.push(
            "Имя пользователя не должно превышать 20 символов"
        );
    }

    errors.value = validationErrors;
    return errors.value.length === 0;
};

const isDisplayNameNew = computed(() => {
    const trimmedName = newDisplayName.value?.trim();
    return trimmedName !== initialDisplayName.value;
});

const isDescriptionNew = computed(() => {
    return newDescription.value !== authStore.currentUserData.description;
});

const isFormDirty = computed(() => {
    return (
        isDisplayNameNew.value ||
        isDescriptionNew.value ||
        selectedAvatarFile.value !== null ||
        deleteAvatar.value === true ||
        isSocialLinksChanged.value
    );
});

const onClickSuccess = async () => {
    errors.value = [];

    if (!validateForm()) {
        console.log("Form validation failed.");
        return;
    }

    isLoading.value = true;
    try {
        if (selectedAvatarFile.value) {
            const imageURL = await authStore.uploadUserAvatar(
                selectedAvatarFile.value
            );
            await authStore.updateUserData({ imageURL: imageURL });
        } else if (deleteAvatar.value) {
            await authStore.updateUserData({ imageURL: null });
        }

        const updateData = {};

        if (isDisplayNameNew.value) {
            updateData.displayName = newDisplayName.value.trim();
        }

        if (isDescriptionNew.value) {
            updateData.description = newDescription.value.trim();
        }

        if (isSocialLinksChanged.value) {
            updateData.socialLinks = socialLinks.value;
        }

        if (Object.keys(updateData).length > 0) {
            await authStore.updateUserData(updateData);
        }

        messageStore.showMessage("Данные успешно изменены");
        modalsStore.closeModal();
    } catch (error) {
        messageStore.showMessage("Ошибка при изменении данных");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

const onClickClose = () => {
    if (isFormDirty.value) {
        const isCloseModalConfirm = confirm(
            "Вы уверены, что хотите покинуть эту страницу? Ваши последние изменения не будут сохранены."
        );
        if (!isCloseModalConfirm) return;
    }
    modalsStore.closeModal();
};
</script>
<template>
    <ModalsLayout title="Профиль" @close="onClickClose">
        <div class="flex flex-col gap-2 w-[400px] max-w-full pb-6 px-6">
            <div class="flex flex-col items-center gap-4">
                <ImageInput
                    class="h-28 w-28 rounded-full"
                    :initialImageURl="initialAvatarURL"
                    noImageIconName="PersonIcon"
                    @selected="onAvatarSelect"
                    @deleted="onAvatarDelete"
                />
                <div class="text-xs text-main-light-gray">
                    {{ authStore.currentUserId }}
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Имя пользователя</label>
                    <input
                        type="text"
                        v-model.trim="newDisplayName"
                        placeholder="Имя пользователя"
                        class="flex text-base w-full p-2 border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Описание</label>
                    <textarea
                        v-model.trim="newDescription"
                        placeholder="О себе"
                        class="w-full text-base p-2 border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white resize-none"
                        rows="3"
                    ></textarea>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium"
                            >Социальные сети</label
                        >
                        <span class="text-xs text-main-white/50"
                            >{{ socialLinks.length }}/5</span
                        >
                    </div>

                    <div
                        v-if="socialLinks.length > 0"
                        class="flex flex-wrap gap-2"
                    >
                        <div
                            v-for="(link, index) in socialLinks"
                            :key="index"
                            class="flex items-center gap-2 px-2 py-1 bg-main-gray rounded-full transition-colors"
                        >
                            <span class="text-sm font-medium">{{
                                link.name
                            }}</span>
                            <button
                                @click="removeSocialLink(index)"
                                class="text-base font-medium text-red-500 hover:text-red-500/50 transition-all"
                                title="Удалить"
                            >
                                &times;
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="socialLinks.length < 5"
                        class="flex flex-col gap-2"
                    >
                        <input
                            v-model.trim="newSocialLink.name"
                            type="text"
                            placeholder="Название сети"
                            class="w-full p-2 text-sm border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white"
                        />
                        <input
                            v-model.trim="newSocialLink.url"
                            type="url"
                            placeholder="Ссылка"
                            class="w-full p-2 text-sm border-2 border-main-gray rounded-lg bg-transparent appearance-none focus:border-main-white"
                        />
                        <button
                            @click="addSocialLink"
                            class="flex items-center justify-center gap-1 px-3 py-2 bg-main-white/10 hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                            :disabled="
                                !newSocialLink.name || !newSocialLink.url
                            "
                        >
                            <BaseIcon
                                iconName="AddIcon"
                                class="fill-current w-4 h-4"
                            />
                            <span class="text-sm">Добавить</span>
                        </button>
                    </div>
                </div>

                <ul
                    v-if="errors.length"
                    class="p-2 text-main-error-red list-disc list-inside"
                >
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
            </div>

            <div class="flex justify-end gap-2">
                <button
                    type="button"
                    @click="onClickClose"
                    class="px-4 py-2 text-main-white/50 hover:text-main-white transition-colors rounded-lg"
                >
                    Отмена
                </button>
                <button
                    type="button"
                    @click="onClickSuccess"
                    :disabled="isLoading"
                    class="flex flex-row items-center justify-center gap-2 px-4 py-2 bg-main-gray hover:bg-main-white/20 text-main-white rounded-lg transition-colors"
                    :class="{ 'opacity-50': !isFormDirty }"
                >
                    <template v-if="isLoading">
                        <BaseIcon
                            iconName="ProgressActivityIcon"
                            class="fill-current w-5 h-5"
                        />
                        <span>Сохранение...</span>
                    </template>
                    <span v-else>Сохранить</span>
                </button>
            </div>
        </div>
    </ModalsLayout>
</template>
