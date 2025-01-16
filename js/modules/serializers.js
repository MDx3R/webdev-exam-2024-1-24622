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

function formatDateTime(datetime) {
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    };
    let date = new Date(datetime);
    return date.toLocaleDateString("de-DE", options).replace(',', '');
}

export {
    formatDate,
    formatDateTime,
};