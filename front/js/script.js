let products;

const productsHtml = document.querySelector('.items');


/**
 * It fetches the data from the API, then loops through the data and creates a new object for each
 * product, then creates the HTML elements for each product and appends them to the DOM.
 */
function displayProductsData() { // displaying products data
    fetch('http://localhost:3000/api/products')
    .then(res => res.json())
    .then(data => {
        data.forEach(products => {
            product = {
                colors: products.colors,
                id: products._id,
                name: products.name,
                price: products.price,
                img: products.imageUrl,
                description: products.description,
                altTxt: products.altTxt,
            };

            const productLinkElement = document.createElement('a');
            const productArticleElement = document.createElement('article');
            const productImgElement = document.createElement('img');
            const productH3Element = document.createElement('h3');
            const productPElement = document.createElement('p');

            productLinkElement.href = `./product.html?id=${product.id}`;

            productImgElement.src = `${product.img}`; 
            productImgElement.alt = `${product.altTxt}`; 

            productH3Element.className = "productName"; 
            productH3Element.innerHTML = `${product.name}`; 

            productPElement.className = "productDescription"; 
            productPElement.innerHTML = `${product.description}`;

            productArticleElement.append(productImgElement, productH3Element, productPElement); 
            productLinkElement.append(productArticleElement);
            productsHtml.appendChild(productLinkElement); 
        });
    })
    .catch(err => console.log(err));
}

displayProductsData();