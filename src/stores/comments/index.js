import { defineStore } from "pinia";
import { getFirestore } from "firebase/firestore";
import { useAuthStore } from "@stores/auth";
import { fetchActions } from "./actions/fetch";
import { uploadActions } from "./actions/upload";

export const useCommentsStore = defineStore("comments", () => {
    const db = getFirestore();
    const authStore = useAuthStore();

    const getAlbumRootComments = async (albumId) => {
        return await fetchActions.fetchRootAlbumComments(db, albumId);
    };
    const getAlbumReplyComments = async (albumId, parentId) => {
        return await fetchActions.fetchReplyAlbumComments(
            db,
            albumId,
            parentId
        );
    };

    const uploadComment = async (albumId, commentText, parentId = null) => {
        const userId = authStore.currentUserId;
        await uploadActions.uploadComment(
            db,
            albumId,
            commentText,
            userId,
            parentId
        );
    };

    return {
        getAlbumRootComments,
        getAlbumReplyComments,
        uploadComment,
    };
});
