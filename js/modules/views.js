import {
    formatDate,
    formatDateTime,
} from "./serializers.js";

class NotificationView {
    constructor() {
        this.notificationContainer = document.getElementById('notification');
    }

    showNotification(text, type) {
        let alert_class = type == "success" ? "alert-success" 
            : "info" ? "alert-info" : "alert-danger";
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
        
        setTimeout(() => {
            this.notificationContainer.innerHTML = '';
        }, 5000);
    }

    showCancelActionNotification() {
        this.showNotification("Вы его отменили", "Действие не выполнено.");
    }
}

class ProductView {
    constructor() {
        this.productsContainer = document.getElementById('products');
        this.filterInput = document.getElementById('filter-catalog');
        this.sortSelect = document.getElementById('sort-catalog');
        this.loadMoreButton = document.getElementById('load-more-btn');
        this.onAddToCart = null;
        this.onRemoveFromCart = null;
    }

    renderProducts(products, cart = []) {
        this.productsContainer.innerHTML = '';
        this.addProducts(products, cart);
    }

    addProducts(products, cart = []) {
        products.forEach(element => {
            this.productsContainer.append(
                this._buildProductCard(
                    element
                )
            );
            if (cart.find(item => element.id == item) !== undefined) {
                this.chooseProduct(element);
            }
        });
    }

    showLoadMoreButton() {
        this.loadMoreButton.hidden = false;
    }

    hideLoadMoreButton() {
        this.loadMoreButton.hidden = true;
    }

    chooseProduct(product) {
        let card = product.container.firstChild;
        let remove_button = card.querySelector(".remove-from-cart-btn");
        let add_button = card.querySelector(".add-to-cart-btn");

        remove_button.hidden = false;
        add_button.hidden = true;

        card.classList.add("chosen");
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
                    <h5 
                        class="card-title truncated-text" 
                        title="${product.name}"
                    >
                        ${product.name}
                    </h5>
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

    bindLoadMore(handler) {
        this.loadMoreButton.addEventListener("click", handler);
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

class OrderView {
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

    calculateProductsCost(products) {
        return products.reduce(
            (sum, current) => sum + current.getPrice(), 0
        );
    }

    _concatProductNames(products) {
        return products
            .map(element => element.name).join(", ");
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

class CheckoutView extends OrderView {
    constructor() {
        super();
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

        const delivery_cost = this.calculateDeliveryCost(
            this.orderCreateForm.delivery_date.value,
            this.orderCreateForm.delivery_interval.value.split('-')[0]
        );

        const goodsCost = this.calculateProductsCost(products);

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

    bindCreateOrder(handler) {
        this.createOrderButton.addEventListener(
            "click", 
            event => {
                handler(new FormData(this.orderCreateForm));
                event.preventDefault();
            }
        );
    }
}

class AccountView extends OrderView {
    constructor() {
        super();
        this.tableBody = document.getElementById('table-body');
        this.modalContainer = document.getElementById('orderModal');
        this.modalLabel = document.getElementById('orderModalLabel');
        this.modalBodyContainer = document.getElementById('orderModalBody');
        this.modalFooterContainer = document
            .getElementById('orderModalFooter');

        this.onDateSelect = null;
        this.onTimeSelect = null;
        this.onRejectAction = null;
        // this.onViewOrder = null;
        this.onEditOrder = null;
        this.onRemoveOrder = null;
    }

    bindChangeDate(handler) {
        this.onDateSelect = handler;
    }

    bindChangeTime(handler) {
        this.onTimeSelect = handler;
    }

    renderOrders(orders) {
        this.tableBody.innerHTML = '';
        orders.forEach(element => {
            this.tableBody.append(
                this._buildOrderCard(
                    element
                )
            );
        });
    }

    updateOrder(order) {
        order.container.replaceWith(
            this._buildOrderCard(
                order
            )
        );
    }

    _buildOrderCard(order) {
        let row = document.createElement("tr");

        // const productNames = order.goods
        //     .map(product => product.name).join(", ");

        const productNames = this._concatProductNames(order.goods);
        const delivery_cost = this.calculateDeliveryCost(
            order.delivery_date,
            order.delivery_interval.split('-')[0]
        );
        const goodsCost = this.calculateProductsCost(order.goods);

        row.innerHTML = 
            `<td>${order.id}</td>
            <td class="td-order-w-100">${formatDateTime(order.created_at)}</td>
            <td>
                <p class="truncated-text mb-1" title="${productNames}">
                    ${productNames}
                </p>
            </td>
            <td class="th-order-w-100">${delivery_cost + goodsCost}</td>
            <td>
                <p class="mb-0">${formatDate(order.delivery_date)}</p>
                <p class="mb-0">${order.delivery_interval}</p>
            </td>`;

        let cell = document.createElement("td");
        let contarinder = document.createElement("div");
        contarinder.classList = "d-flex gap-1";

        cell.append(contarinder);

        let viewButton = document.createElement("button");
        viewButton.className = "btn btn-sm btn-outline-primary";
        viewButton.innerHTML = '<i class="bi bi-eye"></i>';
        viewButton.addEventListener(
            "click", 
            () => this.showOrderModal(order, "view")
        );

        let editButton = document.createElement("button");
        editButton.className = "btn btn-sm btn-outline-secondary";
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.addEventListener(
            "click", 
            () => this.showOrderModal(order, "edit")
        );

        let removeButton = document.createElement("button");
        removeButton.className = "btn btn-sm btn-outline-danger";
        removeButton.innerHTML = '<i class="bi bi-trash"></i>';
        removeButton.addEventListener(
            "click", 
            () => this.showOrderModal(order, "remove")
        );

        contarinder.append(viewButton, editButton, removeButton);

        row.append(cell);

        order.container = row;

        return row;
    }

    showOrderModal(order, modal_type) {
        this.modalLabel.innerHTML = "";
        this.modalBodyContainer.innerHTML = "";
        this.modalFooterContainer.innerHTML = "";

        this._buildOrderModal(order, modal_type);

        new bootstrap.Modal(this.modalContainer).show();
    }

    _buildOrderModal(order, modal_type) {
        if (modal_type == "view") this._buildViewOrderModal(order);
        else if (modal_type == "remove") this._buildRemoveOrderModal(order);
        else if (modal_type == "edit") this._buildEditOrderModal(order);
    }

    _buildRemoveOrderModal(order) {
        this.modalLabel.innerHTML = "Удаление заказа";
        this.modalBodyContainer.innerHTML 
            = this._buildRemoveOrderModalBody();
        this.modalFooterContainer.append(
            this._buildRemoveOrderModalButtons(order)
        );
    }

    _updateOrderModalCost(order) {
        const delivery_cost = this.calculateDeliveryCost(
            document.getElementById("delivery_date").value,
            document.getElementById("delivery_interval")
                .value.split('-')[0]
        );
        const goodsCost = this.calculateProductsCost(order.goods);
        document.getElementById("order-modal-cost")
            .innerHTML = `${delivery_cost + goodsCost}&#8381;`;

    }

    _buildEditOrderModal(order) {
        this.modalLabel.innerHTML = "Изменение заказа";
        this.modalBodyContainer.innerHTML 
            = this._buildEditOrderModalBody(order);
        this.modalFooterContainer.append(
            this._buildEditOrderModalButtons(order)
        );

        this.modalBodyContainer.querySelector("#delivery_date")
            .addEventListener(
                "change", 
                () => this._updateOrderModalCost(order)
            );
        this.modalBodyContainer.querySelector("#delivery_interval")
            .addEventListener(
                "change", 
                () => this._updateOrderModalCost(order)
            );
    }

    _buildRemoveOrderModalBody() {
        return `<div class="text-center">
                    Вы уверены, что хотите удалить заказ?
                </div>`;
    }

    _buildViewOrderModal(order) {
        this.modalLabel.innerHTML = "Просмотр заказа";
        this.modalBodyContainer.innerHTML 
            = this._buildViewOrderModalBody(order);
        this.modalFooterContainer.append(
            this._buildViewOrderModalButtons(order)
        );
    }

    _buildViewOrderModalButtons() {
        let container = document.createElement("div");
        
        let button = document.createElement("button");
        button.className = "btn btn-secondary";
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-dismiss", "modal");
        button.innerHTML = "Ok";

        container.append(button);
        
        return container;
    }

    _buildRemoveOrderModalButtons(order) {
        let container = document.createElement("div");
        container.className = "d-flex gap-1";
        
        let rejectButton = document.createElement("button");
        rejectButton.className = "btn btn-secondary";
        rejectButton.setAttribute("type", "button");
        rejectButton.setAttribute("data-bs-dismiss", "modal");
        rejectButton.innerHTML = "Нет";
        rejectButton.addEventListener(
            "click", 
            () => { 
                setTimeout(
                    () => this.onRejectAction(), 
                    500
                ); 
            }
        );

        let confirmButton = document.createElement("button");
        confirmButton.className = "btn btn-secondary";
        confirmButton.setAttribute("type", "button");
        confirmButton.setAttribute("data-bs-dismiss", "modal");
        confirmButton.innerHTML = "Да";
        confirmButton.addEventListener(
            "click", 
            () => this.onRemoveOrder(order)
        );

        container.append(rejectButton);
        container.append(confirmButton);
        
        return container;
    }

    _buildEditOrderModalButtons(order) {
        let container = document.createElement("div");
        container.className = "d-flex gap-1";
        
        let rejectButton = document.createElement("button");
        rejectButton.className = "btn btn-secondary";
        rejectButton.setAttribute("type", "button");
        rejectButton.setAttribute("data-bs-dismiss", "modal");
        rejectButton.innerHTML = "Отмена";
        rejectButton.addEventListener(
            "click", 
            () => { 
                setTimeout(
                    () => this.onRejectAction(), 
                    500
                ); 
            }
        );

        let confirmButton = document.createElement("button");
        confirmButton.className = "btn btn-secondary";
        confirmButton.setAttribute("type", "button");
        confirmButton.setAttribute("data-bs-dismiss", "modal");
        confirmButton.innerHTML = "Сохранить";
        confirmButton.addEventListener(
            "click", 
            () => this.onEditOrder(order)
        );

        container.append(rejectButton);
        container.append(confirmButton);
        
        return container;
    }

    _buildViewOrderModalBody(order) {
        const productNames = this._concatProductNames(order.goods);
        const delivery_cost = this.calculateDeliveryCost(
            order.delivery_date,
            order.delivery_interval.split('-')[0]
        );
        const goodsCost = this.calculateProductsCost(order.goods);
        return `<div class="container">
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Дата оформления:
                        </div>
                        <div class="col-6">
                            ${formatDateTime(order.created_at)}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Имя:
                        </div>
                        <div class="col-6">
                            ${order.full_name}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Номер телефона:
                        </div>
                        <div class="col-6">
                            ${order.phone}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Email:
                        </div>
                        <div class="col-6">
                            ${order.email}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Адрес доставки:
                        </div>
                        <div class="col-6">
                            ${order.delivery_address}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Дата доставки:
                        </div>
                        <div class="col-6">
                            ${formatDate(order.delivery_date)}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Время доставки:
                        </div>
                        <div class="col-6">
                            ${order.delivery_interval}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Состав заказа:
                        </div>
                        <div class="col-6">
                            ${productNames}
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Стоимость:
                        </div>
                        <div class="col-6">
                            ${delivery_cost + goodsCost}&#8381;
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 fw-bold">
                            Комментарий:
                        </div>
                        <div class="col-6">
                            ${order.comment ?? ""}
                        </div>
                    </div>
                </div>`;
    }

    _buildEditOrderModalBody(order) {
        const productNames = this._concatProductNames(order.goods);
        const delivery_cost = this.calculateDeliveryCost(
            order.delivery_date,
            order.delivery_interval.split('-')[0]
        );
        const goodsCost = this.calculateProductsCost(order.goods);
        function getNameInput() {
            return `<input 
                        type="text" 
                        class="form-control" 
                        id="name" 
                        name="full_name"
                        value="${order.full_name}" 
                        required
                    >`;
        }

        function getPhoneInput() {
            return `<input 
                        type="text" 
                        class="form-control" 
                        id="phone" 
                        name="phone" 
                        value="${order.phone}" 
                        required
                    >`;
        }

        function getEmailInput() {
            return `<input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        name="email" 
                        value="${order.email}"
                        required
                    >`;
        }

        function getAddressInput() {
            return `<input 
                        type="text" 
                        class="form-control" 
                        id="address" 
                        name="delivery_address" 
                        value="${order.delivery_address}"
                        required
                    >`;

        }

        function getDateInput() {
            return `<input 
                        type="date" 
                        class="form-control" 
                        id="delivery_date" 
                        name="delivery_date" 
                        value="${order.delivery_date}"
                        required
                    >`;
        }

        function isIntervalSelected(interval) {
            return interval == order.delivery_interval ? "selected" : "";
        }

        function getTimeInput() {
            return `<select 
                        class="form-select" 
                        id="delivery_interval" 
                        name="delivery_interval" 
                        required
                    >
                        <option value="08:00-12:00" 
                            ${isIntervalSelected("08:00-12:00")}
                        >
                            Утро (08:00-12:00)
                        </option>
                        <option value="12:00-14:00"
                            ${isIntervalSelected("12:00-14:00")}
                        >
                            Полдень (12:00-14:00)
                        </option>
                        <option value="14:00-18:00"
                            ${isIntervalSelected("14:00-18:00")}
                        >
                            День (14:00-18:00)
                        </option>
                        <option value="18:00-22:00"
                            ${isIntervalSelected("18:00-22:000")}
                        >
                            Вечер (18:00-22:00)
                        </option>
                    </select>`;
        }

        function getCommentInput() {
            return `<textarea 
                        class="form-control" 
                        id="comment" 
                        name="comment" 
                        rows="3"
                    >${order.comment ?? ""}</textarea>`;
        }

        return `<div class="container">
                    <form id="order-edit-form">
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Дата оформления:
                            </div>
                            <div class="col-6">
                                ${formatDateTime(order.created_at)}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Имя:
                            </div>
                            <div class="col-6">
                                ${getNameInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Номер телефона:
                            </div>
                            <div class="col-6">
                                ${getPhoneInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Email:
                            </div>
                            <div class="col-6">
                                ${getEmailInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Адрес доставки:
                            </div>
                            <div class="col-6">
                                ${getAddressInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Дата доставки:
                            </div>
                            <div class="col-6">
                                ${getDateInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Время доставки:
                            </div>
                            <div class="col-6">
                                ${getTimeInput()}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Состав заказа:
                            </div>
                            <div class="col-6">
                                ${productNames}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Стоимость:
                            </div>
                            <div class="col-6">
                                <span id="order-modal-cost">
                                    ${delivery_cost + goodsCost}&#8381;
                                </span>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-6 fw-bold">
                                Комментарий:
                            </div>
                            <div class="col-6">
                                ${getCommentInput()}
                            </div>
                        </div>
                    </form>
                </div>`;
    }

    removeOrder(order) {
        order.container.remove();
    }

    bindRejectAction(handler) {
        this.onRejectAction = handler;
    }

    // bindViewOrder(handler) {
    //     this.onViewOrder = handler;
    // }

    bindEditOrder(handler) {
        this.onEditOrder = (order) => handler(
            order, 
            new FormData(document.forms[0])
        );
    }

    bindRemoveOrder(handler) {
        this.onRemoveOrder = handler;
    }
}

export {
    NotificationView,
    ProductView,
    CartView,
    CheckoutView,
    AccountView,
};