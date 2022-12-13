let cartProducts;
let firstNameIsValid = false;
let lastNameIsValid = false;
let addressIsValid = false;
let cityIsValid = false;
let emailIsValid = false;

const allProducts = [];
const numberFormat = new Intl.NumberFormat('fr-FR');
const cartItems = document.querySelector('#cart__items');
const cartTotalQuantity = document.querySelector('#totalQuantity');
const cartTotalPrice = document.querySelector('#totalPrice');

cartTotalQuantity.innerHTML = '0';
cartTotalPrice.innerHTML = '0';

/**
 * If there are products in local storage, get them and put them in the cartProducts array.
 */
function getProductsFromLocalStorage() {
    cartProducts = JSON.parse(localStorage.getItem('cartProducts'));
}

/**
 * If the cartProducts array is empty, remove the cartProducts item from localStorage. Otherwise,
 * update the cartProducts item in localStorage with the current cartProducts array.
 */
function updateLocalStorage() {
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

    if(cartProducts.length === 0 ? localStorage.removeItem('cartProducts') : null);
}

/**
 * Get all products from the database, then push them into the allProducts array, then call the
 * mapThroughAllProducts function.
 */
async function getAllProducts() {
    await fetch('http://localhost:3000/api/products')
    .then(res => res.json())
    .then(data => {
        data.forEach(product => {
            allProducts.push(product);
        });
    });

    mapThroughAllProducts();
}

/**
 * If the cartProducts array is not empty, map through it and insert the corresponding product in the
 * cartItems div.
 */
function mapThroughAllProducts() {
    if(cartProducts ? 
        cartProducts.forEach(product => {
            const item = allProducts.find(x => x._id === product.id);
            
            let price = item.price;
            let formattedPrice = numberFormat.format(price);
            let index = 0;

            cartItems.insertAdjacentHTML('afterbegin', 
                `<article class="cart__item" data-id="${item._id}" data-color="${product.selectedColor}">
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
                </article>`
            );

            index++;
            calculateTotalPrice(price);
            calculateTotalQuantity();
            listenToDeleteButtons(price, index);
            listenToItemQuantityInputs(price);
        })    
    : displayEmptyCartMsg()); 
}

/**
 * The function calculates the total quantity of products in the cart and displays it in the
 * cartTotalQuantity element.
 */
function calculateTotalQuantity() {
    let totalQuantity = 0;

    cartProducts.forEach(product => {
        totalQuantity += parseInt(product.quantity);
    });

    cartTotalQuantity.innerHTML = `${numberFormat.format(totalQuantity)}`;
}

/**
 * It takes the price of a product and adds it to the total price of the cart.
 * @param price - the price of the product
 */
function calculateTotalPrice(price) {
    let totalPrice = 0;

    cartProducts.forEach(product => {
        totalPrice += parseInt(price) * parseInt(product.quantity);
    });

    cartTotalPrice.innerHTML = `${numberFormat.format(totalPrice)}`;
}

/**
 * Listen to the delete buttons and delete the product from the cartProducts array, the localStorage
 * and the DOM. It also updates the total quantity and price of the cart and displays a message if
 * the cart is empty.
 * @param price - the price of the product
 * @param index - the index of the product in the cartProducts array
 */
function listenToDeleteButtons(price, index) {
    const deleteButtons = document.querySelector(`.deleteItem:nth-of-type(${index})`);

    deleteButtons.addEventListener('click', (e) => {
        e.preventDefault();

        const article = e.target.closest('article');
        const productId = article.dataset.id;
        const productColor = article.dataset.color;
        const productToDelete = cartProducts.findIndex(x => x.id === productId && x.selectedColor === productColor); // find the product to delete via its id and color
        
        cartProducts.splice(productToDelete, 1); // remove the product from the cartProducts array
        article.remove(); // remove the product from the DOM

        updateLocalStorage();
        calculateTotalQuantity();
        calculateTotalPrice(price);

        if(!localStorage.getItem('cartProducts') ?
            displayEmptyCartMsg() 
            : 
            console.log(`Il y a encore des produits dans le panier ${ cartProducts.length }`
        ));
    });
}

/**
 * It listens to the quantity inputs, if the input value is between 1 and 100, it updates the quantity
 * of the product in the cartProducts array and the localStorage. It also updates the total quantity
 * and price of the cart. Else it displays an error message.
 * @param price - the price of the product
 */
function listenToItemQuantityInputs(price) {
    const itemQuantityInputs = document.querySelectorAll('.itemQuantity');

    itemQuantityInputs.forEach(input => { 
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
                const indexOfItemToUpdate = cartProducts.findIndex(x => x.id === productId && x.selectedColor === productColor);

                console.log(cartProducts[indexOfItemToUpdate]);
                e.target.value = cartProducts[indexOfItemToUpdate].quantity;
            }
        });
    });
}

/**
 * If the cart is empty, display a message to the user.
 */
function displayEmptyCartMsg() {
    cartItems.innerHTML = `
        <h2>Votre panier est vide</h2>
    `;
}

/**
 * It listens to the order button, checks if the form is correctly filled and if the cart is not empty,
 * then it sends the order to the server. Else it displays an error message.
 */
function listenToOrderButton() {
    const orderButton = document.querySelector("#order");
    
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

        if(cartProducts.length > 0 && checkFormInputs()) {
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
                window.location.replace(`confirmation.html?orderId=${data.orderId}`)
            });

            localStorage.clear();
        }
        else {
            alert("Votre panier est vide ou vous n'avez pas rempli le formulaire correctement");
        }
    });
}

/**
 * It checks the validity of the form inputs and returns a boolean value. If the inputs are not valid,
 * it displays an error message.
 * @returns a boolean value.
 */
function checkFormInputs() {
    const inputs = document.querySelectorAll('input');

    const namesRegex = /^[a-zA-Z._-À-ÖØ-öø-ÿ\s]{2,}$/;
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
                    !namesRegex.test(e.target.value) ? 
                        (firtNameErrorMsg.innerHTML = 'Veuillez entrer un prénom valide', firstNameIsValid = false) 
                        : 
                        (firtNameErrorMsg.innerHTML = '', firstNameIsValid = true);

                    trimSplitStr(e.target);
                    break;
                case 'lastName':
                    !namesRegex.test(e.target.value) ? 
                        (lastNameErrorMsg.innerHTML = 'Veuillez entrer un nom valide', lastNameIsValid = false) 
                        : 
                        (lastNameErrorMsg.innerHTML = '', lastNameIsValid = true);

                    trimSplitStr(e.target);
                    break;
                case 'address':
                    !adressRegex.test(e.target.value) ?
                        (addressErrorMsg.innerHTML = 'Veuillez entrer une adresse valide', addressIsValid = false)
                        :
                        (addressErrorMsg.innerHTML = '', addressIsValid = true);

                    splitStr(e.target);
                    break;
                case 'city':
                    !namesRegex.test(e.target.value) ?
                        (cityErrorMsg.innerHTML = 'Veuillez entrer une ville valide', cityIsValid = false)
                        :
                        (cityErrorMsg.innerHTML = '', cityIsValid = true);

                    splitStr(e.target);
                    break;
                case 'email':
                    !emailRegex.test(e.target.value) ?
                        (emailErrorMsg.innerHTML = 'Veuillez entrer une adresse email valide', emailIsValid = false)
                        :
                        (emailErrorMsg.innerHTML = '', emailIsValid = true);

                    trimSplitStr(e.target);
                    break;
            }
        });
    });


    return firstNameIsValid && lastNameIsValid && addressIsValid && cityIsValid && emailIsValid;
}

/**
 * It takes a string, trims it, splits it, and joins it back together.
 * @param target - the target element: input 
 * @returns The return value is the value of the target.value.
 */
function trimSplitStr(target) {
    let str = target.value;
    let trimmedSplittedStr = str.trim().split(/[\s,\t,\n]+/).join(' ');
    
    return target.value = trimmedSplittedStr;
}

/**
 * It takes a string and splits it then joins it back together.
 * @param target - the target element: input
 * @returns The return value is the value of the target.value.
 */
function splitStr(target) {
    let str = target.value;
    let splittedStr = str.split(/[\s,\t,\n]+/).join(' ');
    
    return target.value = splittedStr;
}

getProductsFromLocalStorage();
getAllProducts();
listenToOrderButton(); 