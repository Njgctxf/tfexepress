import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { getCategories } from "../services/api/categories.api";

const TiktokIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const PinterestIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    <path d="M10 7.5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5" />
    <path d="M12 12v5" />
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
  </svg>
);

const SnapchatIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3.7 10a7 7 0 0 1 15.6 1h.9a1 1 0 0 1 .9 1.3l-1.6 3.4a2 2 0 0 1-.6 2.4c-.7.5-1.7.5-2.5 0a2 2 0 0 0-2.3 0c-.8.5-1.7.6-2.6 0a2 2 0 0 0-2.3 0c-.8.5-1.8.6-2.6 0a2 2 0 0 0-2.3 0C3 18.5 2 18 1.4 17A2 2 0 0 1 2 15l1.6-3.4a1 1 0 0 1 .9-1.3h.8Z" />
  </svg>
);

const Footer = () => {
  const {
    siteName, supportPhone, siteAddress,
    facebook, instagram, tiktok,
    youtube, twitter, linkedin, pinterest, snapchat
  } = useSiteSettings();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <footer className="bg-gray-100 text-gray-700 mt-10 md:mt-20">

      {/* TOP INFO */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

          <div className="flex items-center gap-3">
            <Truck className="text-red-500 shrink-0" />
            <span>Livraison rapide partout</span>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="text-red-500 shrink-0" />
            <span>Paiement 100% sécurisé</span>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="text-red-500 shrink-0" />
            <span>Mobile Money & Cartes</span>
          </div>

          <div className="flex items-center gap-3">
            <Headphones className="text-red-500 shrink-0" />
            <span>Support client 7j/7</span>
          </div>

        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

        {/* À PROPOS */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">{siteName || "TFExpress"}</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {siteName || "TFExpress"} est une marketplace en ligne qui vous permet d’acheter
            facilement des produits authentiques : électronique, mode,
            sport, beauté, maison et bien plus encore.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Notre mission est de connecter les meilleurs vendeurs aux clients,
            avec des prix compétitifs et un service fiable.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-5">
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {tiktok && (
              <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TiktokIcon className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {youtube && (
              <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {twitter && (
              <a href={twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {pinterest && (
              <a href={pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <PinterestIcon className="cursor-pointer hover:text-red-500" />
              </a>
            )}
            {snapchat && (
              <a href={snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                <SnapchatIcon className="cursor-pointer hover:text-red-500" />
              </a>
            )}
          </div>
        </div>

        {/* ACHETER */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Acheter sur {siteName || "TFExpress"}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-red-500 cursor-pointer">Comment commander</Link></li>
            <li><Link to="/register" className="hover:text-red-500 cursor-pointer">Créer un compte</Link></li>
            <li><Link to="/help" className="hover:text-red-500 cursor-pointer">Modes de paiement</Link></li>
            <li><Link to="/dashboard" className="hover:text-red-500 cursor-pointer">Suivi de commande</Link></li>
          </ul>
        </div>

        {/* AIDE */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Services & Aide
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-red-500 cursor-pointer">Centre d’aide</Link></li>
            <li><Link to="/help" className="hover:text-red-500 cursor-pointer">Retours & remboursements</Link></li>
            <li><Link to="/terms" className="hover:text-red-500 cursor-pointer">Conditions d’utilisation</Link></li>
            <li><Link to="/privacy" className="hover:text-red-500 cursor-pointer">Politique de confidentialité</Link></li>
          </ul>
        </div>

        {/* CATÉGORIES */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Catégories populaires
          </h3>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 5).map(cat => (
              <li key={cat.id}>
                <Link to={`/category-page/${cat.slug || cat.id}`} className="hover:text-red-500 cursor-pointer">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="bg-gray-900 text-gray-300 text-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>
            © {new Date().getFullYear()} {siteName || "TFExpress"}. Tous droits réservés.
          </span>
          <div className="text-right text-xs">
            {siteAddress && <p>{siteAddress}</p>}
            {supportPhone && <p>{supportPhone}</p>}
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
