import { supabase } from "../../lib/supabase";

export async function getMyOrders(email) {
  if (!email) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement commandes:", error);
    throw new Error("Erreur chargement commandes");
  }

  return data;
}

export async function createOrder(orderData) {
  try {
    const {
      user_id,
      user_email,
      items,
      total,
      shipping_address,
      payment_method,
      shipping_cost,
      points_used,
      points_earned,
      coupon_code,
      metadata,
    } = orderData;

    if (!items || items.length === 0) {
      throw new Error("Panier vide");
    }

    // 1. Insert into 'orders' table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user_id || null,
          user_email: user_email || "guest@example.com",
          total,
          status: "En cours",
          shipping_address,
          payment_method,
          shipping_cost,
          points_used,
          points_earned,
          coupon_code,
          metadata,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert 'order_items'
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity || item.qty,
      price: item.price,
      name: item.name,
      image: item.image || (item.images && item.images[0]),
      variant: item.variant || null,
      size: item.size || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Update Loyalty Points
    if (user_id && (points_used > 0 || points_earned > 0)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user_id)
        .single();

      if (profile) {
        const currentPoints = profile.loyalty_points || 0;
        const newBalance =
          currentPoints - (points_used || 0) + (points_earned || 0);

        await supabase
          .from("profiles")
          .update({ loyalty_points: newBalance })
          .eq("id", user_id);
      }
    }

    return { ...order, items: orderItems };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    throw new Error("Erreur lors de la mise à jour de la commande");
  }

  return data;
}
