const orderId = new URLSearchParams(window.location.search).get('orderId');

function displayOrderId() {
    const orderIdElement = document.querySelector('#orderId');
    orderIdElement.innerHTML = orderId;
}

displayOrderId();