import { defineStore } from "pinia";
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
    query,
    where,
} from "firebase/firestore";
import { useAuthStore } from "@stores/auth";

export const useArtistsStore = defineStore("artists", () => {
    const db = getFirestore();
    const authStore = useAuthStore();
    // Получение числа слушателей
    const getArtistListenersCount = async (artistRef) => {
        // Получаем все треки исполнителя
        const tracksSnapshot = await getDocs(
            query(collection(db, "tracks"), where("author", "==", artistRef))
        );
        if (tracksSnapshot.empty) {
            return 0;
        }
        // Получаем ID всех треков исполнителя
        const artistTrackIds = tracksSnapshot.docs.map((doc) => doc.id);
        // Получаем всех пользователей
        const usersSnapshot = await getDocs(collection(db, "users"));
        // Считаем количество слушателей
        const listenersCount = usersSnapshot.docs.reduce((count, userDoc) => {
            const userData = userDoc.data();
            const hasLikedTracks = userData.likedTracks?.some((trackId) =>
                artistTrackIds.includes(trackId)
            );
            return hasLikedTracks ? count + 1 : count;
        }, 0);

        return listenersCount;
    };

    const getArtistDetails = async (artistDoc) => {
        const artistData = artistDoc.data();
        const artistId = artistDoc.id;

        const listenersCount = await getArtistListenersCount(artistDoc.ref);

        const albumsSnapshot = await getDocs(
            query(
                collection(db, "albums"),
                where("author", "==", artistDoc.ref)
            )
        );
        const artistAlbums = albumsSnapshot.docs.map((albumDoc) => {
            return {
                id: albumDoc.id,
                ...albumDoc.data(),
                author: { id: artistDoc.id, ...artistDoc.data() },
            };
        });
        const tracksSnapshot = await getDocs(
            query(
                collection(db, "tracks"),
                where("author", "==", artistDoc.ref)
            )
        );
        const artistTracks = tracksSnapshot.docs.map((trackDoc) => {
            return {
                id: trackDoc.id,
                ...trackDoc.data(),
                author: { id: trackDoc.id, ...trackDoc.data() },
            };
        });
        return {
            id: artistId,
            displayName: artistData.displayName,
            imageURL: artistData.imageURL || null,
            createdAt: artistData.createdAt || null,
            description: artistData.description || null,
            listenersCount: listenersCount,
            socialLinks: artistData.socialLinks,
            albums: artistAlbums,
            tracks: artistTracks,
        };
    };

    const getArtistById = async (artistId) => {
        const artistRef = doc(db, "users", artistId);
        const artistDoc = await getDoc(artistRef);
        if (!artistDoc.exists()) return null;

        const artistDetails = await getArtistDetails(artistDoc);

        return artistDetails;
    };

    const getAllArtists = async () => {
        const querySnapshot = await getDocs(
            query(collection(db, "users"), where("role", "!=", "admin"))
        );
        const artists = await Promise.all(
            querySnapshot.docs.map(getArtistDetails)
        );
        return artists;
    };

    const likeArtist = async (artistId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedArtists: arrayUnion(artistId),
        });
    };

    const dislikeArtist = async (artistId) => {
        const userRef = doc(db, "users", authStore.currentUserId);

        await updateDoc(userRef, {
            likedArtists: arrayRemove(artistId),
        });
    };

    return {
        getArtistById,
        getAllArtists,
        getArtistListenersCount,
        likeArtist,
        dislikeArtist,
    };
});
