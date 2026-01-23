import { supabase } from "../config/supabase.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../services/email.service.js";

/* ===== GET ALL ORDERS (ADMIN) ===== */
export async function getAllOrders(req, res) {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== GET ORDER BY ID ===== */
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] getOrderById called with ID: ${id}`);

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[DEBUG] Supabase error for ID ${id}:`, error);
    }

    if (!order) {
      console.log(`[DEBUG] No order found for ID ${id}`);
      return res.status(404).json({ message: "Commande introuvable" });
    }

    console.log(`[DEBUG] Order found: ${order.id}`);
    res.json(order);
  } catch (error) {
    console.error("[DEBUG] Server error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== GET MY ORDERS ===== */
export async function getMyOrders(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const { data: userOrders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

/* ===== CREATE ORDER ===== */
/* ===== CREATE ORDER ===== */
export async function createOrder(req, res) {
  try {
    const {
      user_id,
      user_email,
      items, // Expecting array of objects { product_id, quantity, price, name, image, variant }
      total,
      shipping_address,
      payment_method,
      shipping_cost,
      points_used,
      points_earned,
      coupon_code,
      metadata
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Panier vide" });
    }

    // 1. Insert into 'orders' table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user_id || null, // Can be null for guest
          user_email: user_email || "guest@example.com",
          total,
          status: "En cours", // Default status
          shipping_address,    // JSONB
          payment_method,
          shipping_cost,
          points_used,
          points_earned,
          coupon_code,
          metadata
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;
    if (!orderData) throw new Error("Erreur lors de la création de la commande (No Data)");

    // 2. Prepare and Insert 'order_items'
    // Map items to match the schema expected by the database
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id || item.id, // Handle potential naming differences
      quantity: item.quantity || item.qty,
      price: item.price,
      name: item.name,
      image: item.image || (item.images && item.images[0]), // Store image reference
      variant: item.variant || null,
      size: item.size || null
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Should probably rollback order here in a real transaction, but for now we throw
      console.error("Error inserting items:", itemsError);
      throw itemsError;
    }

    // 3. Update Loyalty Points if user exists
    if (user_id && (points_used > 0 || points_earned > 0)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user_id)
        .single();

      if (profile) {
        const currentPoints = profile.loyalty_points || 0;
        const newBalance = currentPoints - (points_used || 0) + (points_earned || 0);

        await supabase
          .from("profiles")
          .update({ loyalty_points: newBalance })
          .eq("id", user_id);
      }
    }

    // 4. Send Confirmation Email
    // We pass the full order object with items for the email template
    const fullOrder = { ...orderData, items: orderItems };
    sendOrderConfirmation(fullOrder).catch(err => console.error("Email error:", err));

    res.status(201).json(fullOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Erreur lors de la création de la commande", error: error.message });
  }
}

/* ===== UPDATE ORDER (ADMIN) ===== */
export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Send Status Update Email if status changed
    if (updates.status) {
      sendOrderStatusUpdate(data).catch(err => console.error("Status email error:", err));
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
}
