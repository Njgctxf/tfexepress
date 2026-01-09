import {
  Facebook,
  Instagram,
  Twitter,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 mt-20">

      {/* TOP INFO */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

          <div className="flex items-center gap-3">
            <Truck className="text-red-500" />
            <span>Livraison rapide partout</span>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="text-red-500" />
            <span>Paiement 100% sécurisé</span>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="text-red-500" />
            <span>Mobile Money & Cartes</span>
          </div>

          <div className="flex items-center gap-3">
            <Headphones className="text-red-500" />
            <span>Support client 7j/7</span>
          </div>

        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* À PROPOS */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">TFExpress</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            TFExpress est une marketplace en ligne qui vous permet d’acheter
            facilement des produits authentiques : électronique, mode,
            sport, beauté, maison et bien plus encore.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Notre mission est de connecter les meilleurs vendeurs aux clients,
            avec des prix compétitifs et un service fiable.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-5">
            <Facebook className="cursor-pointer hover:text-red-500" />
            <Instagram className="cursor-pointer hover:text-red-500" />
            <Twitter className="cursor-pointer hover:text-red-500" />
          </div>
        </div>

        {/* ACHETER */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Acheter sur TFExpress
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-red-500 cursor-pointer">Comment commander</li>
            <li className="hover:text-red-500 cursor-pointer">Créer un compte</li>
            <li className="hover:text-red-500 cursor-pointer">Modes de paiement</li>
            <li className="hover:text-red-500 cursor-pointer">Suivi de commande</li>
          </ul>
        </div>

        {/* AIDE */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Services & Aide
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-red-500 cursor-pointer">Centre d’aide</li>
            <li className="hover:text-red-500 cursor-pointer">Retours & remboursements</li>
            <li className="hover:text-red-500 cursor-pointer">Conditions d’utilisation</li>
            <li className="hover:text-red-500 cursor-pointer">Politique de confidentialité</li>
          </ul>
        </div>

        {/* CATÉGORIES */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Catégories populaires
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-red-500 cursor-pointer">Électronique</li>
            <li className="hover:text-red-500 cursor-pointer">Chaussures</li>
            <li className="hover:text-red-500 cursor-pointer">Vêtements</li>
            <li className="hover:text-red-500 cursor-pointer">Beauté & Santé</li>
            <li className="hover:text-red-500 cursor-pointer">Maison & Cuisine</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>
            © {new Date().getFullYear()} TFExpress. Tous droits réservés.
          </span>
          <span>
            Marketplace inspirée des standards internationaux du e-commerce
          </span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
