import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import BottomNav from '../../components/BottomNav';
import { Search, Star, MapPin } from 'lucide-react';

export default function Home() {
    const [movies, setMovies] = useState<any[]>([]);
    const [theatres, setTheatres] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    
    // Search states
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [moviesRes, theatresRes] = await Promise.all([
                    fetchWithAuth('/api/movies'),
                    fetchWithAuth('/api/theatres')
                ]);

                if (moviesRes.ok && theatresRes.ok) {
                    const moviesData = await moviesRes.json();
                    const theatresData = await theatresRes.json();

                    if (Array.isArray(moviesData)) setMovies(moviesData);
                    if (Array.isArray(theatresData)) setTheatres(theatresData);
                }
            } catch (err) {
                console.error("Error loading home data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
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

    const handleImageLoad = (id: string) => {
        setLoadedImages(prev => ({ ...prev, [id]: true }));
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-24 font-sans">
            {/* Featured Banner */}
            {loading ? (
                <div className="relative h-[220px] w-full bg-gray-200 animate-pulse"></div>
            ) : (
                <div 
                    className="relative h-[220px] w-full bg-black overflow-hidden shadow-md group cursor-pointer"
                    onClick={() => featuredMovie && navigate(`/movie/${featuredMovie._id}`)}
                >
                    {/* Carousel Track */}
                    <div 
                        className="flex h-full w-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${featuredIndex * 100}%)` }}
                    >
                        {movies.map((movie, idx) => (
                            <div key={movie._id || idx} className={`h-full w-full flex-shrink-0 relative ${loadedImages[`featured_${movie._id}`] ? 'bg-black' : 'bg-gray-200'}`}>
                                {failedImages[movie._id] ? (
                                    <>
                                        <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50" />
                                        <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt={movie.title} className="relative w-full h-full object-contain py-2" />
                                    </>
                                ) : (
                                    <img 
                                        src={movie.bannerUrl} 
                                        alt={movie.title} 
                                        onLoad={() => handleImageLoad(`featured_${movie._id}`)}
                                        onError={() => handleImageError(movie._id)}
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${loadedImages[`featured_${movie._id}`] ? 'opacity-90' : 'opacity-0'} ${movie.title?.toLowerCase().includes('kraven') ? 'object-[75%_center]' : 'object-center'}`} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    
                    <div 
                        className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full backdrop-blur-md z-10 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setIsSearching(true); }}
                    >
                        <Search size={20} />
                    </div>
                    
                    {featuredMovie && (
                        <div className="absolute bottom-4 left-4 text-white z-10 pointer-events-none transition-all duration-300">
                            <h2 className="text-xl font-bold drop-shadow-md">{featuredMovie.title}</h2>
                            <p className="text-xs text-gray-300 drop-shadow-md mt-1">{featuredMovie.genres?.join(', ')} • {featuredMovie.ageRating}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex justify-between items-center px-4 py-6">
                <div className="flex space-x-6 text-[15px] font-semibold">
                    <button className={`transition-colors hover:text-[#584cf4] cursor-pointer ${activeTab === 'NOW_SHOWING' ? 'text-[#584cf4] border-b-2 border-[#584cf4] pb-1' : 'text-gray-500'}`} onClick={() => setActiveTab('NOW_SHOWING')}>Now Showing</button>
                    <button className={`transition-colors hover:text-[#584cf4] cursor-pointer ${activeTab === 'COMING_SOON' ? 'text-[#584cf4] border-b-2 border-[#584cf4] pb-1' : 'text-gray-500'}`} onClick={() => setActiveTab('COMING_SOON')}>Coming Soon</button>
                </div>
                <button onClick={() => navigate('/movies')} className="text-[#584cf4] text-sm font-medium hover:underline cursor-pointer">View All</button>
            </div>

            {/* Movie List */}
            <div className="flex overflow-x-auto px-4 pb-6 space-x-4 hide-scrollbar min-h-[280px]">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[140px] animate-pulse">
                            <div className="w-full h-[200px] bg-gray-200 rounded-xl mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))
                ) : displayedMovies.length === 0 ? (
                    <div className="w-full flex items-center justify-center h-[200px] text-gray-400 text-sm">
                        No movies currently in this category.
                    </div>
                ) : (
                    displayedMovies.map((movie) => (
                        <div key={movie._id} className="flex-shrink-0 w-[140px] cursor-pointer group" onClick={() => navigate(`/movie/${movie._id}`)}>
                            <div className={`relative w-full h-[200px] rounded-xl overflow-hidden shadow-sm mb-3 ${loadedImages[`list_${movie._id}`] ? 'bg-black' : 'bg-gray-200'}`}>
                                {failedImages[movie._id] ? (
                                    <>
                                        <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-50" />
                                        <img src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} alt={movie.title} className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                    </>
                                ) : (
                                    <img 
                                        src={movie.posterUrl || movie.bannerUrl} 
                                        alt={movie.title} 
                                        onLoad={() => handleImageLoad(`list_${movie._id}`)}
                                        onError={() => handleImageError(movie._id)} 
                                        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${loadedImages[`list_${movie._id}`] ? 'opacity-100' : 'opacity-0'}`} 
                                    />
                                )}
                            </div>
                            <h3 className="font-bold text-[#1a1a24] text-[15px] leading-tight mb-1 line-clamp-2">{movie.title}</h3>
                            <p className="text-xs text-gray-500 truncate mb-1">{movie.genres?.join(', ') || movie.ageRating}</p>
                            <div className="flex items-center text-xs font-bold text-gray-700">
                                <Star size={12} className="text-[#facc15] fill-[#facc15] mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Movie Theatres */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[18px] font-bold text-[#1a1a24]">Movie Theatres</h2>
                    <button onClick={() => navigate('/theatres')} className="text-[#584cf4] text-sm font-medium hover:underline cursor-pointer">View All</button>
                </div>
                
                <div className="space-y-3">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-transparent animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))
                    ) : theatres.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-4">No theatres found</div>
                    ) : (
                        theatres.slice(0, 3).map(theatre => (
                            <div key={theatre._id} onClick={() => navigate(`/theatre/${theatre._id}`)} className="flex items-center p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl mr-4 overflow-hidden shadow-sm">
                                    {theatre.logoUrl ? (
                                        <img src={theatre.logoUrl} alt={theatre.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>🎬</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#1a1a24] text-[15px]">{theatre.name}</h4>
                                    <p className="text-xs text-gray-500 flex items-center mt-1">
                                        <MapPin size={12} className="mr-1" /> {theatre.location}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500 mt-1">
                                        {theatre.name.toLowerCase().includes('inox') ? '₹200 - ₹300' : theatre.name.toLowerCase().includes('pvr') ? '₹250 - ₹400' : '₹200 - ₹400'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Search Overlay */}
            {isSearching && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center p-4 border-b border-gray-100 shadow-sm">
                        <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Search for movies..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#584cf4]/50 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {searchQuery.length > 0 ? (
                            movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(movie => (
                                    <div key={movie._id} onClick={() => navigate(`/movie/${movie._id}`)} className="flex items-start space-x-4 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="w-16 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                            {failedImages[movie._id] ? (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                            ) : (
                                                <img src={movie.posterUrl || movie.bannerUrl} alt={movie.title} onError={() => handleImageError(movie._id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            )}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="font-bold text-[#1a1a24] text-[16px] mb-1 group-hover:text-[#584cf4] transition-colors">{movie.title}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{movie.genres?.join(', ')} • {movie.ageRating}</p>
                                            <div className="flex items-center text-xs font-bold text-gray-700 bg-gray-100 w-max px-2 py-1 rounded">
                                                <Star size={12} className="text-[#584cf4] fill-[#584cf4] mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 font-medium">No movies found for "{searchQuery}"</div>
                            )
                        ) : (
                            <div className="text-center py-10 text-gray-400">Type something to search...</div>
                        )}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}