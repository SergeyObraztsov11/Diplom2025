import { defineStore } from "pinia";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    where,
    getDoc,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

export const useReportsStore = defineStore("reports", () => {
    const db = getFirestore();

    // Получение всех жалоб
    const fetchReports = async () => {
        try {
            const reportsQuery = query(
                collection(db, "reports"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(reportsQuery);
            const reports = [];

            // Получаем все документы параллельно
            await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();

                    // Получаем данные из ref
                    const [
                        targetDoc,
                        reporterUserDoc,
                        resolvedByDoc,
                        targetUserDoc,
                    ] = await Promise.all([
                        data.target ? getDoc(data.target) : null,
                        data.reporterUser ? getDoc(data.reporterUser) : null,
                        data.resolvedBy ? getDoc(data.resolvedBy) : null,
                        data.targetUser ? getDoc(data.targetUser) : null,
                    ]);
                    reports.push({
                        id: doc.id,
                        type: data.type,
                        target: targetDoc
                            ? {
                                  id: targetDoc.id,
                                  ...targetDoc.data(),
                              }
                            : null,
                        targetUser: targetUserDoc
                            ? { id: targetUserDoc.id, ...targetUserDoc.data() }
                            : null,
                        reporterUser: reporterUserDoc
                            ? {
                                  id: reporterUserDoc.id,
                                  ...reporterUserDoc.data(),
                              }
                            : null,
                        reason: data.reason,
                        description: data.description,
                        status: data.status,
                        createdAt: data.createdAt,
                        resolvedAt: data.resolvedAt,
                        resolvedBy: resolvedByDoc
                            ? {
                                  id: resolvedByDoc.id,
                                  ...resolvedByDoc.data(),
                              }
                            : null,
                        action: data.action,
                        notes: data.notes,
                    });
                })
            );
            return reports;
        } catch (err) {
            console.error("Error fetching reports:", err);
            throw err;
        }
    };

    // Отправка новой жалобы
    const createReport = async ({
        type, // 'comment' | 'album' | 'user'
        targetId, // string - ID объекта, на который поступила жалоба
        targetUserId, // string - ID пользователя, на который поступила жалоба
        reporterUserId, // string - ID пользователя, отправившего жалобу
        reason, // string - причина жалобы
        description, // string - описание жалобы
    } = {}) => {
        try {
            const typeMap = {
                comment: "comments",
                album: "albums",
                user: "users",
            };
            // Создаем ref внутри функции
            const targetRef = doc(db, typeMap[type], targetId);
            const reporterUserRef = doc(db, "users", reporterUserId);
            const targetUserRef = doc(db, "users", targetUserId);

            const newReport = {
                type,
                target: targetRef,
                targetUser: targetUserRef,
                reporterUser: reporterUserRef,
                reason,
                description,
                status: "pending",
                createdAt: serverTimestamp(),
                resolvedAt: null,
                resolvedBy: null,
                action: null,
                notes: null,
            };
            await addDoc(collection(db, "reports"), newReport);
        } catch (err) {
            console.error("Error creating report:", err);
        }
    };

    // Обновление статуса жалобы
    const updateReportStatus = async (
        reportId, // string - ID жалобы
        {
            status, // 'pending' | 'resolved' | 'rejected'
            action, // 'delete' | 'warn' | 'ban' | null
            notes, // string - примечания администратора
            adminId, // string - ID администратора
        }
    ) => {
        try {
            const reportRef = doc(db, "reports", reportId);
            const adminRef = doc(db, "users", adminId);

            await updateDoc(reportRef, {
                status,
                action,
                notes,
                resolvedBy: adminRef,
                resolvedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("Error updating report:", err);
            throw err;
        }
    };

    return {
        fetchReports,
        createReport,
        updateReportStatus,
    };
});
