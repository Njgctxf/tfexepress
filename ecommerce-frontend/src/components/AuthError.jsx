import { AlertCircle } from "lucide-react";

const AuthError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
      <AlertCircle size={18} />
      {message}
    </div>
  );
};

export default AuthError;
