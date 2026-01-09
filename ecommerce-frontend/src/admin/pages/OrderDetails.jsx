import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const order = {
    id: orderId,
    client: {
      name: "Jean Kouassi",
      phone: "+225 07 89 45 23 11",
      email: "jean@gmail.com",
    },
    status: "Payé",
    date: "05 Jan 2026",
    address: "Abidjan, Cocody Angré",
    items: [
      { name: "Casque Bluetooth", qty: 1, price: 25000 },
      { name: "Power Bank", qty: 2, price: 10000 },
    ],
  };

  const statusStyle = {
    Payé: "bg-green-100 text-green-700",
    "En attente": "bg-yellow-100 text-yellow-700",
    Annulé: "bg-red-100 text-red-700",
  };

  const total = order.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
      >
        <ArrowLeft size={18} />
        Retour aux commandes
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Commande {order.id}
          </h2>
          <p className="text-gray-500 text-sm">
            {order.date}
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            Produits commandés
          </h3>

          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantité : {item.qty}
                </p>
              </div>
              <p className="font-semibold">
                {(item.qty * item.price).toLocaleString()} FCFA
              </p>
            </div>
          ))}

          <div className="flex justify-between mt-6 text-lg font-bold">
            <span>Total</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">
            Informations client
          </h3>

          <div className="text-sm text-gray-600 space-y-2">
            <p><b>Nom :</b> {order.client.name}</p>
            <p><b>Téléphone :</b> {order.client.phone}</p>
            <p><b>Email :</b> {order.client.email}</p>
            <p><b>Adresse :</b> {order.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
