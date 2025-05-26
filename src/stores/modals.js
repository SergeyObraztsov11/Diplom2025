import CreateAlbumModal from "@modals/CreateAlbum/CreateAlbumModal.vue";
import ProfileModal from "@modals/ProfileModal.vue";
import ReportActionModal from "@modals/ReportActionModal.vue";
import ReportModal from "@modals/ReportModal.vue";
import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import StartMessageModal from "@modals/StartMessageModal.vue";

const modals = {
    profile: ProfileModal,
    createAlbum: CreateAlbumModal,
    report: ReportModal,
    reportAction: ReportActionModal,
    startMessage: StartMessageModal,
};

export const useModalsStore = defineStore("modals", () => {
    const isOpen = ref(false);
    const modalComponent = ref(null);
    const modalData = ref(null);

    const openModal = (componentName, data = null) => {
        if (!componentName) return;
        modalComponent.value = markRaw(modals[componentName]);
        modalData.value = data;
        document.body.style.overflow = "hidden";
        isOpen.value = true;
    };

    const closeModal = () => {
        document.body.style.overflow = "";
        modalComponent.value = null;
        modalData.value = null;
        isOpen.value = false;
    };

    return { isOpen, openModal, closeModal, modalComponent, modalData };
});
