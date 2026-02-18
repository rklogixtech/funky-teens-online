/* ========================================
   cart.js - Global Shopping Cart System
   Handles: Add to Cart, Remove Items,
            Quantity Update, Local Storage,
            Cart Modal, Right Side Display
   ======================================== */

// Shopping Cart Class
class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.createCartModal();
        this.initElements();
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    createCartModal() {
        // Check if modal already exists
        if (document.querySelector('.cart-modal')) return;

        const modalHTML = `
            <div class="cart-modal" id="globalCartModal">
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <h2>
                            <i class="fa-solid fa-bag-shopping"></i>
                            Your Shopping Bag
                        </h2>
                        <i class="fa-solid fa-xmark close-cart" id="closeCartModal"></i>
                    </div>
                    <div class="cart-items" id="cartItemsContainer"></div>
                    <div class="cart-total">
                        <h3>Total: ₹<span class="total-amount" id="cartTotalAmount">0.00</span></h3>
                    </div>
                    <div class="cart-actions">
                        <a href="checkout.html"><button class="continue-shopping" id="continueShoppingBtn"></a>
                            <i class="fa-solid fa-arrow-left"></i> Continue
                        </button>
                        <button class="checkout-btn" id="checkoutBtn">
                            Checkout <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    initElements() {
        this.cartModal = document.getElementById('globalCartModal');
        this.cartIcon = document.querySelector('.cart-icon');
        this.closeCartBtn = document.getElementById('closeCartModal');
        this.continueBtn = document.getElementById('continueShoppingBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.cartItemsContainer = document.getElementById('cartItemsContainer');
        this.cartCountSpans = document.querySelectorAll('.cart-count');
        this.totalSpan = document.getElementById('cartTotalAmount');
    }

    setupEventListeners() {
        // Cart icon click
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCart();
            });
        }

        // Close cart
        if (this.closeCartBtn) {
            this.closeCartBtn.addEventListener('click', () => this.closeCart());
        }

        if (this.continueBtn) {
            this.continueBtn.addEventListener('click', () => this.closeCart());
        }

        // Checkout
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    this.showNotification('Your cart is empty!', 'error');
                } else {
                    alert('Checkout functionality will be implemented!');
                }
            });
        }

        // Close on overlay click
        this.cartModal.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.closeCart();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cartModal.classList.contains('active')) {
                this.closeCart();
            }
        });

        // Add to cart buttons (will be reattached on page load)
        this.attachAddToCartListeners();
    }

    attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            // Remove existing listener to avoid duplicates
            btn.removeEventListener('click', this.addToCartHandler);
            
            // Add new listener
            btn.addEventListener('click', this.addToCartHandler.bind(this));
        });
    }

    addToCartHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        const item = e.target.closest('.item, .hot-card, .cosmetic-card, .product-card');
        
        if (!item) {
            console.log('No item found');
            return;
        }

        // Try different ways to get product data
        const id = item.dataset.id || 'prod_' + Date.now() + Math.random();
        const name = item.dataset.name || 
                    item.querySelector('h3')?.textContent || 
                    item.querySelector('.hot-card-title')?.textContent ||
                    item.querySelector('.cosmetic-name')?.textContent ||
                    'Product';
        
        const priceText = item.dataset.price || 
                         item.querySelector('.price')?.textContent ||
                         item.querySelector('.hot-card-price')?.textContent ||
                         item.querySelector('.cosmetic-price')?.textContent ||
                         '₹0';
        
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;
        
        const image = item.dataset.image || 
                     item.querySelector('img')?.src ||
                     'https://via.placeholder.com/150';

        // Check if item exists
        const existingItem = this.items.find(i => i.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }

        this.saveToStorage();
        this.updateCartDisplay();
        this.showNotification(`${name} added to cart! 🎉`);
        
        // Animation on cart icon
        if (this.cartIcon) {
            this.cartIcon.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                this.cartIcon.style.animation = '';
            }, 500);
        }
    }

    addItem(item) {
        // For manual addition if needed
        this.addToCartHandler({ target: item, stopPropagation: () => {}, preventDefault: () => {} });
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
        this.updateCartDisplay();
        this.showNotification('Item removed from cart');
    }

    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = newQuantity;
                this.saveToStorage();
                this.updateCartDisplay();
            }
        }
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartDisplay() {
        const count = this.getItemCount();

        // Update all cart count spans
        this.cartCountSpans.forEach(span => {
            span.textContent = count;
            
            // Add animation
            span.style.animation = 'pulse 0.3s';
            setTimeout(() => {
                span.style.animation = '';
            }, 300);
        });

        // Update cart items display
        if (!this.cartItemsContainer) return;

        if (this.items.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-bag-shopping fa-4x" style="color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="color: #666; font-size: 1.2rem;">Your cart is empty</p>
                    <p style="color: #999; margin-top: 0.5rem;">Add some products to get started!</p>
                </div>
            `;
        } else {
            let html = '';
            this.items.forEach(item => {
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                            <div class="cart-item-quantity">
                                <button class="decrease-qty" title="Decrease quantity">−</button>
                                <span>${item.quantity}</span>
                                <button class="increase-qty" title="Increase quantity">+</button>
                            </div>
                        </div>
                        <i class="fa-solid fa-trash remove-item" title="Remove item"></i>
                    </div>
                `;
            });

            this.cartItemsContainer.innerHTML = html;

            // Add event listeners for cart items
            this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartItem = e.target.closest('.cart-item');
                    if (cartItem) {
                        const id = cartItem.dataset.id;
                        this.removeItem(id);
                    }
                });
            });

            this.cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartItem = e.target.closest('.cart-item');
                    if (cartItem) {
                        const id = cartItem.dataset.id;
                        const item = this.items.find(i => i.id === id);
                        if (item) {
                            this.updateQuantity(id, item.quantity - 1);
                        }
                    }
                });
            });

            this.cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cartItem = e.target.closest('.cart-item');
                    if (cartItem) {
                        const id = cartItem.dataset.id;
                        const item = this.items.find(i => i.id === id);
                        if (item) {
                            this.updateQuantity(id, item.quantity + 1);
                        }
                    }
                });
            });
        }

        // Update total
        if (this.totalSpan) {
            const total = this.calculateTotal();
            this.totalSpan.textContent = total.toFixed(2);
            
            // Add animation on total update
            this.totalSpan.style.animation = 'pulse 0.3s';
            setTimeout(() => {
                this.totalSpan.style.animation = '';
            }, 300);
        }
    }

    openCart() {
        if (this.cartModal) {
            this.cartModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    closeCart() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        notification.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        localStorage.setItem('funky_cart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('funky_cart');
            if (saved) {
                this.items = JSON.parse(saved);
            } else {
                this.items = [];
            }
        } catch (e) {
            console.log('Error loading cart from storage');
            this.items = [];
        }
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Reattach listeners after dynamic content load
    const observer = new MutationObserver(() => {
        if (window.cart) {
            window.cart.attachAddToCartListeners();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});