
class ProductController {
    constructor(repository, view, notification) {
        this.repository = repository;
        this.view = view;
        this.notification = notification;

        // binds

        this.view.bindSort(this.handleSort.bind(this));
        this.view.bindFilter(this.handleFilter.bind(this));
        this.view.bindAddToCart(this.handleAddToCart.bind(this));
        this.view.bindRemoveFromCart(this.handleRemoveFromCart.bind(this));

        this.init();
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

    handleFilter(filter) {

    }

    handleAddToCart(product) {
        this.repository.addToCart(product);
        this.view.toggleProduct(product);
        console.log("added to cart: " + product.name);
    }

    handleRemoveFromCart(product) {
        this.repository.removeFromCart(product);
        this.view.toggleProduct(product);
        console.log("removed to cart: " + product.name);
    }
}

export {
    ProductController
};