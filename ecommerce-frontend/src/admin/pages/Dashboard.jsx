const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Utilisateurs</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Produits</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Commandes</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
