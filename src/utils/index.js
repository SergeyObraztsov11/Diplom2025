export const getFormattedDate = (date) => {
    const result = new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "long",
        day: "2-digit",
    }).format(date.toDate());
    console.log("getFormattedDate", date, result);
    return result;
};
