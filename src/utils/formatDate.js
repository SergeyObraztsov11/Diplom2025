export function formatDate(date) {
    if (!date) return "";
    // Если это Firestore Timestamp, преобразуем в Date
    if (typeof date.toDate === "function") {
        date = date.toDate();
    }
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
} 