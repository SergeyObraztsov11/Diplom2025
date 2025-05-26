import {
    getDocs,
    collection,
    query,
    where,
    orderBy,
    doc,
    getDoc,
} from "firebase/firestore";

export const fetchActions = {
    async fetchRootAlbumComments(db, albumId) {
        const albumRef = doc(db, "albums", albumId);
        const q = query(
            collection(db, "comments"),
            where("album", "==", albumRef),
            where("parent", "==", null)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("Комментарии не найдены");
            return [];
        }

        const comments = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();

                const userData = await getDoc(data.user);
                const albumData = await getDoc(data.album);

                return {
                    id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt,
                    likes: data.likes || 0,
                    replies: data.replies || 0,
                    user: {
                        id: userData.id,
                        ...userData.data(),
                    },
                    album: {
                        id: albumData.id,
                        ...albumData.data(),
                    },
                    parent: null,
                };
            })
        );
        return comments;
    },

    async fetchReplyAlbumComments(db, albumId, parentId) {
        const albumRef = doc(db, "albums", albumId);
        const parentRef = doc(db, "comments", parentId);

        const q = query(
            collection(db, "comments"),
            where("album", "==", albumRef),
            where("parent", "==", parentRef),
            orderBy("createdAt", "asc")
        );

        const snapshot = await getDocs(q);

        const comments = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const userData = await getDoc(data.user);
                const albumData = await getDoc(data.album);
                const parentData = await getDoc(data.parent);
                
                return {
                    id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt,
                    likes: data.likes,
                    user: {
                        id: userData.id,
                        ...userData.data(),
                    },
                    album: {
                        id: albumData.id,
                        ...albumData.data(),
                    },
                    parent: {
                        id: parentData.id,
                        ...parentData.data(),
                    },
                };
            })
        );
        return comments;
    },
};
