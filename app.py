from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_url_path='')

# Dummy data for products
products = [
    {"id": 1, "name": "Product 1", "price": 10.99, "quantity": 100},
    {"id": 2, "name": "Product 2", "price": 15.99, "quantity": 50},
    {"id": 3, "name": "Product 3", "price": 5.99, "quantity": 200},
]

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory('.', 'styles.css')

@app.route('/app.js')
def js():
    return send_from_directory('.', 'app.js')

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    new_product = request.json
    new_product['id'] = max([p['id'] for p in products], default=0) + 1
    products.append(new_product)
    return jsonify(new_product), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        if 'price' in request.json:
            product['price'] = float(request.json['price'])
        if 'quantity' in request.json:
            product['quantity'] = int(request.json['quantity'])
        if 'name' in request.json:
            product['name'] = request.json['name']
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    global products
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        products = [p for p in products if p['id'] != product_id]
        return jsonify({"message": "Product deleted successfully"}), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    cart = request.json
    for item in cart:
        product = next((p for p in products if p['id'] == item['id']), None)
        if product:
            product['quantity'] -= item['quantity']
    return jsonify({"message": "Checkout successful"}), 200

if __name__ == '__main__':
    app.run(debug=True)