import { supabase, getSessionId } from './config.js';
import { showToast } from './utils.js';

export async function addToCart(productId, quantity = 1) {
  try {
    const sessionId = getSessionId();

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: productId,
          quantity: quantity
        });

      if (error) throw error;
    }

    showToast('Added to cart!');
    updateCartBadge();
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('Failed to add to cart', 'error');
    return false;
  }
}

export async function removeFromCart(cartItemId) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    showToast('Removed from cart');
    updateCartBadge();
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    showToast('Failed to remove from cart', 'error');
    return false;
  }
}

export async function updateCartQuantity(cartItemId, quantity) {
  try {
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId);

    if (error) throw error;

    updateCartBadge();
    return true;
  } catch (error) {
    console.error('Error updating cart:', error);
    showToast('Failed to update cart', 'error');
    return false;
  }
}

export async function getCartItems() {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('session_id', sessionId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

export async function clearCart() {
  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;

    showToast('Cart cleared');
    updateCartBadge();
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    showToast('Failed to clear cart', 'error');
    return false;
  }
}

export async function getCartCount() {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('session_id', sessionId);

    if (error) throw error;

    return data.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
}

export async function updateCartBadge() {
  const count = await getCartCount();
  const badges = document.querySelectorAll('.cart-badge');

  badges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
}
