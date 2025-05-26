import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    increment,
    writeBatch,
    runTransaction,
} from "firebase/firestore";

export const uploadActions = {
    async uploadComment(db, albumId, commentText, userId, parentId = null) {
        const albumRef = doc(db, "albums", albumId);
        const userRef = doc(db, "users", userId);

        const commentData = {
            text: commentText,
            album: albumRef,
            user: userRef,
            createdAt: serverTimestamp(),
            likes: 0,
            replies: 0,
            parent: parentId ? doc(db, "comments", parentId) : null,
        };

        // Если это ответ, обновляем счетчик replies у родителя
        if (parentId) {
            await runTransaction(db, async (transaction) => {
                const parentRef = doc(db, "comments", parentId);
                const parentDoc = await transaction.get(parentRef);
                
                if (parentDoc.exists()) {
                    const currentReplies = parentDoc.data().replies || 0;
                    transaction.update(parentRef, { replies: currentReplies + 1 });
                }
            });
        }

        const commentRef = await addDoc(
            collection(db, "comments"),
            commentData
        );
        
        return commentRef.id;
    },
};
