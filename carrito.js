// ========== CONFIGURACIÓN DEL CARRITO ==========
const CART_KEY = 'waffle_cart';

// ========== FUNCIONES DEL CARRITO ==========

function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge') || document.querySelector('.cart-badge');
    if (badge) {
        const count = getCartCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ========== AÑADIR PRODUCTO AL CARRITO ==========

function addToCart(productId, productName, price, image) {
    const cart = getCart();
    const existingItem = cart.find(item => item.uniqueId === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            uniqueId: productName,
            name: productName,
            displayName: productName,
            price: price,
            image: image || 'default.jpg',
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification(`✅ ${productName} añadido al carrito`);
    return true;
}

// ========== ELIMINAR PRODUCTO DEL CARRITO ==========

function removeFromCart(uniqueId) {
    let cart = getCart();
    const index = cart.findIndex(item => item.uniqueId === uniqueId);
    
    if (index !== -1) {
        const removed = cart.splice(index, 1);
        saveCart(cart);
        showNotification(`🗑️ ${removed[0].name} eliminado del carrito`);
        return true;
    } else {
        showNotification('❌ Producto no encontrado en el carrito');
        return false;
    }
}

// ========== ACTUALIZAR CANTIDAD ==========

function updateQuantity(uniqueId, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.uniqueId === uniqueId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(uniqueId);
            return;
        }
        item.quantity = newQuantity;
        saveCart(cart);
    }
}

// ========== VACIAR CARRITO ==========

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    if (typeof renderCart === 'function') renderCart();
    showNotification('🛒 Carrito vaciado');
}

// ========== NOTIFICACIONES ==========

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #2c3e50;
        color: #fff;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== CHECKOUT ==========

function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('❌ El carrito está vacío');
        return;
    }
    
    const total = getCartTotal();
    let message = '🛒 *¡Nuevo pedido en Waffle Shop!*%0A%0A';
    message += '📦 *Detalle del pedido:*%0A';
    message += '─────────────────%0A';
    
    cart.forEach((item) => {
        const subtotal = item.price * item.quantity;
        message += `• ${item.displayName || item.name}%0A`;
        message += `  Cantidad: ${item.quantity} × $${item.price} = $${subtotal}%0A`;
    });
    
    message += '─────────────────%0A';
    message += `💰 *Total: $${total}*%0A%0A`;
    message += '👤 *Datos del cliente:*%0A';
    message += '  Nombre: %0A';
    message += '  Teléfono: %0A%0A';
    message += '¡Gracias por tu compra! 🎉';
    
    const whatsappNumber = '524427805214';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ========== FUNCIÓN PARA PRODUCTOS CON VARIANTES ==========
function addToCartWithVariants(productId, productName, productPage) {
    // Mostrar notificación
    showNotification(`⚠️ "${productName}" tiene variantes. Por favor, selecciona una opción en la página del producto.`);
    
    // Redirigir a la página del producto después de 1.5 segundos
    setTimeout(() => {
        window.location.href = productPage;
    }, 1500);
}

// ========== FUNCIÓN PARA NOTIFICACIONES ==========
function showNotification(message) {
    // Eliminar notificaciones anteriores
    document.querySelectorAll('.cart-notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #f39c12;
        color: #fff;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(243, 156, 18, 0.4);
        z-index: 9999;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        border-left: 4px solid #e67e22;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// ========== INICIALIZAR ==========

document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    console.log('🛒 Carrito inicializado');
});

// Hacer funciones globales
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.getCart = getCart;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.checkout = checkout;
