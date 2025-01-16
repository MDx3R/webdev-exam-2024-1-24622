import {
    NotificationView
} from "./modules/views.js";

let notificationView = new NotificationView();

const notification = localStorage.getItem('notification');
if (notification) {
    notificationView.showNotification(...notification.split(':')); 
    localStorage.removeItem('notification'); 
}