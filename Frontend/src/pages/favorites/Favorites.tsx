import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { Star } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function Favorites() {
    const favoriteIds = useSelector((state: RootState) => state.favorites.movieIds);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const loadFavorites = async () => {
            if (favoriteIds.length === 0) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // In a production app with pagination, we'd have an endpoint that takes an array of IDs
                // Here, we just fetch all movies and filter
                const res = await fetchWithAuth('/api/movies');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMovies(data.filter(m => favoriteIds.includes(m._id)));
                    }
                }
            } catch (err) {
                console.error("Error loading favorite movies", err);
            } finally {
                setLoading(false);
            }
        };
        loadFavorites();
    }, [favoriteIds]);

    const handleImageError = (id: string) => {
        setFailedImages(prev => ({ ...prev, [id]: true }));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-6 shadow-sm sticky top-0 z-30">
                <h1 className="text-2xl font-bold text-[#1a1a24]">My Favorites</h1>
                <p className="text-sm text-gray-500 mt-1">Movies you've saved</p>
            </div>

            {/* List */}
            <div className="p-4 flex-1">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-full aspect-[2/3] bg-gray-200 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <span className="text-5xl mb-4">💔</span>
                        <p className="text-lg font-medium text-[#1a1a24] mb-2">No favorites yet</p>
                        <p className="text-sm text-center px-8">Tap the heart icon on any movie to save it to your favorites list.</p>
                        <button 
                            onClick={() => navigate('/home')}
                            className="mt-6 bg-[#584cf4] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#483de0] transition-colors"
                        >
                            Browse Movies
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {movies.map((movie) => (
                            <div key={movie._id} className="cursor-pointer group" onClick={() => navigate(`/movie/${movie._id}`)}>
                                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm mb-3 bg-black border border-transparent group-hover:border-[#584cf4]/30 transition-all">
                                    {failedImages[movie._id] ? (
                                        <>
                                            <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50" />
                                            <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt={movie.title} className="absolute inset-0 w-full h-full object-contain py-2 group-hover:scale-105 transition-transform duration-300" />
                                        </>
                                    ) : (
                                        <img src={movie.posterUrl || movie.bannerUrl} alt={movie.title} onError={() => handleImageError(movie._id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    )}
                                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                    </div>
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
