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


// ========== FUNCIÓN PARA PRODUCTOS CON VARIANTES ==========
function addToCartWithVariants(productId, productName, productPage) {
    // Mostrar notificación
    showNotification(`⚠️ "${productName}" tiene variantes. Por favor, selecciona una opción en la página del producto.`);
    
    // Redirigir a la página del producto después de 1.5 segundos
    setTimeout(() => {
        window.location.href = productPage;
    }, 1500);
}



// ========== CONFIGURACIÓN DE PUNTOS DE ENTREGA ==========

const PUNTOS_ENTREGA = [
    {
        id: 1,
        nombre: "Aurrera Peñaflor",
        direccion: "Blvd Quintana Arrioja 4201, Ciudad del Sol, 76116 Santiago de Querétaro, Qro.",
        horarios: ["11:30 AM", "12:00 PM", "12:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"],
        diasDisponibles: [1, 3, 5] // Lunes, Miércoles, Viernes
    },
    {
        id: 2,
        nombre: "Aurrera Satélite",
        direccion: "Av. de la Luz 401, Santa Ana, Cosmos, 76110 Santiago de Querétaro, Qro.",
        horarios: ["11:30 AM", "12:00 PM", "12:30 PM"],
        diasDisponibles: [1, 3, 5]
    },
    {
        id: 3,
        nombre: "Sendero",
        direccion: "Av. Sur #789, Querétaro",
        horarios: ["11:30 AM", "12:00 PM", "12:30 PM"],
        diasDisponibles: [1, 3, 5]
    },
    {
        id: 4,
        nombre: "La Comer Juriquilla",
        direccion: "Blvd. Universitario 405, 76230 Juriquilla, Qro.",
        horarios: ["10:00 AM", "10:30 AM", "11:30 AM", "12:00 PM", "12:30 PM", "5:00 PM", "5:30 PM"],
        diasDisponibles: [2, 4] // Martes, Jueves
    },
    {
        id: 5,
        nombre: "Plaza de las Américas",
        direccion: "Av. Constituyentes Ote. 183, Plaza de las Americas, 76050 Santiago de Querétaro, Qro.",
        horarios: ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"],
        diasDisponibles: [6] // Sábado
    }
];

// ========== VARIABLES DE SELECCIÓN ==========
let selectedPoint = null;
let selectedDay = null;
let selectedSchedule = null;

// ========== NOMBRES DE LOS DÍAS ==========
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// ========== FUNCIÓN PARA OBTENER PRÓXIMOS DÍAS ==========

function getNextDays(count = 14) {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i < count; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        days.push({
            dayOfWeek: date.getDay(),
            date: date,
            display: `${DIAS_SEMANA[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
        });
    }
    
    return days;
}

// ========== FUNCIÓN PARA RENDERIZAR OPCIONES DE DÍAS ==========

function renderDayOptions(punto) {
    const container = document.getElementById('dayOptions');
    if (!container) return;

    const nextDays = getNextDays(14);
    let html = '';

    nextDays.forEach((day, index) => {
        const isAvailable = punto.diasDisponibles.includes(day.dayOfWeek);
        const isToday = index === 0;
        const dayName = day.display;
        const escapedDayName = dayName.replace(/'/g, "\\'");
        
        html += `
            <button class="day-btn ${isAvailable ? '' : 'disabled'}" 
                    data-day="${day.dayOfWeek}" 
                    data-date="${day.date.toISOString()}" 
                    data-index="${index}"
                    onclick="${isAvailable ? `selectDay('${escapedDayName}', ${index})` : ''}"
                    ${!isAvailable ? 'disabled' : ''}>
                <span class="day-name">${DIAS_SEMANA[day.dayOfWeek]}</span>
                <span class="day-date">${day.date.getDate()}/${day.date.getMonth() + 1}</span>
                ${isToday ? ' <span style="font-size:0.7rem;color:#f8aa0f;">(Hoy)</span>' : ''}
            </button>
        `;
    });

    container.innerHTML = html;
}

// ========== FUNCIÓN PARA SELECCIONAR DÍA ==========

function selectDay(dayDisplay, index) {
    selectedDay = dayDisplay;
    
    const buttons = document.querySelectorAll('.day-btn:not(.disabled)');
    buttons.forEach((btn, i) => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.index) === index) {
            btn.classList.add('active');
        }
    });

    const scheduleSection = document.getElementById('scheduleSection');
    if (scheduleSection) {
        scheduleSection.style.display = 'block';
    }
    renderScheduleOptions(selectedPoint);
    updateDeliverySummary();
}

// ========== FUNCIÓN PARA RENDERIZAR HORARIOS ==========

function renderScheduleOptions(punto) {
    const container = document.getElementById('scheduleOptions');
    if (!container) return;

    container.innerHTML = '';

    let html = '';
    punto.horarios.forEach((horario, index) => {
        const escapedHorario = horario.replace(/'/g, "\\'");
        html += `
            <button class="schedule-btn" onclick="selectSchedule('${escapedHorario}', ${index})">
                ${horario}
            </button>
        `;
    });

    container.innerHTML = html;
}

// ========== FUNCIÓN PARA SELECCIONAR HORARIO ==========

function selectSchedule(horario, index) {
    selectedSchedule = horario;
    
    const buttons = document.querySelectorAll('.schedule-btn');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    updateDeliverySummary();
}

// ========== FUNCIÓN PARA ACTUALIZAR RESUMEN ==========

function updateDeliverySummary() {
    const summary = document.getElementById('deliverySummary');
    if (!summary) return;
    
    if (selectedPoint && selectedDay && selectedSchedule) {
        summary.style.display = 'block';
        document.getElementById('selectedPoint').textContent = `${selectedPoint.nombre} - ${selectedPoint.direccion}`;
        document.getElementById('selectedDay').textContent = selectedDay;
        document.getElementById('selectedSchedule').textContent = selectedSchedule;
    } else {
        summary.style.display = 'none';
    }
}

// ========== FUNCIÓN PARA SELECCIONAR PUNTO ==========

function selectPoint(pointId) {
    const punto = PUNTOS_ENTREGA.find(p => p.id === pointId);
    if (!punto) return;

    selectedPoint = punto;
    selectedDay = null;
    selectedSchedule = null;

    const buttons = document.querySelectorAll('.delivery-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id) === pointId);
    });

    const daySection = document.getElementById('daySection');
    if (daySection) {
        daySection.style.display = 'block';
        document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    }
    renderDayOptions(punto);

    const scheduleSection = document.getElementById('scheduleSection');
    if (scheduleSection) {
        scheduleSection.style.display = 'none';
    }
    const summary = document.getElementById('deliverySummary');
    if (summary) {
        summary.style.display = 'none';
    }
}

// ========== FUNCIÓN PARA RENDERIZAR OPCIONES DE ENTREGA ==========

function renderDeliveryOptions() {
    const container = document.getElementById('deliveryOptions');
    if (!container) return;

    let html = '';
    PUNTOS_ENTREGA.forEach((punto) => {
        html += `
            <button class="delivery-btn" data-id="${punto.id}" onclick="selectPoint(${punto.id})">
                <span class="btn-icon"><i class="fas fa-store"></i></span>
                <span class="btn-info">
                    <span class="name">${punto.nombre}</span>
                    <span class="address">${punto.direccion}</span>
                </span>
                <span class="btn-check"><i class="fas fa-check-circle"></i></span>
            </button>
        `;
    });

    container.innerHTML = html;
}

// ========== MODIFICAR CHECKOUT PARA INCLUIR DÍA Y HORARIO ==========

// Reemplaza la función checkout() existente con esta versión mejorada
function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('❌ El carrito está vacío');
        return;
    }

    if (!selectedPoint) {
        showNotification('⚠️ Por favor, selecciona un punto de entrega');
        const deliverySection = document.querySelector('.delivery-section');
        if (deliverySection) {
            deliverySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            deliverySection.style.borderColor = '#e74c3c';
            setTimeout(() => {
                deliverySection.style.borderColor = '#f0eed4';
            }, 3000);
        }
        return;
    }

    if (!selectedDay) {
        showNotification('⚠️ Por favor, selecciona un día');
        document.getElementById('daySection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (!selectedSchedule) {
        showNotification('⚠️ Por favor, selecciona un horario');
        document.getElementById('scheduleSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // ========== GENERAR MENSAJE PARA WHATSAPP ==========
    const total = getCartTotal();
    
    function encodeText(text) {
        return encodeURIComponent(text);
    }

    let message = '🛒 *¡Nuevo pedido en Waffle Shop!*%0A%0A';
    
    message += '📍 *Punto de entrega:*%0A';
    message += `  ${encodeText(selectedPoint.nombre)}%0A`;
    message += `  ${encodeText(selectedPoint.direccion)}%0A`;
    message += `  📅 *Día:* ${encodeText(selectedDay)}%0A`;
    message += `  🕐 *Horario:* ${encodeText(selectedSchedule)}%0A%0A`;
    
    message += '📦 *Detalle del pedido:*%0A';
    message += '─────────────────%0A';
    
    cart.forEach((item) => {
        const subtotal = item.price * item.quantity;
        const itemName = encodeText(item.displayName || item.name);
        message += `• ${itemName}%0A`;
        message += `  Cantidad: ${item.quantity} × $${item.price} = $${subtotal}%0A`;
    });
    
    message += '─────────────────%0A';
    message += `💰 *Total: $${total}*%0A%0A`;
    
    message += '👤 *Datos del cliente:*%0A';
    message += '  Nombre: %0A';
    message += '  Teléfono: %0A%0A';
    message += '¡Gracias por tu compra! 🎉';

    const whatsappNumber = '524427805214';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
window.selectPoint = selectPoint;
window.selectDay = selectDay;
window.selectSchedule = selectSchedule;
window.renderDeliveryOptions = renderDeliveryOptions;
window.addToCartWithVariants = addToCartWithVariants;

console.log('✅ carrito.js cargado completamente');
console.log('📍 PUNTOS_ENTREGA:', PUNTOS_ENTREGA.length);
console.log('🔧 renderDeliveryOptions:', typeof renderDeliveryOptions);