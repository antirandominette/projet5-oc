let itemId;
let product;

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

function displayProductData() { // displaying product data
    fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        product= { 
            colors: data.colors,
            selectedColor: '',
            id: data._id,
            name: data.name,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
            quantity: 0,
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

        itemName.innerHTML = `${product.name}`;
        itemPrice.innerHTML = `${product.price}`;
        itemDescription.innerHTML = `${product.description}`;

        itemImg.appendChild(itemImgElement);
    })
    .catch(err => console.log(err));
}

function pushCartProduct(cartProducts, cartProduct) { // pushing product to cart
    const selectedColorValue = itemColorSelector.options[itemColorSelector.selectedIndex].text;
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
            let cartProduct = product;

            if(cartProducts.find(x => x.id == cartProduct.id)) { // checking if product is already in cart
                console.log('product already in cart, adding quantity');

                let i = cartProducts.findIndex(x => x.id == cartProduct.id);
                addQuantity(i, cartProducts); // adding quantity to product in cart

                console.log(cartProducts[i].quantity);
            }
            else { // product is not in cart, adding product to cart
                console.log('product not in cart, adding product');

                pushCartProduct(cartProducts, cartProduct); 

                console.log(cartProducts);
            }
        }
        else { // if cartProducts doesn't exist in localStorage
            let cartProducts = [];
            let cartProduct = product;

            pushCartProduct(cartProducts, cartProduct);
        }
    })
}

getItemId();
displayProductData();
addToCart();