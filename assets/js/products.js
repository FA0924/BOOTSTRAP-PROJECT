import { supabase } from './config.js';
import { addToCart } from './cart.js';
import { toggleWishlist, isInWishlist } from './wishlist.js';
import { formatPrice } from './utils.js';

export async function getProducts(filters = {}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.featured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProductCard(product) {
  const inWishlist = await isInWishlist(product.id);

  const card = document.createElement('div');
  card.className = 'card product-card fade-in';

  card.innerHTML = `
    <div class="product-image-wrapper">
      <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
      <div class="product-actions">
        <button class="action-btn wishlist-btn ${inWishlist ? 'active' : ''}" data-product-id="${product.id}">
          <i class="fas fa-heart"></i>
        </button>
        <button class="action-btn quick-view-btn" data-product-id="${product.id}">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    </div>
    <div class="card-body">
      <h5 class="card-title">${product.name}</h5>
      <p class="card-text text-muted">${product.description.substring(0, 80)}...</p>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="price-tag">${formatPrice(product.price)}</span>
        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
          <i class="fas fa-shopping-cart me-2"></i>Add
        </button>
      </div>
    </div>
  `;

  const addToCartBtn = card.querySelector('.add-to-cart-btn');
  addToCartBtn.addEventListener('click', async () => {
    addToCartBtn.disabled = true;
    await addToCart(product.id);
    addToCartBtn.disabled = false;
  });

  const wishlistBtn = card.querySelector('.wishlist-btn');
  wishlistBtn.addEventListener('click', async () => {
    await toggleWishlist(product.id);
    wishlistBtn.classList.toggle('active');
  });

  const quickViewBtn = card.querySelector('.quick-view-btn');
  quickViewBtn.addEventListener('click', () => {
    showProductModal(product);
  });

  return card;
}

export function showProductModal(product) {
  const existingModal = document.getElementById('productModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'productModal';
  modal.setAttribute('tabindex', '-1');

  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${product.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <img src="${product.image_url}" class="img-fluid rounded" alt="${product.name}">
            </div>
            <div class="col-md-6">
              <h3 class="price-tag mb-3">${formatPrice(product.price)}</h3>
              <p class="text-muted">${product.description}</p>
              <div class="mt-4">
                <p class="mb-2"><strong>Category:</strong> ${product.category}</p>
                <p class="mb-2"><strong>Stock:</strong> ${product.stock} available</p>
              </div>
              <div class="mt-4">
                <label class="form-label"><strong>Quantity:</strong></label>
                <div class="quantity-control mb-3">
                  <button class="quantity-btn minus-btn">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}">
                  <button class="quantity-btn plus-btn">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <button class="btn btn-primary w-100 modal-add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  const quantityInput = modal.querySelector('.quantity-input');
  const minusBtn = modal.querySelector('.minus-btn');
  const plusBtn = modal.querySelector('.plus-btn');
  const addToCartBtn = modal.querySelector('.modal-add-to-cart');

  minusBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current > 1) {
      quantityInput.value = current - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value);
    if (current < product.stock) {
      quantityInput.value = current + 1;
    }
  });

  addToCartBtn.addEventListener('click', async () => {
    const quantity = parseInt(quantityInput.value);
    addToCartBtn.disabled = true;
    await addToCart(product.id, quantity);
    addToCartBtn.disabled = false;
    bsModal.hide();
  });

  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');

    if (error) throw error;

    const uniqueCategories = [...new Set(data.map(p => p.category))];
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
