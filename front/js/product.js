let itemId;
let product;
let productInfos;
let selectedColorValue;

const pageTitle = document.querySelector('title');
const itemImg = document.querySelector('.item__img');
const itemName = document.querySelector('#title');
const itemPrice = document.querySelector('#price');
const itemDescription = document.querySelector('#description');
const itemColorSelector = document.querySelector('#colors');
const itemQuantityInput = document.querySelector('#quantity');
const addItemMsgContainer = document.createElement('div');
const addItemMsg = document.createElement('p');
const quantityErrorMsg = document.createElement('p');
const addItemContainerDefaultStyle = "position: absolute; padding: 0 10px; top: 110%; background: transparent; width: fit-content; height: fit-content; opacity: 0; transition: opacity 0.5s ease-in-out; text-align: center;";

/**
 * The function gets the item id from the url and then call displayProductData().
 */
function getItemId (){
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    
    itemId = urlParams.get('id');

    displayProductData();

    console.log(`%cThe item id is : %c ${itemId} `, 'font-weight: bold; background-color: black', 'color: green; font-weight: bold; background-color: black;'); 
}


/**
 * It fetches product data from the database, loops through the colors array to create color options, and then displays the data.
 */
async function displayProductData() { 
    await fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        productInfos = { // this will be stored in localStorage
            selectedColor: '',
            quantity: 0,
            id: data._id,
        }
        
        product= { // this will be used to display the data
            name: data.name,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
            colors: data.colors,
        }

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

/**
 * If there is a local storage item called 'cartProducts', call addProductToCart(), otherwise call createLocalStorage().
 */
function listenToAddToCartButton() { 
    const addToCartBtn = document.querySelector('#addToCart');

    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if(localStorage.getItem('cartProducts') ? addProductToCart() : createLocalStorage());

        itemQuantityInput.value = 1; // resetting quantity input value
        quantityErrorMsg.style.display = 'none'; // hiding quantity error message
    });
}

/**
 * If the product is already in the cart, call productIsAlreadyInCart(), otherwise call pushCartProductToLocalStorage().
 */
function addProductToCart() {
    let cartProducts = JSON.parse(localStorage.getItem('cartProducts')); // getting cartProducts from localStorage
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text; // getting selected color value
    
    // checking if product is already in cart
    (cartProducts.find(x => x.id == productInfos.id && x.selectedColor == selectedColorValue) ? 
        productIsAlreadyInCart(cartProducts) 
        : 
        pushCartProductToLocalStorage(cartProducts)
    ); 
}

/**
 * This function creates a local storage object called cartProducts and pushes it to the local storage.
 */
function createLocalStorage() {
    let cartProducts = [];

    pushCartProductToLocalStorage(cartProducts);
}

/**
 * If the product is already in the cart, then add the quantity of the product.
 * 
 * @param cartProducts - array of objects
 */
function productIsAlreadyInCart(cartProducts) {
    let i = cartProducts.findIndex(x => x.id == productInfos.id && x.selectedColor == selectedColorValue); // getting index of product in cartProducts

    addQuantity(i, cartProducts);
}

/** Get the selectedColorValue, creates a variable to store the inputQuantity value.
    Check if quantityValue is valid and if a color is selected.
    If so, push the productInfos object to cartProducts and update localStorage.
    If not, display an error message in console.
 **/
function pushCartProductToLocalStorage(cartProducts) { 
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text; 
    const quantityValue = parseInt(itemQuantityInput.value); 

    if(checkIfQuantityIsValid(quantityValue) && checkIfColorIsSelected(selectedColorValue)) {
        productInfos.selectedColor = selectedColorValue; 
        productInfos.quantity = quantityValue; 
        cartProducts.push(productInfos);

        updateLocalStorage(cartProducts);
        displayItemAddedForTheFirstTimeMsg();
    }
    else {
        console.log(`quantity and/or selectedColor are invalid : ${quantityValue}, ${selectedColorValue}`);
    }
}

/**
 * If the input quantity is valid and the total quantity is > 0 and <= 100, update the local storage, and display
 * the item added message. Otherwise, if the input quantity is valid and the total quantity > 100 display QuantityIsTooMuchMsg. 
 * Otherwise if the quantity is < 1, display QuantityIsTooLowMsg.
 * 
 * @param i - the index of the product in the cartProducts array
 * @param cartProducts - an array of objects that contains the product information
 */
function addQuantity(i, cartProducts) { 
    const inputQuantity = parseInt(itemQuantityInput.value);
    const totalQuantity = cartProducts[i].quantity + inputQuantity;

    switch(true) {
        case (checkIfQuantityIsValid(inputQuantity) && (totalQuantity > 0 && totalQuantity <= 100)):
            cartProducts[i].quantity = parseInt(cartProducts[i].quantity) + parseInt(itemQuantityInput.value);
            updateLocalStorage(cartProducts);
            displayItemAddedMsg(i, cartProducts);
            break;
        case (checkIfQuantityIsValid(inputQuantity) && (totalQuantity > 100)):
            displayItemQuantityIsTooMuchMsg(i, cartProducts);
            break;
        default:
            displayItemQuantityIsTooLowMsg(i, cartProducts);
            break;
    }
}

/**
 * It takes an array of objects and converts it to a string, then stores it in local storage.
 * 
 * @param cartProducts - The array of products in the cart.
 */
function updateLocalStorage(cartProducts) {
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

/**
 * Check if the quantity is valid by checking if it's greater than 0 and less than or equal to 100.
 * 
 * @param quantity - The quantity of the item you want to buy.
 * @returns a boolean value.
 */
function checkIfQuantityIsValid(quantity) {
    return (quantity > 0 && quantity <= 100);
}

/**
 * If the selected color is not equal to the default value, then return true, otherwise return false.
 * 
 * @param selectedColor - the color that the user has selected
 * @returns the result of the comparison between the selectedColor and the string '--SVP, choisissez
 * une couleur --'.
 */
function checkIfColorIsSelected(selectedColor) {
    return (selectedColor != '--SVP, choisissez une couleur --');
}

/**
 * If the color is not selected, display the error message, otherwise hide it. If the quantity is less
 * than 1 or greater than 100, display the error message, otherwise hide it.
 */
function displayErrorMsgs() { 
    const colorOptionsDiv = document.querySelector('.item__content__settings__color'); 
    const quantityInputDiv = document.querySelector('.item__content__settings__quantity');
    const colorErrorMsg = document.createElement('p'); 

    colorErrorMsg.innerHTML = `Veuillez choisir une couleur`; 
    colorErrorMsg.style.cssText = "color: #fbb4cc; font-size: 1.2rem; display: block;";
    colorOptionsDiv.appendChild(colorErrorMsg);

    quantityErrorMsg.innerHTML = `Veuillez entrer un nombre entre 1 et 100`;
    quantityInputDiv.appendChild(quantityErrorMsg);
    quantityErrorMsg.style.cssText = "color: #fbb4cc; font-size: 1.2rem; display: none;"; // message is showing by default so we hide it

    itemColorSelector.addEventListener('change', (e) => { // displaying error message if color is not selected
        ((e.target.value == '') ? colorErrorMsg.style.display = 'block': colorErrorMsg.style.display = 'none');
    });

    ['keyup', 'change'].forEach((event) => {
        itemQuantityInput.addEventListener(event, (element) => { 
            ((element.target.value < 1 || element.target.value > 100) ? quantityErrorMsg.style.display = 'block' : quantityErrorMsg.style.display = 'none');
        });
    });
}

/**
 * Creates the container of the message that will be displayed when the user adds an item to the cart
 */
function createAddItemMsg() {
    const addButtonContainer = document.querySelector('.item__content__addButton');

    addItemMsgContainer.classList.add('addItemMsgContainer');
    addItemMsgContainer.style.cssText = addItemContainerDefaultStyle;
    addItemMsgContainer.appendChild(addItemMsg);
    
    addButtonContainer.appendChild(addItemMsgContainer);
    addButtonContainer.style.cssText = "position: relative;";
}

/**
 * If the quantity of the product is greater than 1, display the message with the quantity of the
 * product in the cart, otherwise display the message without the quantity of the product in the cart.
 * 
 * @param i - the index of the product in the cartProducts array
 * @param cartProducts - the array of objects that contains the products in the cart
 */
function displayItemAddedMsg(i, cartProducts) {
    cartProducts[i].quantity > 1 ? 
        addItemMsg.innerHTML = `Vous avez ajouté ${itemQuantityInput.value} exemplaire(s) à votre panier !</br> Vous avez ${cartProducts[i].quantity} exemplaire(s) dans votre panier.` 
        : 
        addItemMsg.innerHTML = `Vous avez ajouté ${itemQuantityInput.value} exemplaire(s) à votre panier !`;
    
    setTimeout(() => {
        addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 1;`;

        setTimeout(() => {
            addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 0;`;
        }, 2000);
    }, 100);  
}

/**
 * If the quantity of the item to be added to the cart is greater than the quantity of the item in
 * stock, display a message to the user.
 * 
 * The function is called in the following code:
 * @param i - the index of the product in the cartProducts array
 * @param cartProducts - the array of objects that contains the products in the cart
 */
function displayItemQuantityIsTooMuchMsg(i, cartProducts) {
    addItemMsg.innerHTML = `Ajouter ${itemQuantityInput.value} dépasserait la quantité maximale autorisée. </br> Vous avez ${cartProducts[i].quantity} exemplaire(s) dans votre panier.`;

    setTimeout(() => {
        addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 1;`;

        setTimeout(() => {
            addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 0;`;
        }, 4000);
    }, 100);  
}

/**
 * If the quantity of the item in the cart is less than the quantity of the item the user wants to add,
 * display a message saying that the quantity of the item the user wants to add is too high.
 * 
 * @param i - the index of the product in the cartProducts array
 * @param cartProducts - the array of objects that contains the products in the cart
 */
function displayItemQuantityIsTooLowMsg(i, cartProducts) {
    addItemMsg.innerHTML = `Ajouter ${itemQuantityInput.value} dépasserait la quantité minimale autorisée. </br> Vous avez ${cartProducts[i].quantity} exemplaire(s) dans votre panier.`;

    setTimeout(() => {
        addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 1;`;

        setTimeout(() => {
            addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 0;`;
        }, 4000);
    }, 100);  
}

/**
 * When the user clicks on the add to cart button, the function displays a message that says "You have
 * added X item(s) to your cart" and then fades out the message after 2 seconds.
 */
function displayItemAddedForTheFirstTimeMsg() {
    addItemMsg.innerHTML = `Vous avez ajouté ${itemQuantityInput.value} exemplaire(s) à votre panier !`;

    setTimeout(() => {
        addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 1;`;

        setTimeout(() => {
            addItemMsgContainer.style.cssText = `${addItemContainerDefaultStyle} opacity: 0;`;
        }, 2000);
    }, 100);  
}

getItemId();
displayErrorMsgs();
createAddItemMsg();