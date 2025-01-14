class NotificationView {
    constructor() {
        this.notificationContainer = document.getElementById('notification');
    }

    showNotification(text, type) {
        let alert_class = type == "success" ? "alert-success" : "alert-danger";
        let alert_status = type == "success" ? "Успех!" : type;

        this.notificationContainer.innerHTML = 
            `<div 
                class="alert ${alert_class} alert-dismissible fade show" 
                role="alert"
            >
                <p class="mb-0" id="notification-text">
                    <strong>${alert_status}</strong> ${text}
                </p>
                <button 
                    type="button" 
                    class="btn-close" 
                    data-bs-dismiss="alert" 
                    aria-label="Закрыть"
                >
                </button>
            </div>`;
    }
}

class ProductView {
    constructor() {
        this.productsContainer = document.getElementById('products');
        this.filterInput = document.getElementById('filter-catalog');
        this.sortSelect = document.getElementById('sort-catalog');
        this.onAddToCart = null;
        this.onRemoveFromCart = null;
    }

    renderProducts(products, cart = []) {
        this.productsContainer.innerHTML = '';
        products.forEach(element => {
            this.productsContainer.append(
                this._buildProductCard(
                    element
                )
            );
            if (cart.find(item => element.id == item) !== undefined) {
                this.toggleProduct(element);
            }
        });
    }

    toggleProduct(product) {
        let card = product.container.firstChild;

        let remove_button = card.querySelector(".remove-from-cart-btn");
        let add_button = card.querySelector(".add-to-cart-btn");

        if (card.classList.contains("chosen")) {
            remove_button.hidden = true;
            add_button.hidden = false;
        } else {
            remove_button.hidden = false;
            add_button.hidden = true;
        }

        card.classList.toggle("chosen");
    }

    removeProduct(product) {
        product.container.remove();
    }

    removeProducts() {
        this.productsContainer.innerHTML = '';
    }

    _buildProductCard(product) {
        let column = document.createElement("div");
        column.className = "col-md-6 col-lg-4";

        column.innerHTML =
            `<div class="card h-100">
                <img 
                    class="card-img-top card-img-custom" 
                    src="${product.image_url}" 
                    alt="${product.name}"
                >
                <div 
                    class="card-body d-flex flex-column justify-content-between"
                >
                    <h5 class="card-title">${product.name}</h5>
                    <div>
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge bg-secondary me-1">
                                ${product.rating}
                            </span>
                            <small>Рейтинг</small>
                        </div>

                        <p class="card-text"></p>
                    </div>
                </div>
            </div>`;

        let text = '';
        if (product.discount_price) {
            let discount = Math.round(
                (1 - product.discount_price / product.actual_price) 
                * 100
            );
            text = 
                `<span class="text-decoration-line-through text-muted me-1">
                    <small>${product.actual_price}&#8381;</small>
                </span>
                <span class="fw-bold">
                    ${product.discount_price}&#8381;
                </span>
                <span class="fw-bold">
                    (-${discount}%)
                </span>`;
        } else text = 
            `<span class="fw-bold">
                ${product.actual_price}&#8381;
            </span>`;

        let card_text = column.querySelector(".card-text");
        card_text.innerHTML = text;

        let add_button = document.createElement("button");
        add_button.className = 
            "btn btn-sm btn-outline-primary add-to-cart-btn";
        add_button.innerHTML = "В корзину";

        add_button.addEventListener(
            "click", () => this.onAddToCart(product)
        );

        let remove_button = document.createElement("button");
        remove_button.className = 
            "btn btn-sm btn-outline-danger remove-from-cart-btn";
        remove_button.innerHTML = "Удалить";

        remove_button.addEventListener(
            "click", () => this.onRemoveFromCart(product)
        );

        add_button.hidden = false;
        remove_button.hidden = true;

        card_text.after(add_button);
        card_text.after(remove_button);

        product.container = column;

        return column;
    }

    bindFilter(handler) {}

    bindSort(handler) {
        this.sortSelect.addEventListener(
            'change', () => handler(this.sortSelect.value)
        );
    }

    bindAddToCart(handler) {
        this.onAddToCart = handler;
    }

    bindRemoveFromCart(handler) {
        this.onRemoveFromCart = handler;
    }
}

class CartView extends ProductView {
    toggleProduct(product) {
        let card = product.container.firstChild;

        let remove_button = card.querySelector(".remove-from-cart-btn");
        let add_button = card.querySelector(".add-to-cart-btn");

        if (remove_button.hidden == false) {
            remove_button.hidden = true;
            add_button.hidden = false;
        } else {
            remove_button.hidden = false;
            add_button.hidden = true;
        }
    }
}

class CheckoutView {
    constructor() {
        this.orderContainer = document.getElementById('orders');
        this.orderCreateForm = document.getElementById('order-create-form');
        this.createOrderButton = document.getElementById('create-order');
        this.dateSelect = document.getElementById('delivery_date');
        this.timeSelect = document.getElementById('delivery_interval');

        this.goodsCostText = document.getElementById('goods-cost');
        this.deliveryCostText = document.getElementById('delivery-cost');
        this.finalCostText = document.getElementById('final-cost');
    }

    renderCheckout(products) {
        function costBuilder(text, value) {
            return `${text} <strong>${value}&#8381;</strong>`;
        }

        let delivery_cost = this.calculateDeliveryCost(
            this.orderCreateForm.delivery_date.value,
            this.orderCreateForm.delivery_interval.value.split('-')[0]
        );
        let goodsCost = products.reduce(
            (sum, current) => sum + current.getPrice(), 0
        );
        this.goodsCostText.innerHTML 
            = costBuilder("Стоимость товаров:", goodsCost);
        this.deliveryCostText.innerHTML 
            = costBuilder("Доставка:", delivery_cost);
        this.finalCostText.innerHTML = 
            costBuilder("Итоговая стоимость:", goodsCost + delivery_cost);
    }

    clearCheckout() {
        this.orderCreateForm.reset();
    }

    calculateDeliveryCost(date, time) {
        let cost = 200;

        if (!(date && time)) return cost;

        date = new Date(date + " " + time);

        let dayOfWeek = date.getDay();
        let hour = date.getHours();

        let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
        if (isWeekend) {
            cost += 300;
        } else if (hour >= 18) {
            cost += 200;
        }
        return cost;
    }

    bindCreateOrder(handler) {
        this.createOrderButton.addEventListener(
            "click", 
            event => {
                handler(new FormData(this.orderCreateForm));
                event.preventDefault();
            }
        );
    }

    bindChangeDate(handler) {
        this.dateSelect.addEventListener(
            "change",
            handler
        );
    }

    bindChangeTime(handler) {
        this.timeSelect.addEventListener(
            "change",
            handler
        );
    }
}

export {
    NotificationView,
    ProductView,
    CartView,
    CheckoutView,
};