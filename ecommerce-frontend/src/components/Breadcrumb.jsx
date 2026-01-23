import { Link, useNavigate } from "react-router-dom";

const Breadcrumb = ({ category, productName }) => {
  const navigate = useNavigate();

  return (
    <nav className="text-sm text-gray-500 mb-6">
      <ol className="flex items-center gap-2 flex-wrap">

        {/* Accueil */}
        <li>
          <Link to="/" className="hover:text-red-500">
            Accueil
          </Link>
        </li>

        <li>/</li>

        {/* Retour à la page précédente */}
        <li>
          <button
            onClick={() => navigate(-1)}
            className="hover:text-red-500 capitalize"
          >
            {category && typeof category === 'object' && category.name ? category.name : (typeof category === 'string' ? category : "Boutique")}
          </button>
        </li>

        <li>/</li>

        {/* Produit courant */}
        <li className="text-gray-800 font-medium line-clamp-1">
          {productName}
        </li>

      </ol>
    </nav>
  );
};

export default Breadcrumb;

