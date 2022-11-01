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
    console.log(itemId);
}

function fetchStoredProductData() {
    fetch(`http://localhost:3000/api/products/${itemId}`) 
    .then(res => res.json())
    .then(data => {
        storedProduct= { 
            selectedColor: '',
            quantity: 0,
            id: data._id,
        }
    });
}

function displayProductData() { // displaying product data
    fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        product= { 
            name: data.name,
            colors: data.colors,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
        }

        console.log(data);

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
}

function removeDefaultColor() { // removing default color from color selector
    const defaultColor = itemColorSelector.options[0];

    defaultColor.remove();
}

function setDefaultQuantity() { // setting default quantity to 1
    itemQuantityInput.value = 1;
}

function pushCartProduct(cartProducts, cartProduct) { // pushing product to cart
    selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text;
    const quantityValue = parseInt(itemQuantityInput.value);

    console.log(selectedColorValue + '\n' + quantityValue);

    cartProduct.selectedColor = selectedColorValue;
    cartProduct.quantity = quantityValue;

    cartProducts.push(cartProduct);
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

function addQuantity(i, cartProducts) { // adding quantity to product in cart
    cartProducts[i].quantity = parseInt(cartProducts[i].quantity) + parseInt(itemQuantityInput.value);
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

}

function addToCart() { // adding product to cart

    const addToCartBtn = document.querySelector('#addToCart');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if(localStorage.getItem('cartProducts')) { // checking if cartProducts exists in localStorage
            let cartProducts = JSON.parse(localStorage.getItem('cartProducts'));
            let cartProduct = storedProduct;
            selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text;

            if(cartProducts.find(x => x.id == cartProduct.id && x.selectedColor == selectedColorValue)) { // checking if product is already in cart
                console.log('product already in cart, adding quantity');

                let i = cartProducts.findIndex(x => x.id == cartProduct.id); 
                let j = cartProducts.findIndex(x => x.selectedColor == selectedColorValue); 

                console.log(`i: ${i} j: ${j}`);
                
                i == j ? addQuantity(i, cartProducts) : addQuantity(j, cartProducts); // checking if product is already in cart with same color and adding quantity to the right product
                
                console.log(cartProducts[j].quantity);
            }
            else { // product is not in cart, adding product to cart
                console.log('product not in cart, adding product');

                pushCartProduct(cartProducts, cartProduct); 

                console.log(cartProducts);
            }
        }
        else { // if cartProducts doesn't exist in localStorage
            let cartProducts = [];
            let cartProduct = storedProduct;

            pushCartProduct(cartProducts, cartProduct);
        }
    
        setDefaultQuantity();
    });

}

getItemId();
fetchStoredProductData();
displayProductData();
removeDefaultColor();
setDefaultQuantity();
addToCart();