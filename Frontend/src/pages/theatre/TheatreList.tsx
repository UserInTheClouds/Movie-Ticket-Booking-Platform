import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, MapPin } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function TheatreList() {
    const [theatres, setTheatres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const theatresRes = await fetchWithAuth('/api/theatres');
                if (theatresRes.ok) {
                    const theatresData = await theatresRes.json();
                    if (Array.isArray(theatresData)) setTheatres(theatresData);
                }
            } catch (err) {
                console.error("Error loading theatres", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-4 flex items-center shadow-sm sticky top-0 z-30">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-[#1a1a24]">All Theatres</h1>
            </div>

            {/* List */}
            <div className="p-4 flex-1">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center p-4 bg-white rounded-xl shadow-sm animate-pulse border border-transparent">
                                <div className="w-14 h-14 bg-gray-200 rounded-xl mr-4"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : theatres.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="text-4xl mb-4">🏛️</span>
                        <p>No theatres available right now.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {theatres.map(theatre => (
                            <div 
                                key={theatre._id} 
                                onClick={() => navigate(`/theatre/${theatre._id}`)} 
                                className="flex items-center p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
                            >
                                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mr-4 overflow-hidden shadow-sm group-hover:shadow transition-shadow">
                                    {theatre.logoUrl ? (
                                        <img src={theatre.logoUrl} alt={theatre.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>🎬</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#1a1a24] text-[16px] mb-1 group-hover:text-[#584cf4] transition-colors">{theatre.name}</h4>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <MapPin size={14} className="mr-1.5" /> {theatre.location}
                                    </p>
                                    <p className="text-sm font-bold text-gray-500 mt-1.5">
                                        {theatre.name.toLowerCase().includes('inox') ? '₹200 - ₹300' : theatre.name.toLowerCase().includes('pvr') ? '₹250 - ₹400' : '₹200 - ₹400'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
