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

            // insertAdjacentHTML

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

            // determine the product to delete via its id and color
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
            let inputValue = parseInt(e.target.value);

            const article = e.target.closest('article');
            const productId = article.dataset.id;
            const productColor = article.dataset.color;

            if(inputValue > 0 && inputValue <= 100) { // check if the input value is between 1 and 100
                const indexOfItemToUpdate = cartProducts.findIndex(x => x.id === productId && x.selectedColor === productColor); // find the product to update via its id and color

                cartProducts[indexOfItemToUpdate].quantity = inputValue;
                
                updateLocalStorage();
                calculateTotalQuantity();
                calculateTotalPrice(price);
            }
            else { // if the input value is not between 1 and 100, set the value to the product quantity before modification
                e.target.value = cartProducts[index].quantity;
            }

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
    
    checkFormInputs();

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

function checkFormInputs() {
    const inputs = document.querySelectorAll('input');

    const firstNameRegex = /^[a-zA-Z._-À-ÖØ-öø-ÿ\s]{3,}$/;
    const adressRegex = /^[a-zA-Z-0-9À-ÖØ-öø-ÿ._\s]{3,}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const firtNameErrorMsg = document.querySelector('#firstNameErrorMsg');
    const lastNameErrorMsg = document.querySelector('#lastNameErrorMsg');
    const addressErrorMsg = document.querySelector('#addressErrorMsg');
    const cityErrorMsg = document.querySelector('#cityErrorMsg');
    const emailErrorMsg = document.querySelector('#emailErrorMsg');


    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.preventDefault();

            switch (e.target.name) {
                case 'firstName':
                    !firstNameRegex.test(e.target.value) ? firtNameErrorMsg.innerHTML = 'Veuillez entrer un prénom valide' : firtNameErrorMsg.innerHTML = '';

                    break;
                case 'lastName':
                    !firstNameRegex.test(e.target.value) ? lastNameErrorMsg.innerHTML = 'Veuillez entrer un nom valide' : lastNameErrorMsg.innerHTML = '';

                    break;
                case 'address':
                    !adressRegex.test(e.target.value) ? addressErrorMsg.innerHTML = 'Veuillez entrer une adresse valide' : addressErrorMsg.innerHTML = '';

                    break;
                case 'city':
                    !firstNameRegex.test(e.target.value) ? cityErrorMsg.innerHTML = 'Veuillez entrer une ville valide' : cityErrorMsg.innerHTML = '';

                    break;
                case 'email':
                    !emailRegex.test(e.target.value) ? emailErrorMsg.innerHTML = 'Veuillez entrer une adresse email valide' : emailErrorMsg.innerHTML = '';
                    break;
            }
        });
    });
}

getProductsFromLocalStorage();
getAllProducts();
listenToOrderButton(); 
