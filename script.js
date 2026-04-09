// SHOP DATA
const shopItems = [
    { id: 1, name: '⚡ Energy Drink', price: 35, image: '⚡', stock: 99, description: 'Instantly restores your energy levels! Perfect for late night coding.' },
    { id: 2, name: '🍔 Ultimate Burger', price: 85, image: '🍔', stock: 50, description: 'A massive triple-stack burger with our secret premium sauce.' },
    { id: 3, name: '🎮 Pro Controller', price: 199, image: '🎮', stock: 25, description: 'Gain the competitive edge with ultra-low latency and custom paddles.' },
    { id: 4, name: '👕 Premium T-Shirt', price: 65, image: '👕', stock: 75, description: 'Comfortable, breathable, and stylish. Made from 100% organic cotton.' },
    { id: 5, name: '☕ Coffee Pack (10x)', price: 45, image: '☕', stock: 40, description: 'Ten premium artisan coffee blends to kickstart your mornings.' },
    { id: 6, name: '📱 Phone Case', price: 129, image: '📱', stock: 30, description: 'Military-grade drop protection with a sleek, minimalist design.' },
    { id: 7, name: '🥤 Smoothie Pack', price: 55, image: '🥤', stock: 60, description: 'Delicious & healthy tropical smoothie mix for a refreshing boost.' },
    { id: 8, name: '🎧 Wireless Earbuds', price: 299, image: '🎧', stock: 15, description: 'Immersive noise-cancelling audio with a 24-hour battery life.' }
];

// STATE
let balance = 2500;
let cart = [];

// DOM ELEMENTS
const balanceEl = document.getElementById('balance');
const balanceAmountEl = document.getElementById('balanceAmount');
const shopGridEl = document.getElementById('shopGrid');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCartEl = document.querySelector('.empty-cart');

// INIT
document.addEventListener('DOMContentLoaded', function () {
    init();

    // Demo: Add coins every 8 seconds
    setInterval(() => {
        if (Math.random() > 0.6) {
            const amount = Math.floor(Math.random() * 50) + 10;
            balance += amount;
            updateBalance();
            showNotification(`💰 +$${amount} Coins earned!`, 'success');
        }
    }, 8000);
});

// MAIN INIT FUNCTION
function init() {
    renderShop();
    updateBalance();
    updateCart();
}

// RENDER SHOP
function renderShop() {
    shopGridEl.innerHTML = shopItems.map(item => createItemCard(item)).join('');
}

function createItemCard(item) {
    return `
        <div class="item-card" data-id="${item.id}">
            <div class="item-image">${item.image}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-price">$${item.price.toLocaleString()}</div>
            <button class="buy-button" onclick="addToCart(${item.id}, this)">
                Add to Cart
            </button>
        </div>
    `;
}

// CART FUNCTIONS
function addToCart(itemId, btnElement) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.stock === 0) {
        showNotification('Item out of stock! ❌', 'error');
        return;
    }

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    // Reduce stock (demo)
    item.stock = Math.max(0, item.stock - 1);

    showNotification(`${item.name} added! 🛒`, 'success');
    updateCart();
    animateCartShake();
    if (btnElement) {
        animateButtonPress(btnElement);
    }
}

function removeFromCart(itemId) {
    const itemInCart = cart.find(c => c.id === itemId);
    if (itemInCart) {
        // Restore stock to shop item
        const shopItem = shopItems.find(i => i.id === itemId);
        if (shopItem) shopItem.stock += itemInCart.quantity;
    }
    
    cart = cart.filter(item => item.id !== itemId);
    showNotification('Item removed! ❌', 'warning');
    updateCart();
}

function updateCart() {
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-cart">
                Your cart is empty. Start shopping! 🛍️
            </div>
        `;
        cartTotalEl.textContent = '$0';
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = '✅ Complete Purchase';
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString()} each</div>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
                <div class="cart-item-total">
                    x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    Remove
                </button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalEl.textContent = `$${total.toLocaleString()}`;
    checkoutBtn.disabled = total === 0 || total > balance;
    checkoutBtn.textContent = total > 0 ? `✅ Checkout $${total.toLocaleString()}` : '✅ Complete Purchase';
}

// CHECKOUT
function checkout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (total > balance) {
        showNotification('Insufficient balance! Need more 💰', 'error');
        shakeElement(checkoutBtn);
        return;
    }

    if (total === 0) {
        showNotification('Cart is empty! 🛒', 'warning');
        return;
    }

    // Process purchase
    balance -= total;
    cart = [];

    updateBalance();
    updateCart();
    showNotification(`🎉 Purchase successful! Saved $${total.toLocaleString()}`, 'success');

    // Success effects
    confettiEffect();
    animatePurchaseSuccess();
}

// BALANCE
function updateBalance() {
    const oldBalance = parseInt(balanceEl.textContent.replace(/,/g, '')) || 0;

    balanceEl.textContent = balance.toLocaleString();
    balanceAmountEl.textContent = balance.toLocaleString();

    // Animate balance change
    if (balance > oldBalance) {
        balanceAmountEl.style.color = '#27ae60';
        setTimeout(() => balanceAmountEl.style.color = '', 500);
    }
}

// NOTIFICATIONS
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Hide animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

// ANIMATIONS
function animateCartShake() {
    const cartPanel = document.querySelector('.cart-panel');
    cartPanel.classList.add('shake');
    setTimeout(() => cartPanel.classList.remove('shake'), 500);
}

function animateButtonPress(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = '', 150);
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => element.style.animation = '', 500);
}

function confettiEffect() {
    // Simple canvas confetti
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        width: 100%;
        height: 100%;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    for (let i = 0; i < 100; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * 5 + 5,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach((piece, i) => {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            ctx.restore();

            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotSpeed;
            piece.vy += 0.1;

            if (piece.y > canvas.height) {
                confetti.splice(i, 1);
            }
        });

        if (confetti.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }

    animate();
}

function animatePurchaseSuccess() {
    const header = document.querySelector('.header');
    header.style.transform = 'scale(1.02)';
    setTimeout(() => header.style.transform = '', 300);
}

// GLOBAL EVENT LISTENERS
window.addEventListener('resize', () => {
    // Re-render for responsive
    renderShop();
});

// Export functions for HTML onclick
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;