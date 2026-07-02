import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { logOut } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import BottomNav from '../../components/BottomNav';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            dispatch(logOut());
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans flex flex-col">
            <div className="bg-[#584cf4] h-32 w-full absolute top-0 left-0 z-0 rounded-b-3xl"></div>
            
            <div className="relative z-10 px-4 pt-16">
                <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#eef0fc] text-[#584cf4] rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
                        {initial}
                    </div>
                    <h2 className="text-xl font-bold text-[#1a1a24]">{user?.displayName || 'User'}</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="border-b border-gray-100">
                        <button 
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            onClick={() => setShowAccountDetails(!showAccountDetails)}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-3">
                                    <User size={20} />
                                </div>
                                <span className="font-bold text-[#1a1a24] text-[15px]">Account Details</span>
                            </div>
                            <ChevronRight size={20} className={`text-gray-400 transition-transform ${showAccountDetails ? 'rotate-90' : ''}`} />
                        </button>
                        {showAccountDetails && (
                            <div className="px-16 pb-4 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                                <p className="text-[#1a1a24] font-bold mt-1">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors" onClick={() => navigate('/tickets')}>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mr-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
                            </div>
                            <span className="font-bold text-[#1a1a24] text-[15px]">My Bookings</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full bg-white text-red-500 rounded-2xl p-4 flex items-center justify-center font-bold text-[16px] shadow-sm hover:bg-red-50 transition-colors border border-red-100"
                >
                    <LogOut size={20} className="mr-2" />
                    Log Out
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
