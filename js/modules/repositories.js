import {
    listProducts,
    retrieveProduct,
    listOrders,
    retrieveOrder,
    postOrder, 
    putOrder, 
    deleteOrder,
} from "./api.js";
import {
    Product,
    Order
} from "./models.js";

class ProductRepository {
    constructor() {
        this.products = [];
        this.cart = []; // product ids 
    }

    async getProducts() {
        for (let elem of await listProducts()) {
            this.products.push(new Product(elem));
        }
        this.products = this.sortProducts("rating_desc");
        this.cart = this.getProductsFromCart();
    }

    async getProduct(id) {
        return new Product(await retrieveProduct(id));
    }

    async loadCart() {
        this.cart = this.getProductsFromCart();
        for (let id of this.cart) {
            this.products.push(new Product(await retrieveProduct(id)));
        }
    }

    getProductsFromCart() {
        let result = localStorage.getItem("cart");
        if (result === null) return [];

        return JSON.parse(result);
    }

    _getValue(key, product) {
        if (key == "rating_asc" || key == "rating_desc") {
            return product.rating;
        } else if (key == "price_asc" || key == "price_desc") {
            return product.getPrice();
        } else {
            return product.id;
        }
    }

    sortProducts(key) {
        let ascending = key.includes("asc");

        return this.products.sort((a, b) => {
            const valueA = this._getValue(key, a);
            const valueB = this._getValue(key, b);
            return ascending ? valueA - valueB : valueB - valueA;
        });
    }

    _setCart() {
        localStorage.setItem("cart", JSON.stringify(this.cart));
    }

    addToCart(product) {
        this.cart.push(product.id);
        this._setCart();
    }

    removeFromCart(product) {
        this.cart = this.cart.filter(a => a != product.id);
        this._setCart();
    }

    clearCart() {
        this.cart = [];
        this._setCart();
    }

    removeFromProducts(product) {
        this.products = this.products.filter(a => a != product);
    }

    clearProducts() {
        this.products = [];
    }

    filterProducts() {
        return;
    }
}

class OrderRepository {
    constructor() {
        this.orders = [];
    }

    async getOrders() {
        for (let elem of await listOrders()) {
            this.orders.push(new Order(elem));
        }
    }

    async getOrder(id) {
        return new Order(await retrieveOrder(id));
    }

    async createOrder(data) {
        return new Order(await postOrder(data));
    }

    async updateOrder(order) {
        return new Order(await putOrder(order));
    }

    async removeOrder(id) {
        return new Order(await deleteOrder(id));
    }
}

export {
    ProductRepository,
    OrderRepository,
};