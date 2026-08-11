// ========== CONFIGURACIÓN DE COLORES (por defecto) ==========
const DEFAULT_COLORS = [
    { name: 'Rojo', hex: '#e74c3c' },
    { name: 'Azul', hex: '#3498db' },
    { name: 'Verde', hex: '#2ecc71' },
    { name: 'Amarillo', hex: '#f1c40f' },
    { name: 'Rosa', hex: '#e91e63' },
    { name: 'Morado', hex: '#9b59b6' },
    { name: 'Naranja', hex: '#e67e22' },
    { name: 'Negro', hex: '#2c3e50' },
    { name: 'Blanco', hex: '#ecf0f1' }
];

// ========== VARIABLES GLOBALES ==========
let selectedColor = null;
let selectedColorHex = null;
let selectedPriceExtra = 0;
let COLORS = [];  // Se llenará desde el HTML

// ========== CONFIGURACIÓN DEL PRODUCTO ==========
let PRODUCT_CONFIG = {
    id: 1,
    name: 'Producto',
    basePrice: 0,
    image: 'default.jpg',
    hasColorPrice: false  // ← NUEVO: Controla si aplica precios por color
};

// ========== FUNCIÓN PARA CONFIGURAR PRODUCTO ==========
function setProductConfig(id, name, basePrice, image) {
    PRODUCT_CONFIG = {
        id: id,
        name: name,
        basePrice: basePrice,
        image: image || 'default.jpg',
        hasColorPrice: false  // Por defecto, sin precios por color
    };
    console.log('📦 Producto configurado:', PRODUCT_CONFIG);
    updatePriceDisplay();
}

// ========== FUNCIÓN PARA ACTIVAR PRECIOS POR COLOR ==========
function enableColorPrices(colorsWithPrices) {
    // Si se pasan colores con precios, usarlos
    if (colorsWithPrices && colorsWithPrices.length > 0) {
        COLORS = colorsWithPrices;
        PRODUCT_CONFIG.hasColorPrice = true;
        console.log('💰 Precios por color activados:', COLORS);
    } else {
        // Si no, usar los colores sin precios
        COLORS = DEFAULT_COLORS.map(c => ({ ...c, priceExtra: 0 }));
        PRODUCT_CONFIG.hasColorPrice = false;
        console.log('🎨 Colores sin precios adicionales');
    }
    initColorSelector();
    updatePriceDisplay();
}

// ========== FUNCIONES ==========

function initColorSelector() {
    const container = document.getElementById('colorOptions');
    if (!container) {
        console.warn('⚠️ No se encontró #colorOptions');
        return;
    }

    container.innerHTML = '';

    COLORS.forEach(color => {
        const button = document.createElement('button');
        button.className = 'color-btn';
        button.dataset.color = color.name;
        button.dataset.colorHex = color.hex;
        button.dataset.priceExtra = color.priceExtra || 0;
        button.onclick = () => selectColor(button);
        
        const circle = document.createElement('span');
        circle.className = 'color-circle';
        circle.style.backgroundColor = color.hex;
        if (color.name === 'Blanco') {
            circle.style.border = '2px solid #ddd';
        }
        button.appendChild(circle);
        
        // Mostrar nombre y precio extra si aplica
        let label = ' ' + color.name;
        if (color.priceExtra > 0 && PRODUCT_CONFIG.hasColorPrice) {
            label += ` (+$${color.priceExtra})`;
        }
        const text = document.createTextNode(label);
        button.appendChild(text);
        
        container.appendChild(button);
    });

    console.log('🎨 Selector iniciado con', COLORS.length, 'colores');
}

function selectColor(element) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    selectedColor = element.dataset.color;
    selectedColorHex = element.dataset.colorHex;
    selectedPriceExtra = parseFloat(element.dataset.priceExtra) || 0;
    
    const selectedSpan = document.querySelector('#colorSelected span');
    if (selectedSpan) {
        let displayText = selectedColor;
        if (selectedPriceExtra > 0 && PRODUCT_CONFIG.hasColorPrice) {
            displayText += ` (+$${selectedPriceExtra})`;
        }
        selectedSpan.textContent = displayText;
    }
    
    // Actualizar precio mostrado
    updatePriceDisplay();
    
    const errorElement = document.getElementById('colorError');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.classList.remove('show');
    }
    
    const selector = document.querySelector('.color-selector');
    if (selector) {
        selector.classList.remove('error');
    }
    
    console.log('🎨 Color seleccionado:', selectedColor, 'Extra:', selectedPriceExtra);
}

// ========== ACTUALIZAR PRECIO MOSTRADO ==========

function updatePriceDisplay() {
    const priceElement = document.querySelector('.product-price-display');
    if (!priceElement) return;
    
    const basePrice = PRODUCT_CONFIG.basePrice || 0;
    const totalPrice = basePrice + selectedPriceExtra;
    
    // Si el producto tiene precios por color y hay un extra
    if (PRODUCT_CONFIG.hasColorPrice && selectedPriceExtra > 0 && selectedColor) {
        priceElement.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 1.2rem;">
                $${basePrice}
            </span>
            <span style="color: #e74c3c; font-size: 1.3rem;">
                + $${selectedPriceExtra}
            </span>
            <span style="color: #e67e22; font-size: 2rem; font-weight: 800;">
                $${totalPrice}
            </span>
        `;
    } else {
        // Sin precios por color o sin color seleccionado
        priceElement.innerHTML = `
            <span style="color: #2c3e50; font-size: 2rem; font-weight: 800;">
                $${basePrice}
            </span>
        `;
    }
}

// ========== AÑADIR AL CARRITO CON VALIDACIÓN ==========

function addToCartWithColor() {
    console.log('🛒 Intentando añadir al carrito...');
    console.log('🎨 Color seleccionado:', selectedColor);
    console.log('💰 Precio extra:', selectedPriceExtra);
    console.log('📦 Producto configurado:', PRODUCT_CONFIG);
    
    if (!selectedColor) {
        console.warn('⚠️ No hay color seleccionado');
        showErrorNotification('¡Selecciona una opción antes de añadir al carrito!');
        
        const selector = document.querySelector('.color-selector');
        if (selector) {
            selector.classList.add('error');
            setTimeout(() => {
                selector.classList.remove('error');
            }, 3500);
        }
        
        const colorSelector = document.querySelector('.color-selector');
        if (colorSelector) {
            colorSelector.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        
        return;
    }
    
    console.log('✅ Color válido, añadiendo al carrito...');
    
    const selector = document.querySelector('.color-selector');
    if (selector) {
        selector.classList.remove('error');
    }
    
    // ✅ Calcular precio final
    const finalPrice = PRODUCT_CONFIG.basePrice + selectedPriceExtra;
    const productName = `${PRODUCT_CONFIG.name} (${selectedColor})`;
    
    if (typeof addToCart === 'function') {
        addToCart(PRODUCT_CONFIG.id, productName, finalPrice, PRODUCT_CONFIG.image);
        console.log('✅ Producto añadido:', productName, 'Precio: $' + finalPrice);
    } else {
        console.error('❌ Error: La función addToCart no está definida');
        alert('❌ Error: El carrito no está cargado correctamente.');
    }
}

// ========== NOTIFICACIONES ==========

function showErrorNotification(message) {
    document.querySelectorAll('.cart-notification.error').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #e74c3c;
        color: #fff;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(231, 76, 60, 0.4);
        z-index: 9999;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
        border-left: 4px solid #c0392b;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icon = document.createElement('span');
    icon.textContent = '⚠️';
    icon.style.fontSize = '1.3rem';
    notification.prepend(icon);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

// ========== INICIALIZAR ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando selector de colores...');
    
    // Si no se han definido colores personalizados, usar los predeterminados
    if (COLORS.length === 0) {
        COLORS = DEFAULT_COLORS.map(c => ({ ...c, priceExtra: 0 }));
    }
    
    initColorSelector();
    
    window.selectColor = selectColor;
    window.addToCartWithColor = addToCartWithColor;
    window.setProductConfig = setProductConfig;
    window.enableColorPrices = enableColorPrices;
    window.updatePriceDisplay = updatePriceDisplay;
    
    console.log('✅ Selector de colores listo');
});