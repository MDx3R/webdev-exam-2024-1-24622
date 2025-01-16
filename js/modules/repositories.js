import {
    listProducts,
    listProductsByPage,
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
        this.current_page = 1;
        this.per_page = 25;
        this.total_count = 0;
    }

    getCart() {
        this.cart = this.getProductsFromCart();
    }

    async getProducts() {
        for (let elem of await listProducts()) {
            this.products.push(new Product(elem));
        }
        this.products = this.sortProducts("rating_desc");
    }

    async getProductsByPage(page = null) {
        if (page) {
            this.current_page = page;
            this.products = [];
        }
        const length = this.products.length;
        const result = await listProductsByPage(
            this.current_page, this.per_page
        );

        this.total_count = result["_pagination"]["total_count"];

        for (let elem of result["goods"]) {
            this.products.push(new Product(elem));
        }
        this.current_page++;

        return length;
    }

    areProductsLeft() {
        return this.products.length < this.total_count;
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
            let order = new Order(elem);
            for (let product_id of order.good_ids) {
                order.goods.push(
                    new Product(await retrieveProduct(product_id))
                );
            }
            this.orders.push(order);
        }
    }

    async getOrder(id) {
        return new Order(await retrieveOrder(id));
    }

    async createOrder(data) {
        return new Order(await postOrder(data));
    }

    async updateOrder(id, data) {
        return new Order(await putOrder(id, data));
    }

    async removeOrder(id) {
        return new Order(await deleteOrder(id));
    }

    removeFromOrders(order) {
        this.orders = this.orders.filter(a => a != order);
    }
}

export {
    ProductRepository,
    OrderRepository,
};