function todayDate() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

export {
    todayDate,
};