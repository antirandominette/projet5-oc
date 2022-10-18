let itemId;
let product;

const itemImg = document.querySelector('.item__img');
const itemName = document.querySelector('#title');
const itemPrice = document.querySelector('#price');
const itemDescription = document.querySelector('#description');
const itemColorSelector = document.querySelector('#colors');

function getItemId (){
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    
    itemId = urlParams.get('id');
    console.log(itemId);
}

function displayProductData() {
    fetch(`http://localhost:3000/api/products/${itemId}`)
    .then(res => res.json())
    .then(data => {
        product= {
            colors: data.colors,
            id: data._id,
            name: data.name,
            price: data.price,
            img: data.imageUrl,
            description: data.description,
            altTxt: data.altTxt,
        }
        console.log(data);

        let productImgElement = document.createElement('img');

        for (let i = 0; i < product.colors.length; i++) {
            let productColorOption = document.createElement('option');
            
            productColorOption.innerHTML = `${product.colors[i]}`;
            productColorOption.value = `${product.colors[i]}`;

            itemColorSelector.appendChild(productColorOption);
        }

        productImgElement.src = `${product.img}`;

        itemName.innerHTML = `${product.name}`;
        itemPrice.innerHTML = `${product.price}`;
        itemDescription.innerHTML = `${product.description}`;

        itemImg.appendChild(productImgElement);
    })
    .catch(err => console.log(err));
}

function addToCart() {
    const addToCartBtn = document.querySelector('#addToCart');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('add to cart');

        
    })
}

getItemId();
displayProductData();
addToCart();