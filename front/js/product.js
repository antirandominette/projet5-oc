let itemId;
let product;
let storedProduct;
let selectedColorValue;

const pageTitle = document.querySelector('title');
const itemImg = document.querySelector('.item__img');
const itemName = document.querySelector('#title');
const itemPrice = document.querySelector('#price');
const itemDescription = document.querySelector('#description');
const itemColorSelector = document.querySelector('#colors');
const itemQuantityInput = document.querySelector('#quantity');
const confirmationMsgContainer = document.createElement('div');
const defaultStyle = "position: absolute; padding: 0 10px; top: 110%; background: transparent; width: fit-content; height: fit-content; opacity: 0; transition: opacity 0.5s ease-in-out;";
const confirmationMsg = document.createElement('p');

function getItemId (){ // getting item id from url
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    
    itemId = urlParams.get('id');

    displayProductData();

    console.log(`%cThe item id is : %c ${itemId} `, 'font-weight: bold; background-color: black', 'color: green; font-weight: bold; background-color: black;'); 
}

async function displayProductData() { // displaying product data
    await fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        storedProduct = { // create object that will be stored in localStorage
            selectedColor: '',
            quantity: 0,
            id: data._id,
        }
        
        product= { // creating product object to display data
            name: data.name,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
            colors: data.colors,
        }

        console.log(`%cThe product data is : `, 'font-weight: bold; background-color: black; color: orange;'); // displaying product data in console
        console.table(product);

        let itemImgElement = document.createElement('img');

        for (let i = 0; i < product.colors.length; i++) { // looping through product colors to create color options
            let itemColorOption = document.createElement('option');
            
            itemColorOption.innerHTML = `${product.colors[i]}`;
            itemColorOption.value = `${product.colors[i]}`;

            itemColorSelector.appendChild(itemColorOption);
        }

        pageTitle.innerHTML = `${product.name}`;

        itemImgElement.src = `${product.img}`;
        itemImgElement.alt = `${product.altTxt}`;

        itemName.innerHTML = `${product.name}`;
        itemPrice.innerHTML = `${product.price}`;
        itemDescription.innerHTML = `${product.description}`;

        itemImg.appendChild(itemImgElement);
    })
    .catch(err => console.log(err));

    listenToAddToCartButton();
}

function listenToAddToCartButton() { // adding product to cart
    const addToCartBtn = document.querySelector('#addToCart');

    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if(localStorage.getItem('cartProducts') ? addProductToCart() : createLocalStorage());

        itemQuantityInput.value = 1; // resetting quantity input value
    });
}

function addProductToCart() {
    let cartProducts = JSON.parse(localStorage.getItem('cartProducts')); // getting cartProducts from localStorage
    let cartProduct = storedProduct; // getting product from localStorage
    
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text; // getting selected color value

    // checking if product is already in cart
    (cartProducts.find(x => x.id == cartProduct.id && x.selectedColor == selectedColorValue) ? 
        productIsAlreadyInCart(cartProducts, cartProduct) 
        : 
        pushCartProductToLocalStorage(cartProducts, cartProduct)
    ); 
}

function createLocalStorage() {
    let cartProducts = [];
    let cartProduct = storedProduct;

    pushCartProductToLocalStorage(cartProducts, cartProduct);
}

function productIsAlreadyInCart(cartProducts, cartProduct) {
    let i = cartProducts.findIndex(x => x.id == cartProduct.id); // getting index of product in cart
    let j = cartProducts.findIndex(x => x.selectedColor == selectedColorValue); // getting index of selectedColor in cart
    
    i == j ? addQuantity(i, cartProducts) : addQuantity(j, cartProducts); // checking if product is already in cart with same color and adding quantity to the right product
    
    console.log(`Quantity for ${cartProducts[j].id} in ${cartProducts[j].selectedColor} : ${cartProducts[j].quantity}`);
}

function pushCartProductToLocalStorage(cartProducts, cartProduct) { // pushing product to cart
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text;  // getting selected color value
    const quantityValue = parseInt(itemQuantityInput.value); // getting quantity value

    if(checkIfQuantityIsValid(quantityValue) && checkIfColorIsSelected(selectedColorValue)) { // checking if quantity is between 1 and 100 and if a color is selected
        cartProduct.selectedColor = selectedColorValue; 
        cartProduct.quantity = quantityValue; 
        cartProducts.push(cartProduct);

        localStorage.setItem('cartProducts', JSON.stringify(cartProducts)); // pushing product to localStorage

        displayConfirmationMsg();
    }
    else {
        console.log(`quantity and/or selectedColor are invalid : ${quantityValue}, ${selectedColorValue}`);
    }
}

function addQuantity(i, cartProducts) { // adding quantity to product in cart
    const inputQuantity = parseInt(itemQuantityInput.value);
    const totalQuantity = cartProducts[i].quantity + inputQuantity;

    if(checkIfQuantityIsValid(inputQuantity) && (totalQuantity > 0 && totalQuantity <= 100)) { 
        cartProducts[i].quantity = parseInt(cartProducts[i].quantity) + parseInt(itemQuantityInput.value);
    
        localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
        displayConfirmationMsg();
    }
    else {
        console.log(`quantity limit reached, you are trying to add : ${inputQuantity}`);
    }
}

function checkIfQuantityIsValid(quantity) {
    return (quantity > 0 && quantity <= 100);
}

function checkIfColorIsSelected(selectedColor) {
    return (selectedColor != '--SVP, choisissez une couleur --');
}

function displayErrorMsgs() { // displaying error messages
    const colorOptionsDiv = document.querySelector('.item__content__settings__color'); 
    const quantityInputDiv = document.querySelector('.item__content__settings__quantity');
    const colorErrorMsg = document.createElement('p'); 
    const quantityErrorMsg = document.createElement('p');

    colorErrorMsg.innerHTML = `Veuillez choisir une couleur`; 
    colorOptionsDiv.appendChild(colorErrorMsg);

    quantityErrorMsg.innerHTML = `Veuillez entrer un nombre entre 1 et 100`;
    quantityInputDiv.appendChild(quantityErrorMsg);
    quantityErrorMsg.style.display = 'none'; // message is showing by default so we hide it

    itemColorSelector.addEventListener('change', (e) => { // displaying error message if color is not selected
        ((e.target.value == '') ? colorErrorMsg.style.display = 'block': colorErrorMsg.style.display = 'none');
    });

    itemQuantityInput.addEventListener('change', (e) => { // displaying error message if quantity is not between 1 and 100
        ((e.target.value < 1 || e.target.value > 100) ? quantityErrorMsg.style.display = 'block' : quantityErrorMsg.style.display = 'none');
    });
}

function createConfirmationMsg() {
    const addButtonContainer = document.querySelector('.item__content__addButton');

    confirmationMsgContainer.classList.add('confirmationMsgContainer');
    confirmationMsgContainer.style.cssText = defaultStyle;
    confirmationMsgContainer.appendChild(confirmationMsg);
    
    addButtonContainer.appendChild(confirmationMsgContainer);
    addButtonContainer.style.cssText = "position: relative;";
}

function displayConfirmationMsg() {
    confirmationMsg.innerHTML = `Vous avez ajouté ${itemQuantityInput.value} exemplaire(s) à votre panier !`;

    setTimeout(() => {
        confirmationMsgContainer.style.cssText = `${defaultStyle} opacity: 1;`;

        setTimeout(() => {
            confirmationMsgContainer.style.cssText = `${defaultStyle} opacity: 0;`;
        }, 2000);
    }, 100);  
}

getItemId();
displayErrorMsgs();
createConfirmationMsg();
