import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalPrice,
  } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT : CART ================= */}
        <div className="lg:col-span-2 bg-white rounded shadow-sm">
          <div className="border-b px-6 py-4 font-bold text-lg">
            Panier ({cart.length})
          </div>

          {cart.map((item) => {
            const oldPrice = item.oldPrice || item.price * 1.25;
            const discount = Math.round(
              ((oldPrice - item.price) / oldPrice) * 100
            );

            return (
              <div
                key={item.id}
                className="flex gap-4 px-6 py-5 border-b"
              >
                {/* IMAGE */}
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-20 h-20 object-contain"
                />

                {/* INFOS */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">
                    {item.name}
                  </h3>

                  <p className="text-xs text-orange-500 mt-1">
                    Quelques articles restants
                  </p>

                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    JUMIA <span className="text-orange-500">EXPRESS</span>
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-orange-500 text-sm mt-3"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>

                {/* PRICE + QTY */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {item.price.toLocaleString()} FCFA
                    </p>

                    <div className="flex items-center gap-2 justify-end text-sm">
                      <span className="line-through text-gray-400">
                        {oldPrice.toLocaleString()} FCFA
                      </span>
                      <span className="bg-orange-100 text-orange-600 px-1 rounded text-xs">
                        -{discount}%
                      </span>
                    </div>
                  </div>

                  {/* QTY */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="w-8 h-8 bg-gray-300 rounded text-lg"
                    >
                      –
                    </button>

                    <span className="w-6 text-center">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="w-8 h-8 bg-orange-500 text-white rounded text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= RIGHT : SUMMARY ================= */}
        <div className="bg-white rounded shadow-sm h-fit sticky top-24">
          <div className="border-b px-5 py-4 font-bold">
            RÉSUMÉ DU PANIER
          </div>

          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="font-semibold">
                {totalPrice.toLocaleString()} FCFA
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm text-green-600">
              ✔
              <span>
                Les articles Jumia Express sont éligibles à la
                livraison gratuite
                <br />
                <span className="font-semibold text-orange-500">
                  JUMIA EXPRESS
                </span>
              </span>
            </div>
          </div>

          <div className="px-5 pb-5">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold">
              Commander ({totalPrice.toLocaleString()} FCFA)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
