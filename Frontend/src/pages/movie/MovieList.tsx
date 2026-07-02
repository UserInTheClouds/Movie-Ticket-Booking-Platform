import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, Star } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function MovieList() {
    const [movies, setMovies] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const moviesRes = await fetchWithAuth('/api/movies');
                if (moviesRes.ok) {
                    const moviesData = await moviesRes.json();
                    if (Array.isArray(moviesData)) setMovies(moviesData);
                }
            } catch (err) {
                console.error("Error loading movies", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const displayedMovies = movies.filter(m => m.status === activeTab);

    const handleImageError = (id: string) => {
        setFailedImages(prev => ({ ...prev, [id]: true }));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans">
            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-4 flex items-center shadow-sm sticky top-0 z-30">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-[#1a1a24]">All Movies</h1>
            </div>

            {/* Tabs */}
            <div className="flex justify-center space-x-8 text-[15px] font-semibold bg-white border-b border-gray-100">
                <button 
                    className={`transition-colors py-4 cursor-pointer ${activeTab === 'NOW_SHOWING' ? 'text-[#584cf4] border-b-2 border-[#584cf4]' : 'text-gray-500'}`} 
                    onClick={() => setActiveTab('NOW_SHOWING')}
                >
                    Now Showing
                </button>
                <button 
                    className={`transition-colors py-4 cursor-pointer ${activeTab === 'COMING_SOON' ? 'text-[#584cf4] border-b-2 border-[#584cf4]' : 'text-gray-500'}`} 
                    onClick={() => setActiveTab('COMING_SOON')}
                >
                    Coming Soon
                </button>
            </div>

            {/* Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-full aspect-[2/3] bg-gray-200 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : displayedMovies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="text-4xl mb-4">🎬</span>
                        <p>No movies in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {displayedMovies.map((movie) => (
                            <div key={movie._id} className="cursor-pointer group" onClick={() => navigate(`/movie/${movie._id}`)}>
                                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm mb-3 bg-black">
                                    {failedImages[movie._id] ? (
                                        <>
                                            <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50" />
                                            <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt={movie.title} className="absolute inset-0 w-full h-full object-contain py-2 group-hover:scale-105 transition-transform duration-300" />
                                        </>
                                    ) : (
                                        <img src={movie.posterUrl || movie.bannerUrl} alt={movie.title} onError={() => handleImageError(movie._id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    )}
                                </div>
                                <h3 className="font-bold text-[#1a1a24] text-[15px] leading-tight mb-1 line-clamp-1">{movie.title}</h3>
                                <p className="text-xs text-gray-500 truncate mb-1">{movie.genres?.join(', ') || movie.ageRating}</p>
                                <div className="flex items-center text-xs font-bold text-gray-700">
                                    <Star size={12} className="text-[#facc15] fill-[#facc15] mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
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
