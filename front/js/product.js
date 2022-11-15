let itemId;
let product;
let storedProduct;
let selectedColorValue;

const itemImg = document.querySelector('.item__img');
const itemName = document.querySelector('#title');
const itemPrice = document.querySelector('#price');
const itemDescription = document.querySelector('#description');
const itemColorSelector = document.querySelector('#colors');
const itemQuantityInput = document.querySelector('#quantity');

function getItemId (){ // getting item id from url
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    
    itemId = urlParams.get('id');

    fetchStoredProductData();

    console.log(`%cThe item id is : %c ${itemId} `, 'font-weight: bold; background-color: black', 'color: green; font-weight: bold; background-color: black;'); 
}

async function fetchStoredProductData() {
    await fetch(`http://localhost:3000/api/products/${itemId}`) 
    .then(res => res.json())
    .then(data => {
        storedProduct= { 
            selectedColor: '',
            quantity: 0,
            id: data._id,
        }
    });

    displayProductData();
}

async function displayProductData() { // displaying product data
    await fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        product= { 
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

        itemImgElement.src = `${product.img}`;
        itemImgElement.alt = `${product.altTxt}`;

        itemName.innerHTML = `${product.name}`;
        itemPrice.innerHTML = `${product.price}`;
        itemDescription.innerHTML = `${product.description}`;

        itemImg.appendChild(itemImgElement);
    })
    .catch(err => console.log(err));

    removeDefaultColor();
    setDefaultQuantity();
    listenToAddToCartButton();
}

function removeDefaultColor() { // removing default color from color selector
    const defaultColor = itemColorSelector.options[0];

    defaultColor.remove();
}

function setDefaultQuantity() { // setting default quantity to 1
    itemQuantityInput.value = 1;
}

function pushCartProduct(cartProducts, cartProduct) { // pushing product to cart
    // adding selected color and quantity to product

    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text;  // getting selected color value
    const quantityValue = parseInt(itemQuantityInput.value); // getting quantity value


    cartProduct.selectedColor = selectedColorValue; 
    cartProduct.quantity = quantityValue; 

    cartProducts.push(cartProduct);
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

    console.log(`selectedColor : ${selectedColorValue}, addedQuantity : ${quantityValue}`);
    console.log({cartProducts});
}

function addQuantity(i, cartProducts) { // adding quantity to product in cart
    cartProducts[i].quantity = parseInt(cartProducts[i].quantity) + parseInt(itemQuantityInput.value);
    
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

function listenToAddToCartButton() { // adding product to cart
    const addToCartBtn = document.querySelector('#addToCart');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if(localStorage.getItem('cartProducts') ? addProductToCart() : createLocalStorage());
    
        setDefaultQuantity();
    });
}

function addProductToCart() {
    let cartProducts = JSON.parse(localStorage.getItem('cartProducts')); // getting cartProducts from localStorage
    let cartProduct = storedProduct; // getting product from localStorage
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text; // getting selected color value

    if(cartProducts.find(x => x.id == cartProduct.id && x.selectedColor == selectedColorValue) ? productIsAlreadyInCart(cartProducts, cartProduct) : pushCartProduct(cartProducts, cartProduct)); // checking if product is already in cart
}

function createLocalStorage() {
    let cartProducts = [];
    let cartProduct = storedProduct;

    pushCartProduct(cartProducts, cartProduct);

}

function productIsAlreadyInCart(cartProducts, cartProduct) {
    console.log('product already in cart, adding quantity');

    let i = cartProducts.findIndex(x => x.id == cartProduct.id); 
    let j = cartProducts.findIndex(x => x.selectedColor == selectedColorValue); 

    console.log(`id index: ${i} selectedColorIndex: ${j}`);
    
    i == j ? addQuantity(i, cartProducts) : addQuantity(j, cartProducts); // checking if product is already in cart with same color and adding quantity to the right product
    
    console.log(cartProducts[j].quantity);
}

getItemId();