import { getCartItems, updateCartQuantity, removeFromCart, clearCart, updateCartBadge } from './cart.js';
import { formatPrice } from './utils.js';

export async function renderCart() {
  const cartItems = await getCartItems();
  const container = document.getElementById('cartItemsContainer');
  const summaryContainer = document.getElementById('orderSummary');

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Add some beautiful flowers to your cart</p>
          <a href="./SHOP.html" class="btn btn-primary mt-3">
            <i class="fas fa-store me-2"></i>Continue Shopping
          </a>
        </div>
      </div>
    `;
    summaryContainer.innerHTML = `
      <div class="card">
        <div class="card-body text-center text-muted">
          <p>No items in cart</p>
        </div>
      </div>
    `;
    return;
  }

  let subtotal = 0;

  container.innerHTML = cartItems.map(item => {
    const itemTotal = item.products.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="card mb-3 fade-in" data-cart-item-id="${item.id}">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <img src="${item.products.image_url}" class="img-fluid rounded" alt="${item.products.name}" style="height: 100px; width: 100%; object-fit: cover;">
            </div>
            <div class="col-md-4">
              <h5 class="mb-1">${item.products.name}</h5>
              <p class="text-muted mb-0 small">${item.products.description.substring(0, 60)}...</p>
              <p class="text-muted mb-0 small">Price: ${formatPrice(item.products.price)}</p>
            </div>
            <div class="col-md-3">
              <div class="quantity-control justify-content-center">
                <button class="quantity-btn minus-btn" data-cart-id="${item.id}">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-cart-id="${item.id}" readonly>
                <button class="quantity-btn plus-btn" data-cart-id="${item.id}">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-md-2 text-center">
              <p class="fw-bold mb-0 price-tag">${formatPrice(itemTotal)}</p>
            </div>
            <div class="col-md-1 text-center">
              <button class="btn btn-sm btn-danger remove-btn" data-cart-id="${item.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const shipping = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  summaryContainer.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Order Summary</h5>
      </div>
      <div class="card-body">
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal (${cartItems.length} items)</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
        ${subtotal > 50 ? '<small class="text-success">Free shipping on orders over 50 OMR</small>' : '<small class="text-muted">Free shipping on orders over 50 OMR</small>'}
        <div class="d-flex justify-content-between mb-2 mt-2">
          <span>Tax (5%)</span>
          <span>${formatPrice(tax)}</span>
        </div>
        <hr>
        <div class="d-flex justify-content-between mb-3">
          <strong>Total</strong>
          <strong class="price-tag">${formatPrice(total)}</strong>
        </div>
        <button class="btn btn-primary w-100 mb-2" id="checkoutBtn">
          <i class="fas fa-lock me-2"></i>Proceed to Checkout
        </button>
        <a href="./SHOP.html" class="btn btn-outline-primary w-100">
          <i class="fas fa-store me-2"></i>Continue Shopping
        </a>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-body">
        <h6 class="card-title">Have a Coupon?</h6>
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Enter coupon code" id="couponInput">
          <button class="btn btn-outline-secondary" id="applyCouponBtn">Apply</button>
        </div>
      </div>
    </div>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const cartId = e.currentTarget.getAttribute('data-cart-id');
      const input = document.querySelector(`input[data-cart-id="${cartId}"]`);
      const newQuantity = parseInt(input.value) - 1;

      if (newQuantity > 0) {
        await updateCartQuantity(cartId, newQuantity);
        await renderCart();
      }
    });
  });

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const cartId = e.currentTarget.getAttribute('data-cart-id');
      const input = document.querySelector(`input[data-cart-id="${cartId}"]`);
      const newQuantity = parseInt(input.value) + 1;

      await updateCartQuantity(cartId, newQuantity);
      await renderCart();
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const cartId = e.currentTarget.getAttribute('data-cart-id');
      await removeFromCart(cartId);
      await renderCart();
    });
  });

  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        await clearCart();
        await renderCart();
      }
    });
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Checkout functionality coming soon! This would integrate with a payment processor.');
    });
  }

  const applyCouponBtn = document.getElementById('applyCouponBtn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const couponInput = document.getElementById('couponInput');
      if (couponInput.value) {
        alert('Coupon system coming soon!');
      }
    });
  }
}
