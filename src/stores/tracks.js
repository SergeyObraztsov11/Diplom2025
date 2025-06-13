import { useAuthStore } from "@stores/auth";
import {
    arrayRemove,
    arrayUnion,
    doc,
    getFirestore,
    updateDoc,
    getDocs,
    where,
    query,
    collection,
    documentId,
    getDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";

export const useTracksStore = defineStore("tracks", () => {
    const db = getFirestore();
    const authStore = useAuthStore();
    //Лайк альбома
    const likeTrack = async (trackId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedTracks: arrayUnion(trackId),
        });
    };
    // Дизлайк альбома
    const dislikeTrack = async (trackId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedTracks: arrayRemove(trackId),
        });
    };
    // Список лайкнутых треков
    const likedTracks = computed(() => {
        return authStore.currentUserData?.likedTracks || [];
    });

    const getTrackDetails = async (trackDoc) => {
        const trackData = trackDoc.data();

        const trackId = trackDoc.id;
        // Получение данных автора по ссылке
        const authorDoc = await getDoc(trackData.author);
        const authorData = { id: authorDoc.id, ...authorDoc.data() };
        // Получение данных альбома по ссылке
        const albumDoc = await getDoc(trackData.album);
        const albumData = { id: albumDoc.id, ...albumDoc.data() };
        // Возвращаем полный объект трека с разрешенными связанными данными
        return {
            id: trackId,
            ref: trackDoc.ref, // Включаем ссылку на сам трек
            ...trackData, // Включаем остальные поля трека
            author: authorData, // Заменяем ссылку на объект данных автора
            album: albumData, // Заменяем ссылку на объект данных альбома
        };
    };

    const getTrackById = async (trackId) => {
        const trackRef = doc(db, "tracks", trackId);
        const trackDoc = await getDoc(trackRef);
        return await getTrackDetails(trackDoc);
    };

    const getTracksById = async (tracksId) => {
        const tracksSnapshot = await getDocs(
            query(collection(db, "tracks"), where(documentId(), "in", tracksId))
        );
        if (tracksSnapshot.empty) {
            return [];
        }
        return await Promise.all(tracksSnapshot.docs.map(getTrackDetails));
    };

    // Получение всех треков
    const getAllTracks = async () => {
        const querySnapshot = await getDocs(collection(db, "tracks"));
        return await Promise.all(querySnapshot.docs.map(getTrackDetails));
    };
    // Получение треков по ID
    // const fetchTracks = async (trackIds) => {
    //     const tracks = await fetchActions.fetchTracks(db, trackIds);
    //     return await enrichTracks(db, tracks);
    // };
    const getLikedTracks = async () => {
        const likedTrackIds = likedTracks.value;
        if (!(likedTrackIds.length > 0)) return [];

        const tracksSnapshot = await getDocs(
            query(
                collection(db, "tracks"),
                where(documentId(), "in", likedTrackIds)
            )
        );
        if (tracksSnapshot.empty) {
            return [];
        }
        return await Promise.all(tracksSnapshot.docs.map(getTrackDetails));
    };
    return {
        likedTracks,
        likeTrack,
        dislikeTrack,
        getLikedTracks,
        getTrackById,
        getTracksById,
        getTrackDetails,
        getAllTracks,
    };
});
