const apiUrl = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";
const apiKey = "e3e17790-c7e0-4eb3-ac85-aa40f4715bf2";

const endpoints = {
    products: {
        list: () => `${apiUrl}/goods?api_key=${apiKey}`,
        retrive: (id) => `${apiUrl}/goods/${id}?api_key=${apiKey}`,
    },

    orders: {
        list: () => `${apiUrl}/orders?api_key=${apiKey}`,
        create: () => `${apiUrl}/orders?api_key=${apiKey}`,
        retrive: (id) => `${apiUrl}/orders/${id}?api_key=${apiKey}`,
        update: (id) => `${apiUrl}/orders/${id}?api_key=${apiKey}`,
        delete: (id) => `${apiUrl}/orders/${id}?api_key=${apiKey}`,
    }
};

async function sendRequest(url, data = null) {
    let response = await fetch(url, data);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
}

async function listProducts() {
    let response = await sendRequest(endpoints.products.list());

    return response;
}

async function getProduct(id) {
    let response = await sendRequest(endpoints.products.retrive(id));

    return response;
}


export {
    listProducts,
    getProduct,
};