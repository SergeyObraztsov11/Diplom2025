import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "@stores/auth";
import { getFirestore, getDocs } from "firebase/firestore";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
    addDoc,
    serverTimestamp,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";

export const useChatsStore = defineStore("chats", () => {
    const db = getFirestore();
    const authStore = useAuthStore();

    const chats = ref([]);
    const _unsubscribeChats = ref(null);
    // Первая загрузка данных
    const isInitialLoading = ref(false);

    const createChatWithUser = async (otherUserId) => {
        const myRef = doc(db, "users", authStore.currentUserId);
        const otherRef = doc(db, "users", otherUserId);

        const chatRef = await addDoc(collection(db, "chats"), {
            participants: [myRef, otherRef],
            messages: [],
            lastMessage: null,
            timestamp: serverTimestamp(),
        });

        return chatRef.id;
    };

    const getChatByUser = async (targetUserId) => {
        try {
            const currentUserId = authStore.currentUserId;
            if (!currentUserId || !targetUserId) return null;

            // Создаем ссылки на документы пользователей
            const currentUserRef = doc(db, "users", currentUserId);
            const targetUserRef = doc(db, "users", targetUserId);

            // Создаем отсортированный массив ссылок
            const participants = [currentUserRef, targetUserRef].sort((a, b) => 
                a.path.localeCompare(b.path)
            );

            const querySnapshot = await getDocs(
                query(
                    collection(db, "chats"),
                    where("participants", "==", participants)
                )
            );

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }

            return null;
        } catch (error) {
            console.error("Ошибка при получении чата:", error);
            return null;
        }
    };

    // Отправка сообщения
    const sendMessage = async (chatId, text) => {
        // Создаем refs
        const chatRef = doc(db, "chats", chatId);
        const senderRef = doc(db, "users", authStore.currentUserId);
        // 1. Создаем новое сообщение
        const messageRef = await addDoc(collection(db, "messages"), {
            sender: senderRef,
            chat: chatRef,
            content: {
                type: "text",
                value: text,
            },
            timestamp: serverTimestamp(),
        });
        // 2. Добавляем ref сообщения в массив messages в чате
        await updateDoc(chatRef, {
            messages: arrayUnion(messageRef),
            lastMessage: messageRef,
        });
    };

    // Подписка на чаты пользователя
    const subscribeToChats = () => {
        const userRef = doc(db, "users", authStore.currentUserId);

        const chatsRef = collection(db, "chats");
        const q = query(
            chatsRef,
            where("participants", "array-contains", userRef)
        );

        isInitialLoading.value = true;

        _unsubscribeChats.value = onSnapshot(
            q,
            async (snapshot) => {
                // Получаем данные чатов с сообщениями и пользователями
                const chatsData = await Promise.all(
                    snapshot.docs.map(async (chatDoc) => {
                        const chat = chatDoc.data();

                        // Получаем данные участников чата
                        const participants = await Promise.all(
                            chat.participants.map(async (participantRef) => {
                                const participantDoc = await getDoc(
                                    participantRef
                                );
                                return {
                                    id: participantDoc.id,
                                    ...participantDoc.data(),
                                };
                            })
                        );
                        // Получаем данные всех сообщений и отправителей
                        const messages = await Promise.all(
                            chat.messages.map(async (messageRef) => {
                                const messageDoc = await getDoc(messageRef);
                                const messageData = {
                                    id: messageDoc.id,
                                    ...messageDoc.data(),
                                };

                                // Получаем данные отправителя
                                if (messageData.sender) {
                                    const senderDoc = await getDoc(
                                        messageData.sender
                                    );
                                    messageData.sender = {
                                        id: senderDoc.id,
                                        ...senderDoc.data(),
                                    };
                                }

                                return messageData;
                            })
                        );

                        // Получаем данные последнего сообщения, если оно существует
                        let lastMessage = null;
                        if (chat.lastMessage) {
                            const lastMessageDoc = await getDoc(
                                chat.lastMessage
                            );
                            lastMessage = {
                                id: lastMessageDoc.id,
                                ...lastMessageDoc.data(),
                            };

                            // Получаем данные отправителя последнего сообщения
                            if (lastMessage.sender) {
                                const senderDoc = await getDoc(
                                    lastMessage.sender
                                );
                                lastMessage.sender = {
                                    id: senderDoc.id,
                                    ...senderDoc.data(),
                                };
                            }
                        }

                        return {
                            id: chatDoc.id,
                            ...chat,
                            lastMessage,
                            participants,
                            messages,
                        };
                    })
                );
                chats.value = chatsData;
                isInitialLoading.value = false;
            },
            (error) => {
                isInitialLoading.value = false;
                console.error(error);
            }
        );
    };

    // Отписка при размонтировании
    const unsubscribeChats = () => {
        if (_unsubscribeChats.value) {
            _unsubscribeChats.value();
            _unsubscribeChats.value = null;
        }
    };

    return {
        chats,
        getChatByUser,
        subscribeToChats,
        unsubscribeChats,
        sendMessage,
        isInitialLoading,
        createChatWithUser,
    };
});
