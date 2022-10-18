let products;

const productsHtml = document.querySelector('.items');


function displayProductsData() {
    fetch('http://localhost:3000/api/products')
    .then(res => res.json())
    .then(data => {
        data.forEach( (product) => {
            products = {
                colors: product.colors,
                id: product._id,
                name: product.name,
                price: product.price,
                img: product.imageUrl,
                description: product.description,
                altTxt: product.altTxt,
            };


            let productLinkElement = document.createElement('a');
            let productArticleElement = document.createElement('article');
            let productImgElement = document.createElement('img');
            let productH3Element = document.createElement('h3');
            let productPElement = document.createElement('p');

            productLinkElement.href = `./product.html?id=${products.id}`;

            productImgElement.src = `${products.img}`; 
            productImgElement.alt = `${products.altTxt}`; 

            productH3Element.className = "productName"; 
            productH3Element.innerHTML = `${products.name}`; 

            productPElement.className = "productDescription"; 
            productPElement.innerHTML = `${products.description}`;

            productArticleElement.append(productImgElement, productH3Element, productPElement); 
            productLinkElement.append(productArticleElement);
            productsHtml.appendChild(productLinkElement); 
        });
    })
    .catch(err => console.log(err));
}

displayProductData();