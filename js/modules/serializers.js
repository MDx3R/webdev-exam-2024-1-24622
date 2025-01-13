function formatDate(date) {
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false
    };
    date = new Date(date);
    return date.toLocaleDateString("de-DE", options).replace(',', '');
}

export {
    formatDate,
};