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
}

export {
    Product,
};