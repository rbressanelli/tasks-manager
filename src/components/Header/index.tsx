const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="fixed z-[1000] w-full bg-white opacity-50 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-[10px] p-[10px] rounded-[5px]">
        <button
          onClick={toggleSidebar}
          className="text-[24px] cursor-pointer hover:bg-[#ddd] p-[5px] rounded-[5px] transition-colors duration-300 ease-in-out"
        >
          ☰
        </button>
      </div>
    </div>
  );
};

export default Header;
