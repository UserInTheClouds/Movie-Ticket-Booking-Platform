import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, Heart, Star } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function MovieBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imageFailed, setImageFailed] = useState(false);

    const handleImageError = () => {
        setImageFailed(true);
    };

    const handleCastError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200";
    };

    useEffect(() => {
        const loadMovie = async () => {
            try {
                const res = await fetchWithAuth(`/api/movies/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMovie(data);
                }
            } catch (err) {
                console.error("Error loading movie", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadMovie();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Movie not found.</div>;

    const formattedDate = new Date(movie.releaseDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white pb-32 font-sans relative">
            {/* Top Banner Area */}
            <div className="relative h-[280px] w-full bg-black rounded-b-[2rem] overflow-hidden">
                {imageFailed ? (
                    <>
                        <img 
                            src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} 
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110"
                        />
                        <img 
                            src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1000"} 
                            alt={movie.title}
                            className="relative w-full h-full object-contain pt-10 pb-4"
                        />
                    </>
                ) : (
                    <img 
                        src={movie.bannerUrl} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                )}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
                    <button onClick={() => navigate(-1)} className="text-white flex items-center text-sm font-medium">
                        <ChevronLeft size={24} /> Close
                    </button>
                    <button className="text-white">
                        <Heart size={24} />
                    </button>
                </div>
            </div>

            {/* Movie Info */}
            <div className="px-5 pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center flex-wrap gap-2">
                        <h1 className="text-[22px] font-bold text-[#1a1a24]">{movie.title}</h1>
                        <span className="border border-[#584cf4] text-[#584cf4] text-[10px] font-bold px-2 py-0.5 rounded-sm ml-2">
                            {movie.ageRating}
                        </span>
                    </div>
                    <div className="flex items-center text-[15px] font-bold">
                        <Star size={16} className="text-[#1a1a24] fill-[#1a1a24] mr-1" /> {movie.starRating ? movie.starRating.toFixed(1) : 'N/A'}
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-6">{movie.formats?.join(', ')}</p>

                <p className="text-[#6b7280] text-[14px] leading-relaxed mb-6">
                    {movie.description}
                </p>

                {/* Formats */}
                <div className="mb-6">
                    <h3 className="text-[16px] font-bold text-[#1a1a24] mb-3">Format Available</h3>
                    <div className="flex gap-3">
                        {movie.formats?.map((format: string) => (
                            <div key={format} className="border border-[#e5e7eb] text-[#584cf4] px-4 py-1.5 rounded-md text-sm font-medium">
                                {format}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Release Date */}
                <div className="mb-6">
                    <h3 className="text-[16px] font-bold text-[#1a1a24] mb-1">Release Date</h3>
                    <p className="text-gray-500 text-sm">{formattedDate}</p>
                </div>

                {/* Cast */}
                <div className="mb-8">
                    <h3 className="text-[16px] font-bold text-[#1a1a24] mb-4">Cast</h3>
                    <div className="flex overflow-x-auto space-x-4 hide-scrollbar">
                        {movie.cast?.map((actor: any, index: number) => (
                            <div key={index} className="flex flex-col items-center flex-shrink-0 w-20">
                                <img src={actor.imageUrl} alt={actor.name} onError={handleCastError} className="w-14 h-14 rounded-full object-cover mb-2 border border-gray-100" />
                                <span className="text-[13px] font-bold text-center leading-tight text-[#1a1a24] line-clamp-2">{actor.name}</span>
                                <span className="text-[11px] text-gray-500 text-center truncate w-full">{actor.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action */}
            <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
                <button 
                    onClick={() => navigate(`/movie/${movie._id}/schedule`)}
                    className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors shadow-lg shadow-[#584cf4]/30"
                >
                    Get Tickets
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
