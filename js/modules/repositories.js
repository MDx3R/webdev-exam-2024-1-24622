import {
    listProducts,
    getProduct
} from "./api.js";
import {
    Product
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

    async loadCart() {
        this.cart = this.getProductsFromCart();
        for (let id of this.cart) {
            this.products.push(new Product(await getProduct(id)));
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
            return product.discount_price ?? product.actual_price;
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

    addToCart(product) {
        this.cart.push(product.id);
        localStorage.setItem("cart", JSON.stringify(this.cart));
    }

    removeFromCart(product) {
        localStorage.setItem(
            "cart", 
            JSON.stringify(
                this.getProductsFromCart().filter(a => a != product.id)
            )
        );
    }

    filterProducts() {
        return;
    }
}

export {
    ProductRepository,
};