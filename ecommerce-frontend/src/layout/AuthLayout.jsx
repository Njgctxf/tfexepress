const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* LEFT (FORM) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          {children}
        </div>
      </div>

      {/* RIGHT (DESKTOP ONLY) */}
      <div className="hidden lg:flex w-1/2 bg-yellow-400 items-center justify-center">
        <div className="max-w-md text-black px-10">
          <h2 className="text-3xl font-extrabold mb-4">
            Bienvenue sur TFExpress
          </h2>
          <p className="mb-6">
            Créez votre compte et profitez d’une expérience
            d’achat rapide et sécurisée.
          </p>
          <ul className="space-y-2 font-medium">
            <li>✓ Livraison rapide</li>
            <li>✓ Paiement sécurisé</li>
            <li>✓ Produits vérifiés</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
