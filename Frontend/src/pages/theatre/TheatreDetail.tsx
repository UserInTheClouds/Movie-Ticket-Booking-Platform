import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, MapPin, Star } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function TheatreDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [theatre, setTheatre] = useState<any>(null);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch theatre details
                const theatreRes = await fetchWithAuth(`/api/theatres/${id}`);
                
                // Fetch all movies (as all movies play at all theatres currently)
                const moviesRes = await fetchWithAuth('/api/movies');
                
                if (theatreRes.ok && moviesRes.ok) {
                    const theatreData = await theatreRes.json();
                    const moviesData = await moviesRes.json();
                    
                    setTheatre(theatreData);
                    if (Array.isArray(moviesData)) setMovies(moviesData);
                }
            } catch (err) {
                console.error("Error loading theatre details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadData();
    }, [id]);

    const handleImageError = (movieId: string) => {
        setFailedImages(prev => ({ ...prev, [movieId]: true }));
    };

    if (loading) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Loading...</div>;
    if (!theatre) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Theatre not found.</div>;

    return (
        <div className="min-h-screen bg-white pb-32 font-sans flex flex-col">
            {/* Header / Banner */}
            <div className="relative h-[240px] w-full bg-black overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/60 to-transparent z-10 opacity-90"></div>
                
                {theatre.logoUrl ? (
                    <img 
                        src={theatre.logoUrl} 
                        alt={theatre.name} 
                        className="absolute inset-0 w-full h-full object-cover blur-sm opacity-60 scale-110" 
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-[#1a1a24] opacity-80"></div>
                )}
                
                <div className="relative z-20 w-full h-full text-white flex flex-col">
                    {/* Top Action Bar */}
                    <div className="p-4 pt-6 flex justify-between items-center">
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium drop-shadow-md hover:text-gray-300 transition-colors">
                            <ChevronLeft size={24} /> Back
                        </button>
                    </div>
                    
                    {/* Bottom Theatre Details */}
                    <div className="mt-auto p-5 flex items-end">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl overflow-hidden shadow-lg mr-4 flex-shrink-0 border-2 border-white/20">
                            {theatre.logoUrl ? (
                                <img src={theatre.logoUrl} alt={theatre.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>🎬</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1 drop-shadow-lg text-white">{theatre.name}</h1>
                            <p className="text-sm text-gray-200 drop-shadow-md font-medium flex items-center">
                                <MapPin size={14} className="mr-1.5" /> {theatre.location}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movies List */}
            <div className="px-5 mt-8 flex-1">
                <h2 className="text-[20px] font-bold text-[#1a1a24] mb-6 border-b border-gray-100 pb-4">Now Showing Here</h2>
                
                {movies.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No movies available at this theatre.</div>
                ) : (
                    <div className="space-y-4">
                        {movies.map(movie => (
                            <div 
                                key={movie._id} 
                                onClick={() => navigate(`/movie/${movie._id}`)} 
                                className="flex space-x-4 p-3 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100 group shadow-sm hover:shadow-md"
                            >
                                <div className="w-24 h-36 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    {failedImages[movie._id] ? (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                    ) : (
                                        <img src={movie.posterUrl || movie.bannerUrl} alt={movie.title} onError={() => handleImageError(movie._id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                                        <Star size={10} className="text-[#facc15] fill-[#facc15] mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="font-bold text-[#1a1a24] text-[16px] mb-1 group-hover:text-[#584cf4] transition-colors line-clamp-2">{movie.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2 font-medium">{movie.genres?.join(', ')}</p>
                                    <span className="inline-block border border-gray-200 bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-3">
                                        {movie.ageRating}
                                    </span>
                                    <div className="mt-auto">
                                        <button className="w-full py-2 bg-[#584cf4]/10 text-[#584cf4] text-sm font-bold rounded-lg group-hover:bg-[#584cf4] group-hover:text-white transition-colors">
                                            Book Tickets
                                        </button>
                                    </div>
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
