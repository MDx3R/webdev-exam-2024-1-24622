class Product {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.main_category = json.main_category;
        this.sub_category = json.sub_category;
        this.image_url = json.image_url;
        this.actual_price = json.actual_price;
        this.discount_price = json.discount_price;
        this.rating = json.rating;
        this.created_at = json.created_at;
        this.container = null;
    }

    getPrice() {
        return this.discount_price ?? this.actual_price;
    }
}

class Order {
    constructor(json) {
        this.id = json.id;
        this.full_name = json.full_name;
        this.email = json.email;
        this.phone = json.phone;
        this.student_id = json.student_id;
        this.delivery_address = json.delivery_address;
        this.delivery_date = json.delivery_date;
        this.delivery_interval = json.delivery_interval;
        this.good_ids = json.good_ids;
        this.comment = json.comment;
        this.subscribe = json.subscribe;
        this.created_at = json.created_at;
        this.updated_at = json.updated_at;
        this.goods = []; // после инициализации заполняется репозиторием
        this.container = null;
    }
}

export {
    Product,
    Order,
};