let itemId; 
let product;

const itemImg = document.querySelector('.item__img'); // selecting .item__img container
const itemName = document.querySelector('#title'); // selecting #title element
const itemPrice = document.querySelector('#price'); // selecting #price element
const itemDescription = document.querySelector('#description'); // selecting #description element
const itemColorSelector = document.querySelector('#colors'); // selecting #colors selector

function getItemId (){ // getting item id from url
    const url = window.location.search; // getting url
    const urlParams = new URLSearchParams(url); // creating urlParams object
    
    itemId = urlParams.get('id'); // getting id value from urlParams object and storing it in itemId variable
    console.log(itemId);
}

function displayProductData() { // displaying product data
    fetch(`http://localhost:3000/api/products/${itemId}`) // fetching product data
    .then(res => res.json())
    .then(data => {
        product= { // creating product object
            colors: data.colors,
            id: data._id,
            name: data.name,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
            quantity: null,
        }

        console.log(data);

        let itemImgElement = document.createElement('img'); // creating item image element

        for (let i = 0; i < product.colors.length; i++) { // looping through colors array to create color options
            let itemColorOption = document.createElement('option'); // creating option element
            
            itemColorOption.innerHTML = `${product.colors[i]}`; // adding name of color to option element
            itemColorOption.value = `${product.colors[i]}`; // setting value of option element to color name

            itemColorSelector.appendChild(itemColorOption); // appending option element to color selector
        }

        itemImgElement.src = `${product.img}`; // setting src of item image element to product image url

        itemName.innerHTML = `${product.name}`; // setting innerHTML of item name element to product name
        itemPrice.innerHTML = `${product.price}`; // setting innerHTML of item price element to product price
        itemDescription.innerHTML = `${product.description}`; // setting innerHTML of item description element to product description

        itemImg.appendChild(itemImgElement); // appending item image element to item__img container
    })
    .catch(err => console.log(err));
}

function pushCartProduct(cartProducts, cartProduct) { // pushing product to cartProducts array
    cartProducts.push(cartProduct);
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts)); // updating cartProducts in localStorage
}

function addQuantity(i, cartProducts) { // adding quantity to product in cart
    cartProducts[i].quantity++;
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts)); // updating cartProducts in localStorage
}

function addToCart() { // adding product to cart
    const addToCartBtn = document.querySelector('#addToCart'); // selecting #addToCart button
    addToCartBtn.addEventListener('click', (e) => { // adding event listener to #addToCart button
        e.preventDefault(); // preventing default behaviour of #addToCart button

        if(localStorage.getItem('cartProducts')) { // checking if cartProducts exists in localStorage
            let cartProducts = JSON.parse(localStorage.getItem('cartProducts')); // getting cartProducts from localStorage
            let cartProduct = product; // creating cartProduct object

            if(cartProducts.find(x => x.id == cartProduct.id)) { // checking if product is already in cart by checkin if product id is in cartProducts array
                console.log('product already in cart, adding quantity');

                let i = cartProducts.findIndex(x => x.id == cartProduct.id); // finding index of product found in cartProducts array
                addQuantity(i, cartProducts); // adding quantity to product in cart

                console.log(cartProducts[i].quantity);
            }
            else { // if product is not in cart
                console.log('product not in cart, adding product');

                pushCartProduct(cartProducts, cartProduct); // pushing product to cartProducts array

                console.log(cartProducts);
            }
        }
        else { // if cartProducts does not exist in localStorage
            let cartProducts = []; // creating cartProducts array
            let cartProduct = product; // creating cartProduct object

            pushCartProduct(cartProducts, cartProduct); // pushing product to cartProducts array
        }
    })
}

// calling functions
getItemId();
displayProductData();
addToCart(); 