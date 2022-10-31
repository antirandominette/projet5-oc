let cartProducts;

const cartItems = document.querySelector('#cart__items');
const cartTotalQuantity = document.querySelector('#totalQuantity');
const cartTotalPrice = document.querySelector('#totalPrice');

function getProductsFromLocalStorage() {
    cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

    console.log(cartProducts);
}

function updateLocalStorage() {
    localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

function renderArticleElement() {
    cartProducts.forEach(product => {
        const cartArticle = document.createElement('article');
        const cartItemImgDiv = document.createElement('div');
        const cartItemImg = document.createElement('img');
        const cartItemContentDiv = document.createElement('div');
        const cartItemContentDescriptionDiv = document.createElement('div');
        const cartItemName = document.createElement('h2');
        const cartItemColorName = document.createElement('p');
        const cartItemPrice = document.createElement('p');
        const cartItemContentSettingsDiv = document.createElement('div');
        const cartItemContentSettingsQuantityDiv = document.createElement('div');
        const cartItemQuantityP = document.createElement('p');
        const cartItemQuantity = document.createElement('input');
        const cartItemContentSettingsRemoveDiv = document.createElement('div');
        const cartItemRemoveP = document.createElement('p');


        cartArticle.classList.add('cart__item');
        cartArticle.dataset.id = product.id;
        cartArticle.dataset.color = product.selectedColor;
        
        cartItemImgDiv.classList.add('cart__item__img');
        
        cartItemImg.src = product.img;
        cartItemImg.alt = product.altTxt;

        cartItemContentDiv.classList.add('cart__item__content');

        cartItemContentDescriptionDiv.classList.add('cart__item__content__description');

        cartItemName.innerHTML = product.name;

        cartItemColorName.innerHTML = product.selectedColor;

        cartItemPrice.innerHTML = `${product.price} €`;

        cartItemContentSettingsDiv.classList.add('cart__item__content__settings');

        cartItemContentSettingsQuantityDiv.classList.add('cart__item__content__settings__quantity');

        cartItemQuantityP.innerHTML = 'Qté : ';

        cartItemQuantity.type = 'number';
        cartItemQuantity.classList.add('item__quantity');
        cartItemQuantity.name = 'itemQuantity';
        cartItemQuantity.min = '1';
        cartItemQuantity.max = '100';
        cartItemQuantity.value = product.quantity;

        cartItemContentSettingsRemoveDiv.classList.add('cart__item__content__settings__delete');

        cartItemRemoveP.classList.add('deleteItem');
        cartItemRemoveP.innerHTML = 'Supprimer';

        cartItems.append(cartArticle);
        cartArticle.append(cartItemImgDiv, cartItemContentDiv);
        cartItemImgDiv.append(cartItemImg);
        cartItemContentDiv.append(cartItemContentDescriptionDiv, cartItemContentSettingsDiv);
        cartItemContentDescriptionDiv.append(cartItemName, cartItemColorName, cartItemPrice);
        cartItemContentSettingsDiv.append(cartItemContentSettingsQuantityDiv, cartItemContentSettingsRemoveDiv);
        cartItemContentSettingsQuantityDiv.append(cartItemQuantityP, cartItemQuantity);
        cartItemContentSettingsRemoveDiv.append(cartItemRemoveP);
    });

    calculateTotalQuantity();
    calculateTotalPrice();
    listenToDeleteButtons();
    listenToItemQuantityInputs();
}

function calculateTotalQuantity() {
    let totalQuantity = 0;

    cartProducts.forEach(product => {
        totalQuantity += parseInt(product.quantity);
    });

    cartTotalQuantity.innerHTML = totalQuantity;
}

function calculateTotalPrice() {
    let totalPrice = 0;
    let numberFormat = new Intl.NumberFormat('fr-FR');

    cartProducts.forEach(product => {
        totalPrice += parseInt(product.price) * parseInt(product.quantity);
    });

    cartTotalPrice.innerHTML = `${numberFormat.format(totalPrice)}`;
}

function listenToDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.deleteItem');

    deleteButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
    
            const article = e.target.closest('article');
    
            article.remove();
            cartProducts.splice(index, 1);

            updateLocalStorage();
            calculateTotalQuantity();
            calculateTotalPrice();
        });
    });
}

function listenToItemQuantityInputs() {
    const itemQuantityInputs = document.querySelectorAll('.item__quantity');

    itemQuantityInputs.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            const value = e.target.value;

            cartProducts[index].quantity =parseInt(value);

            updateLocalStorage();
            calculateTotalQuantity();
            calculateTotalPrice();
        });
    });
}

getProductsFromLocalStorage();
renderArticleElement();