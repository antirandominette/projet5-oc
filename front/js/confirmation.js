const orderId = new URLSearchParams(window.location.search).get('orderId');

/**
 * It takes the value of the const `orderId` and puts it into the HTML element.
 */
function displayOrderId() {
    const orderIdElement = document.querySelector('#orderId');
    orderIdElement.innerHTML = orderId;
}

displayOrderId();