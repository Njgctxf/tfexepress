const LoadingButton = ({ loading, children }) => {
  return (
    <button
      disabled={loading}
      className={`
        w-full py-3 rounded-xl font-semibold
        flex items-center justify-center gap-2
        bg-yellow-400 hover:bg-yellow-500 text-black
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {loading && (
        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default LoadingButton;
