let cartProducts;

const cartItems = document.querySelector('#cart__items');
const cartTotalQuantity = document.querySelector('#totalQuantity');
const cartTotalPrice = document.querySelector('#totalPrice');

function getProductsFromLocalStorage() {
    cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

    console.log(cartProducts);
}

function updateLocalStorage() {
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

    if(cartProducts.length === 0 ? localStorage.removeItem('cartProducts') : null);
}

function mapThroughAllProducts() {
    if(cartProducts ?
        cartProducts.forEach((product, i) => {
            fetch(`http://localhost:3000/api/products/${product.id}`)
            .then(res => res.json())
            .then(data => {
                let price = data.price;
                let numberFormat = new Intl.NumberFormat('fr-FR');
                let formattedPrice = numberFormat.format(price);

                cartItems.innerHTML += `
                    <article class="cart__item" data-id="${product.id}" data-color="${product.selectedColor}">
                        <div class="cart__item__img">
                            <img src="${data.imageUrl}" alt="${data.altTxt}">
                        </div>
                        <div class="cart__item__content">
                            <div class="cart__item__content__description">
                                <h2>${data.name}</h2>
                                <p>${product.selectedColor}</p>
                                <p>${formattedPrice} €</p>
                            </div>
                            <div class="cart__item__content__settings">
                                <div class="cart__item__content__settings__quantity">
                                    <p>Qté : </p>
                                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}">
                                </div>
                                <div class="cart__item__content__settings__delete">
                                    <p class="deleteItem">Supprimer</p>
                                </div>
                            </div>
                        </div>
                    </article>
                `;

                calculateTotalPrice(price);
                calculateTotalQuantity();
                listenToDeleteButtons(price);
                listenToItemQuantityInputs(price);
            });
        }) : displayEmptyCartMsg());
}

function calculateTotalQuantity() {
    let totalQuantity = 0;

    cartProducts.forEach(product => {
        totalQuantity += parseInt(product.quantity);
    });

    cartTotalQuantity.innerHTML = totalQuantity;
}

function calculateTotalPrice(price) {
    let totalPrice = 0;
    let numberFormat = new Intl.NumberFormat('fr-FR');

    cartProducts.forEach(product => {
        totalPrice += parseInt(price) * parseInt(product.quantity);
    });

    cartTotalPrice.innerHTML = `${numberFormat.format(totalPrice)}`;
}

function listenToDeleteButtons(price) {
    const deleteButtons = document.querySelectorAll('.deleteItem');

    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
    
            const article = e.target.closest('article');
            const productId = article.dataset.id;
            const productColor = article.dataset.color;

            // determine the product to delete via its id and color and store it in a variable
            const productToDelete = cartProducts.findIndex(e => e.id === productId && e.selectedColor === productColor);
            
            cartProducts.splice(productToDelete, 1);
            article.remove();
            console.log(cartProducts);

            updateLocalStorage();
            calculateTotalQuantity();
            calculateTotalPrice(price);

            if(!localStorage.getItem('cartProducts') ? displayEmptyCartMsg() : console.log(`Il y a encore des produits dans le panier ${ cartProducts.length }`));
        });
    });
}

function listenToItemQuantityInputs(price) {
    const itemQuantityInputs = document.querySelectorAll('.itemQuantity');

    itemQuantityInputs.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            const value = e.target.value;

            cartProducts[index].quantity = parseInt(value);

            updateLocalStorage();
            calculateTotalQuantity();
            calculateTotalPrice(price);
        });
    });
}

function displayEmptyCartMsg() {
    cartItems.innerHTML = `
        <h2>Votre panier est vide</h2>
    `;
}

function listenToOrderButton() {
    const orderButton = document.queryselector("order");

    orderButton.addEventListener('click', (e) => {
        e.preventDefault();

        if(cartProducts) {
            fetch(`http://localhost:3000/api/products/order${id}`, {})
        }
    })
}

function sendOrder() {
    orderButton = document.querySelector("#order");
    
    orderButton.addEventListener('click', (e) => {
        e.preventDefault();

        const contact = {
            firstName: document.querySelector('#firstName').value,
            lastName: document.querySelector('#lastName').value,
            address: document.querySelector('#address').value,
            city: document.querySelector('#city').value,
            email: document.querySelector('#email').value
        }

        const products = [];

        cartProducts.forEach(product => {
            products.push(product.id);
        });

        console.log(products);

        fetch('http://localhost:3000/api/products/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact, products })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            window.location.replace(`confirmation.html?orderId=${data.orderId}`)
        })
    });
}


getProductsFromLocalStorage();
mapThroughAllProducts();
sendOrder(); 