import {
    ProductRepository,
} from "../modules/repositories.js";
import {
    NotificationView,
    ProductView
} from "../modules/views.js";
import {
    ProductController,
} from "../modules/controllers.js";

const productRepository = new ProductRepository();
const productView = new ProductView();
const notificationView = new NotificationView();
const productController = new ProductController(
    productRepository, 
    productView, 
    notificationView
);

productController.init();