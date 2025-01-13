import {
    ProductRepository,
    OrderRepository
} from "../modules/repositories.js";
import {
    NotificationView,
    CartView,
    CheckoutView
} from "../modules/views.js";
import {
    CartController,
    CheckoutController
} from "../modules/controllers.js";

const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const cartView = new CartView();
const checkoutView = new CheckoutView();
const notificationView = new NotificationView();
const checkoutController = new CheckoutController(
    productRepository,
    orderRepository,
    checkoutView,
    notificationView
);

const cartController = new CartController(
    checkoutController,
    productRepository, 
    cartView, 
    notificationView
);

orderController.cartController = cartController;
console.log(orderController.cartController);

await cartController.init();
orderController.init();
