import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import {
    doc,
    getFirestore,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import {
    getDownloadURL,
    getStorage,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
    const db = getFirestore();
    const auth = getAuth();
    const router = useRouter();
    const storage = getStorage();

    const currentUser = ref(null);
    const currentUserData = ref(null);
    const isAuthStateChangesLoading = ref(true);
    const isUserDataLoaded = ref(false);

    const authStatus = ref(null);

    const isAuthenticated = computed(() => {
        return authStatus.value === "login";
    });

    const isValid = computed(() => {
        return !isAuthStateChangesLoading.value && authStatus.value;
    });

    const currentUserId = computed(() => {
        return currentUser.value?.uid;
    });
    const currentUserDisplayName = computed(() => {
        return currentUserData.value?.displayName;
    });
    const currentUserAvatarURL = computed(() => {
        return currentUserData.value?.imageURL;
    });

    const isAdmin = computed(() => {
        return currentUserData.value?.role === "admin";
    });

    const uploadUserAvatar = async (file) => {
        const avatarUUName = `${uuidv4()}_${currentUserId.value}`;
        console.log(avatarUUName, file);
        const avatarRef = storageRef(storage, `usersAvatars/${avatarUUName}`);
        await uploadBytes(avatarRef, file);
        const avatarDownloadURL = await getDownloadURL(avatarRef);
        return avatarDownloadURL;
    };

    const updateUserData = async (newUserData) => {
        try {
            await updateDoc(doc(db, "users", currentUserId.value), newUserData);
        } catch (error) {
            throw error.code;
        }
    };

    const registerUser = async ({ displayName, email, password }) => {
        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await setDoc(doc(db, "users", user.uid), {
                displayName: displayName,
                imageURL: null,
                role: "user",
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            throw error.code;
        }
    };

    const loginUser = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error.code;
        }
    };
    const logoutUser = async () => {
        try {
            await signOut(auth);
            resetStore();
            router.push({ name: "login" });
        } catch (error) {
            throw error.code;
        }
    };

    let userUnSubscribe = null;

    const resetStore = () => {
        currentUser.value = null;
        currentUserData.value = null;
        authStatus.value = null;
        isAuthStateChangesLoading.value = false;
        isUserDataLoaded.value = false;
        if (userUnSubscribe) {
            userUnSubscribe();
            userUnSubscribe = null;
        }
    };

    const initAuth = () => {
        isAuthStateChangesLoading.value = true;

        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                currentUser.value = user;

                if (user) {
                    authStatus.value = "login";
                    isUserDataLoaded.value = false;
                    if (userUnSubscribe) userUnSubscribe();
                    userUnSubscribe = onSnapshot(
                        doc(db, "users", user.uid),
                        (userSnapshot) => {
                            currentUserData.value = userSnapshot.data();
                            isUserDataLoaded.value = true;
                        }
                    );
                } else {
                    resetStore();
                }

                isAuthStateChangesLoading.value = false;
                resolve(user);
            });
        });
    };

    return {
        registerUser,
        loginUser,
        logoutUser,
        isAuthStateChangesLoading,
        currentUser,
        currentUserData,
        isValid,
        currentUserId,
        currentUserDisplayName,
        currentUserAvatarURL,
        uploadUserAvatar,
        updateUserData,
        isAuthenticated,
        isAdmin,
        initAuth,
        isUserDataLoaded,
    };
});
