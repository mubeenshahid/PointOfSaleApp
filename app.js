document.addEventListener('DOMContentLoaded', () => {
    const posLink = document.getElementById('pos-link');
    const stockLink = document.getElementById('stock-link');
    const posSection = document.getElementById('pos-section');
    const stockSection = document.getElementById('stock-section');
    const productList = document.getElementById('product-list');
    const cart = document.getElementById('cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const stockTable = document.getElementById('stock-body');
    const addProductBtn = document.getElementById('add-product-btn');

    let products = [];
    let cartItems = [];

    // Navigation
    posLink.addEventListener('click', () => {
        posSection.style.display = 'block';
        stockSection.style.display = 'none';
    });

    stockLink.addEventListener('click', () => {
        posSection.style.display = 'none';
        stockSection.style.display = 'block';
        loadStockTable();
    });

    // Load products
    function loadProducts() {
        fetch('/api/products')
            .then(response => response.json())
            .then(data => {
                products = data;
                displayProducts();
                loadStockTable();
            });
    }

    // Display products in POS
    function displayProducts() {
        productList.innerHTML = '';
        products.forEach(product => {
            const productElem = document.createElement('div');
            productElem.className = 'product-item';
            productElem.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productList.appendChild(productElem);
        });
    }

    // Add to cart
    window.addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cartItems.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({ ...product, quantity: 1 });
            }
            updateCart();
        }
    };

    // Update cart display
    function updateCart() {
        cart.innerHTML = '';
        cartItems.forEach(item => {
            const itemElem = document.createElement('div');
            itemElem.className = 'cart-item';
            itemElem.innerHTML = `
                <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</p>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cart.appendChild(itemElem);
        });
    }

    // Remove from cart
    window.removeFromCart = (productId) => {
        cartItems = cartItems.filter(item => item.id !== productId);
        updateCart();
    };

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItems),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            cartItems = [];
            updateCart();
            loadProducts();
        });
    });

    // Load stock table
    function loadStockTable() {
        stockTable.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$<span id="price-${product.id}">${product.price.toFixed(2)}</span></td>
                <td><span id="quantity-${product.id}">${product.quantity}</span></td>
                <td>
                    <button class="edit-btn" onclick="editProduct(${product.id}, 'price')">Edit Price</button>
                    <button class="edit-btn" onclick="editProduct(${product.id}, 'quantity')">Edit Quantity</button>
                    <button class="remove-btn" onclick="removeProduct(${product.id})">Remove</button>
                </td>
            `;
            stockTable.appendChild(row);
        });
    }

    // Edit product
    window.editProduct = (productId, field) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            let newValue;
            if (field === 'price') {
                newValue = prompt(`Enter new price for ${product.name}:`, product.price);
                newValue = parseFloat(newValue);
            } else if (field === 'quantity') {
                newValue = prompt(`Enter new quantity for ${product.name}:`, product.quantity);
                newValue = parseInt(newValue);
            }

            if (newValue !== null && !isNaN(newValue)) {
                fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ [field]: newValue }),
                })
                .then(response => response.json())
                .then(updatedProduct => {
                    const index = products.findIndex(p => p.id === productId);
                    products[index] = updatedProduct;
                    if (field === 'price') {
                        document.getElementById(`price-${productId}`).textContent = updatedProduct.price.toFixed(2);
                    } else if (field === 'quantity') {
                        document.getElementById(`quantity-${productId}`).textContent = updatedProduct.quantity;
                    }
                    displayProducts();
                });
            }
        }
    };

    // Remove product
    window.removeProduct = (productId) => {
        if (confirm('Are you sure you want to remove this product?')) {
            fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadProducts();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while removing the product.');
            });
        }
    };

    // Add new product
    addProductBtn.addEventListener('click', () => {
        const name = prompt('Enter product name:');
        const price = prompt('Enter product price:');
        const quantity = prompt('Enter product quantity:');

        if (name && price && quantity) {
            fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price: parseFloat(price), quantity: parseInt(quantity) }),
            })
            .then(response => response.json())
            .then(() => {
                loadProducts();
            });
        }
    });

    // Initial load
    loadProducts();
});