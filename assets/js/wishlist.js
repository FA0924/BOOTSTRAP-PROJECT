import { supabase, getSessionId } from './config.js';
import { showToast } from './utils.js';

export async function addToWishlist(productId) {
  try {
    const sessionId = getSessionId();

    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      showToast('Already in wishlist', 'info');
      return false;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        session_id: sessionId,
        product_id: productId
      });

    if (error) throw error;

    showToast('Added to wishlist!');
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    showToast('Failed to add to wishlist', 'error');
    return false;
  }
}

export async function removeFromWishlist(productId) {
  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('session_id', sessionId)
      .eq('product_id', productId);

    if (error) throw error;

    showToast('Removed from wishlist');
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    showToast('Failed to remove from wishlist', 'error');
    return false;
  }
}

export async function getWishlistItems() {
  try {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        products (*)
      `)
      .eq('session_id', sessionId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

export async function isInWishlist(productId) {
  try {
    const sessionId = getSessionId();

    const { data } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

export async function toggleWishlist(productId) {
  const inWishlist = await isInWishlist(productId);

  if (inWishlist) {
    return await removeFromWishlist(productId);
  } else {
    return await addToWishlist(productId);
  }
}
