import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    isDestructive = false,
    verificationText = "" // If provided, user must type this to enable confirm
}) {
    const [inputValue, setInputValue] = useState("");
    const isDisabled = verificationText && inputValue !== verificationText;

    useEffect(() => {
        if (isOpen) setInputValue("");
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* MODAL */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Verification Input */}
                    {verificationText && (
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Tapez <span className="text-black select-none pointer-events-none">"{verificationText}"</span> pour confirmer
                            </label>
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl font-mono text-center focus:outline-none focus:ring-2 transition-all
                                    ${inputValue === verificationText
                                        ? 'border-green-500 ring-green-100 bg-green-50 text-green-700'
                                        : 'border-gray-200 focus:ring-black'
                                    }
                                `}
                                placeholder={verificationText}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                if (!isDisabled) {
                                    onConfirm();
                                    onClose();
                                }
                            }}
                            disabled={isDisabled}
                            className={`px-4 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                    : 'bg-black hover:bg-gray-800 shadow-gray-200'
                                }
                            `}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
