const BackButton = ({ onClick }) => (
  <div className="absolute left-0 top-0 flex-row items-center">
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white">
      <ChevronLeft size={24} color="rgba(0, 0, 0, 0.7)" />
    </button>
  </div>
);
