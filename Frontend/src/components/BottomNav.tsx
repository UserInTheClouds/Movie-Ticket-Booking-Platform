import { Home, Ticket, Heart, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/home', icon: Home },
    { path: '/tickets', icon: Ticket },
    { path: '/favorites', icon: Heart },
    { path: '/profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full sm:max-w-[390px] mx-auto bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-[#584cf4]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={24} className={isActive ? 'stroke-2' : 'stroke-[1.5]'} />
          </button>
        );
      })}
    </div>
  );
}
