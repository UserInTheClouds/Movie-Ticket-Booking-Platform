import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import BottomNav from '../../components/BottomNav';
import { Search, Star, MapPin } from 'lucide-react';

export default function Home() {
    const [movies, setMovies] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const res = await fetchWithAuth('/api/movies');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMovies(data);
                    } else {
                        console.error("API returned non-array data:", data);
                    }
                }
            } catch (err) {
                console.error("Error loading movies", err);
            }
        };
        loadMovies();
    }, []);

    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies]);

    const displayedMovies = (Array.isArray(movies) ? movies : []).filter(m => m.status === activeTab);
    const featuredMovie = movies[featuredIndex];

    const handleImageError = (id: string) => {
        setFailedImages(prev => ({ ...prev, [id]: true }));
    };

    const mockTheatres = [
        { id: 1, name: "The Grandview", location: "Camp Aguinaldo, Quezon City", icon: "🎬" },
        { id: 2, name: "Play Loft", location: "Aurora Boulevard, Santa Mesa", icon: "🎪" },
        { id: 3, name: "CinemaOne", location: "A Cruz, Pasay City", icon: "🎞️" }
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans">
            {/* Featured Banner */}
            <div className="relative h-[220px] w-full bg-black overflow-hidden shadow-md group">
                {/* Carousel Track */}
                <div 
                    className="flex h-full w-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
                >
                    {movies.map((movie, idx) => (
                        <div key={movie._id || idx} className="h-full w-full flex-shrink-0 relative bg-black">
                            {failedImages[movie._id] ? (
                                <>
                                    {/* Blurred Wikipedia fallback */}
                                    <img 
                                        src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} 
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50"
                                    />
                                    <img 
                                        src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} 
                                        alt={movie.title}
                                        className="relative w-full h-full object-contain py-2"
                                    />
                                </>
                            ) : (
                                <img 
                                    src={movie.bannerUrl} 
                                    alt={movie.title}
                                    className="w-full h-full object-cover opacity-90"
                                    onError={() => handleImageError(movie._id)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Gradient Overlay for premium look */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent opacity-80 pointer-events-none"></div>
                
                <div className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full backdrop-blur-md z-10 cursor-pointer">
                    <Search size={20} />
                </div>
                
                {featuredMovie && (
                    <div className="absolute bottom-4 left-4 text-white z-10 pointer-events-none transition-all duration-300">
                        <h2 className="text-xl font-bold drop-shadow-md">{featuredMovie.title}</h2>
                        <p className="text-xs text-gray-300 drop-shadow-md mt-1">{featuredMovie.formats?.join(', ')} • {featuredMovie.ageRating}</p>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex justify-between items-center px-4 py-6">
                <div className="flex space-x-6 text-[15px] font-semibold">
                    <button 
                        className={`transition-colors hover:text-[#584cf4] cursor-pointer ${activeTab === 'NOW_SHOWING' ? 'text-[#584cf4] border-b-2 border-[#584cf4] pb-1' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('NOW_SHOWING')}
                    >
                        Now Showing
                    </button>
                    <button 
                        className={`transition-colors hover:text-[#584cf4] cursor-pointer ${activeTab === 'COMING_SOON' ? 'text-[#584cf4] border-b-2 border-[#584cf4] pb-1' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('COMING_SOON')}
                    >
                        Coming Soon
                    </button>
                </div>
                <button className="text-[#584cf4] text-sm font-medium hover:underline cursor-pointer">View All</button>
            </div>

            {/* Movie List (Horizontal Scroll) */}
            <div className="flex overflow-x-auto px-4 pb-6 space-x-4 hide-scrollbar">
                {displayedMovies.map((movie) => (
                    <div 
                        key={movie._id} 
                        className="flex-shrink-0 w-[140px] cursor-pointer group"
                        onClick={() => navigate(`/movie/${movie._id}`)}
                    >
                        <div className="relative w-full h-[200px] rounded-xl overflow-hidden shadow-sm mb-3 bg-black">
                            {failedImages[movie._id] ? (
                                <>
                                    <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50" />
                                    <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt={movie.title} className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                </>
                            ) : (
                                <img src={movie.bannerUrl} alt={movie.title} onError={() => handleImageError(movie._id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            )}
                            <div className="absolute bottom-2 right-2 bg-[#09090f] text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-lg">
                                <Star size={12} className="text-white fill-white mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
                            </div>
                        </div>
                        <h3 className="font-bold text-[#1a1a24] text-[15px] leading-tight mb-1 line-clamp-2">{movie.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{movie.formats?.join(', ') || movie.ageRating}</p>
                    </div>
                ))}
            </div>

            {/* Movie Theatres */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[18px] font-bold text-[#1a1a24]">Movie Theatres</h2>
                    <button className="text-[#584cf4] text-sm font-medium hover:underline cursor-pointer">View All</button>
                </div>
                
                <div className="space-y-3">
                    {mockTheatres.map(theatre => (
                        <div 
                            key={theatre.id} 
                            onClick={() => alert(`Navigating to movies in ${theatre.name}`)}
                            className="flex items-center p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl mr-4">
                                {theatre.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-[#1a1a24] text-[15px]">{theatre.name}</h4>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                    <MapPin size={12} className="mr-1" /> {theatre.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}