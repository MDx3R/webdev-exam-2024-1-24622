import {
    OrderRepository,
} from "../modules/repositories.js";
import {
    NotificationView,
    AccountView
} from "../modules/views.js";
import {
    AccountController,
} from "../modules/controllers.js";

const orderRepository = new OrderRepository();
const acountView = new AccountView();
const notificationView = new NotificationView();
const accountController = new AccountController(
    orderRepository, 
    acountView, 
    notificationView
);

accountController.init();