import { useAuthStore } from "@stores/auth";
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    serverTimestamp,
    updateDoc,
    writeBatch,
    documentId,
    where,
    query,
} from "firebase/firestore";
import {
    getDownloadURL,
    getStorage,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import Fuse from "fuse.js";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { computed, onMounted, ref } from "vue";
import { useArtistsStore } from "@stores/artists";

export const useAlbumsStore = defineStore("albums", () => {
    const db = getFirestore();
    const storage = getStorage();
    const authStore = useAuthStore();
    const artistsStore = useArtistsStore();
    // --- Внутренние вспомогательные функции ---

    const uploadCoverFile = async (file) => {
        const coverUUName = `${uuidv4()}_albumCover`;
        const coverRef = storageRef(storage, `albumCovers/${coverUUName}`);
        await uploadBytes(coverRef, file);
        return await getDownloadURL(coverRef);
    };

    const uploadTrackFile = async (file) => {
        const trackUUName = `${uuidv4()}_track`;
        const trackRef = storageRef(storage, `tracks/${trackUUName}`);
        await uploadBytes(trackRef, file);
        return await getDownloadURL(trackRef);
    };

    // Создание альбома
    const createAlbum = async ({ albumData, tracksData }) => {
        try {
            if (!authStore.currentUser?.uid) {
                throw new Error("User not authenticated.");
            }

            const imageURL = await uploadCoverFile(albumData.imageFile);

            const batch = writeBatch(db);

            const albumRef = doc(collection(db, "albums"));
            const authorRef = doc(db, "users", authStore.currentUser.uid);

            const trackRefs = [];

            for (let i = 0; i < tracksData.length; i++) {
                const trackData = tracksData[i];
                const audioURL = await uploadTrackFile(trackData.audioFile);

                const trackRef = doc(collection(db, "tracks"));
                trackRefs.push(trackRef);

                batch.set(trackRef, {
                    title: trackData.title,
                    titleLower: trackData.title.toLowerCase(),
                    author: authorRef,
                    album: albumRef,
                    genre: trackData.genre,
                    imageURL,
                    audioURL,
                    duration: trackData.duration,
                    isExplicit: trackData.isExplicit || false,
                    createdAt: serverTimestamp(),
                    order: i,
                });
            }

            batch.set(albumRef, {
                title: albumData.title,
                description: albumData.description || "",
                imageURL,
                author: authorRef,
                tracks: trackRefs,
                genre: albumData.genre,
                duration: tracksData.reduce(
                    (total, track) => total + track.duration,
                    0
                ),
                isExplicit: tracksData.some((track) => track.isExplicit),
                createdAt: serverTimestamp(),
            });

            await batch.commit();

            return albumRef.id;
        } catch (error) {
            console.error("Error creating album:", error);
            throw error;
        }
    };

    const getAlbumDetails = async (albumDoc) => {
        const albumData = albumDoc.data();
        const albumId = albumDoc.id;

        const authorDoc = await getDoc(albumData.author);
        const authorData = {
            id: authorDoc.id,
            ...authorDoc.data(),
            listenersCount: await artistsStore.getArtistListenersCount(
                authorDoc.ref
            ),
        };

        const trackRefs = albumData.tracks;
        const trackDocs = await Promise.all(
            trackRefs.map((ref) => getDoc(ref))
        );

        const tracksData = trackDocs.map((trackDoc) => ({
            id: trackDoc.id,
            ...trackDoc.data(),
        }));

        return {
            id: albumId,
            ...albumData,
            author: authorData,
            tracks: tracksData,
        };
    };
    // Получение всех альбомов
    const getAllAlbums = async () => {
        const querySnapshot = await getDocs(collection(db, "albums"));
        return await Promise.all(querySnapshot.docs.map(getAlbumDetails));
    };

    // Получение альбомов по массиву ссылок
    const getAlbumByRefs = async (albumRefs) => {
        // Получаем каждый документ по ссылке
        const albumDocs = await Promise.all(
            albumRefs.map((ref) => getDoc(ref))
        );
        // Используем getAlbumDetails для получения данных с разрешением вложенных ссылок
        const albums = await Promise.all(albumDocs.map(getAlbumDetails));
        return albums.filter(
            (album) => album !== null && album.tracks.length > 0
        );
    };
    // Получение альбома по id
    const getAlbumById = async (albumId) => {
        const albumRef = doc(db, "albums", albumId);
        const albumDoc = await getDoc(albumRef);

        if (!albumDoc.exists()) return null;

        return await getAlbumDetails(albumDoc);
    };

    //Лайк альбома
    const likeAlbum = async (albumId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedAlbums: arrayUnion(albumId),
        });
    };

    // Дизлайк альбома
    const dislikeAlbum = async (albumId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedAlbums: arrayRemove(albumId),
        });
    };

    const likedAlbums = computed(() => {
        return authStore.currentUserData?.likedAlbums;
    });
    const getLikedAlbums = async () => {
        const likedAlbumsIds = likedAlbums.value;
        if (!(likedAlbumsIds.length > 0)) return [];
        
        const albumsSnapshot = await getDocs(
            query(
                collection(db, "albums"),
                where(documentId(), "in", likedAlbumsIds)
            )
        );
        if (albumsSnapshot.empty) {
            return [];
        }
        return await Promise.all(albumsSnapshot.docs.map(getAlbumDetails));
    };
    return {
        getAllAlbums,
        getAlbumByRefs,
        likeAlbum,
        dislikeAlbum,
        getAlbumById,
        likedAlbums,
        createAlbum,
        getLikedAlbums,
    };
});
