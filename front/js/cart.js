let cartProducts;

const allProducts = [];
const numberFormat = new Intl.NumberFormat('fr-FR');
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

async function getAllProducts() {
    await fetch('http://localhost:3000/api/products')
    .then(res => res.json())
    .then(data => {
        data.forEach(product => {
            allProducts.push(product);
        });
    });

    console.log(allProducts);
    mapThroughAllProducts();
}

function mapThroughAllProducts() {
    if(cartProducts ? 
        cartProducts.forEach(product => {
            const item = allProducts.find(x => x._id === product.id);
            
            let price = item.price;
            let formattedPrice = numberFormat.format(price);

            cartItems.innerHTML += `
                <article class="cart__item" data-id="${item._id}" data-color="${product.selectedColor}">
                    <div class="cart__item__img">
                        <img src="${item.imageUrl}" alt="${item.altTxt}">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${item.name}</h2>
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
        })    
    : displayEmptyCartMsg()); 
}

function calculateTotalQuantity() {
    let totalQuantity = 0;

    cartProducts.forEach(product => {
        totalQuantity += parseInt(product.quantity);
    });

    cartTotalQuantity.innerHTML = `${numberFormat.format(totalQuantity)}`;
}

function calculateTotalPrice(price) {
    let totalPrice = 0;

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
            const productToDelete = cartProducts.findIndex(x => x.id === productId && x.selectedColor === productColor);
            
            cartProducts.splice(productToDelete, 1);
            article.remove();
            console.log(cartProducts);

            updateLocalStorage();
            calculateTotalQuantity();
            calculateTotalPrice(price);

            if(!localStorage.getItem('cartProducts') ? 
                displayEmptyCartMsg() 
                : console.log(`Il y a encore des produits dans le panier ${ cartProducts.length }`
            ));
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

        if(cartProducts) {
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
            .then(data => {
                console.log(data);
                window.location.replace(`confirmation.html?orderId=${data.orderId}`)
            })
        }
        else {
            alert('Votre panier est vide');
        }
    });
}

getProductsFromLocalStorage();
getAllProducts();
listenToOrderButton(); 