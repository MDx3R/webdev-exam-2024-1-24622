import {
    formatDate,
} from "./serializers.js";
import {
    todayDate,
} from "./utils.js";

class ProductController {
    constructor(repository, view, notification) {
        this.repository = repository;
        this.view = view;
        this.notification = notification;

        this.makeBinds();
    }

    makeBinds() {
        this.view.bindSort(this.handleSort.bind(this));
        this.view.bindFilter(this.handleFilter.bind(this));
        this.view.bindAddToCart(this.handleAddToCart.bind(this));
        this.view.bindRemoveFromCart(this.handleRemoveFromCart.bind(this));
    }

    async init() {
        await this.loadProducts();
    }

    async loadProducts() {
        try {
            await this.repository.getProducts();
            this.view.renderProducts(
                this.repository.products, 
                this.repository.cart
            );
        } catch (err) {
            this.notification.showNotification(err.message, err.name);
        }
            
    }

    handleSort(sortBy) {
        let sortedProducts = this.repository.sortProducts(sortBy);
        
        this.view.renderProducts(sortedProducts);
    }

    handleFilter(filter) {}

    clearCart() {}

    handleAddToCart(product) {
        this.repository.addToCart(product);
        this.view.toggleProduct(product);
    }

    handleRemoveFromCart(product) {
        this.repository.removeFromCart(product);
        this.view.toggleProduct(product);
    }
}

class CartController extends ProductController {
    constructor(controller, repository, view, notification) {
        super(repository, view, notification);
        
        this.controller = controller; // checkout
    }

    makeBinds() {
        this.view.bindRemoveFromCart(this.handleRemoveFromCart.bind(this));
    }

    async loadProducts() {
        await this.repository.loadCart();
        this.view.renderProducts(
            this.repository.products, 
            this.repository.cart
        );      
    }

    clearCart() {
        this.repository.clearCart();
        this.repository.clearProducts();
        this.view.removeProducts();
        this.controller.handleClearCart();
    }

    handleRemoveFromCart(product) {
        this.repository.removeFromCart(product);
        this.repository.removeFromProducts(product);
        this.view.removeProduct(product);
        this.controller.handleRemoveFromCart(product);
    }
}

class CheckoutController {
    constructor(
        productRepository, 
        orderRepository, 
        view, 
        notification
    ) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.view = view;
        this.notification = notification;
        
        this.cartController = null;

        this.makeBinds();
    }

    makeBinds() {
        this.view.bindCreateOrder(this.handleCreateOrder.bind(this));
        this.view.bindChangeDate(this.handleChangeDate.bind(this));
        this.view.bindChangeTime(this.handleChangeTime.bind(this));
    }

    init() {
        this.loadCheckout();
    }

    loadCheckout() {
        this.view.renderCheckout(this.productRepository.products);
    }

    handleCreateOrder(data) {
        let jsonData = {};

        for (const [key, value] of data.entries()) {
            if (key != "comment" && !value) {
                this.notification.showNotification(
                    "Заполните все поля", 
                    "Неправильные данные."
                );
                return;
            }
            if (key == "delivery_date") {
                if (todayDate() > new Date(value)) {
                    this.notification.showNotification(
                        "Время доставки должно быть после текущего времени", 
                        "Неправильное время."
                    );
                    return;
                }
                jsonData[key] = formatDate(value);
                continue;
            }
            if (key == "subscribe") {
                jsonData[key] = value == "on";
                continue;
            }
            jsonData[key] = value;
        }

        if (this.productRepository.cart.length == 0) {
            this.notification.showNotification(
                "Добавьте товары перед оформлением заказа", 
                "Нет товаров."
            );
            return;
        }

        jsonData["good_ids"] = this.productRepository.cart;

        this.orderRepository.createOrder(JSON.stringify(jsonData))
            .then(() => {
                this.notification.showNotification(
                    "Заказ был успешно создан", 
                    "success"
                );

                this.cartController.clearCart();
                this.view.clearCheckout();
            })
            .catch((error) => {
                this.notification.showNotification(
                    error.message, 
                    error.name
                );
            });
    }

    handleRemoveFromCart(product) {
        this.loadCheckout();
    }

    handleClearCart(product) {
        this.loadCheckout();
    }

    handleChangeDate() {
        this.loadCheckout();
    }

    handleChangeTime() {
        this.loadCheckout();
    }
}

export {
    ProductController,
    CartController,
    CheckoutController,
};