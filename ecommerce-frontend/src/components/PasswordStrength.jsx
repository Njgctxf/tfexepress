const PasswordStrength = ({ password }) => {
  const rules = [
    { label: "Minimum 6 caractères", test: password.length >= 6 },
    { label: "Une majuscule", test: /[A-Z]/.test(password) },
    { label: "Un chiffre", test: /\d/.test(password) },
  ];

  return (
    <div className="space-y-1 mt-2">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${rule.test ? "bg-green-500" : "bg-gray-300"
              }`}
          />
          <span
            className={rule.test ? "text-green-600" : "text-gray-500"}
          >
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrength;
