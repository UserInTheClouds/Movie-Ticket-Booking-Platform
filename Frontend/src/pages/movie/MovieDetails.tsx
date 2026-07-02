import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, Heart, Star, PlayCircle, PauseCircle, ExternalLink } from 'lucide-react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import BottomNav from '../../components/BottomNav';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../../store/favoritesSlice';
import { type RootState } from '../../store/store';

export default function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const favoriteIds = useSelector((state: RootState) => state.favorites.movieIds);
    const isFavorite = id ? favoriteIds.includes(id) : false;

    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imageFailed, setImageFailed] = useState(false);
    
    const [isUIVisible, setIsUIVisible] = useState(true);
    
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (isUIVisible) {
            timeout = setTimeout(() => {
                setIsUIVisible(false);
            }, 700);
        }
        return () => clearTimeout(timeout);
    }, [isUIVisible]);

    const handleInteraction = () => {
        setIsUIVisible(true);
    };
    
    const [player, setPlayer] = useState<YouTubePlayer>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [indicator, setIndicator] = useState<'play' | 'pause' | null>(null);

    useEffect(() => {
        if (indicator) {
            const timer = setTimeout(() => setIndicator(null), 700);
            return () => clearTimeout(timer);
        }
    }, [indicator]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
            setIsPlaying(false);
            setIndicator('pause');
        } else {
            player.playVideo();
            setIsPlaying(true);
            setIndicator('play');
        }
    };

    const onReady = (event: YouTubeEvent) => {
        setPlayer(event.target);
        event.target.playVideo();
    };
    
    const onStateChange = (event: YouTubeEvent) => {
        if (event.data === YouTube.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === YouTube.PlayerState.PAUSED) {
            setIsPlaying(false);
        }
    };

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            iv_load_policy: 3,
            disablekb: 1,
        },
    };

    const getYoutubeVideoId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

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

    const trailerId = movie?.trailerYoutubeUrl ? getYoutubeVideoId(movie.trailerYoutubeUrl) : null;

    return (
        <div className="min-h-screen bg-white pb-32 font-sans relative">
            {/* Top Banner Area */}
            <div 
                className="relative h-[220px] w-full bg-black overflow-hidden"
                onMouseMove={handleInteraction}
                onTouchStart={handleInteraction}
                onClick={handleInteraction}
            >
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none transition-opacity duration-300">
                    <button onClick={() => navigate(-1)} className="text-white flex items-center text-sm font-medium pointer-events-auto drop-shadow-md">
                        <ChevronLeft size={24} /> Back
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); if (id) dispatch(toggleFavorite(id)); }}
                        className={`pointer-events-auto drop-shadow-md transition-all duration-300 ${isUIVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isFavorite ? 'text-red-500 hover:text-red-400' : 'text-white hover:text-gray-200'}`}
                    >
                        <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {trailerId ? (
                    <div className="relative w-full h-full bg-black">
                        <YouTube 
                            videoId={trailerId} 
                            opts={opts} 
                            onReady={onReady}
                            onStateChange={onStateChange}
                            className="absolute top-1/2 left-1/2 w-[152%] h-[152%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            iframeClassName="w-full h-full pointer-events-none"
                        />

                        {/* Click overlay to toggle play/pause */}
                        <div 
                            className="absolute inset-0 z-20 cursor-pointer" 
                            onClick={togglePlay}
                        ></div>

                        {/* Open on YouTube Button */}
                        <a 
                            href={`https://www.youtube.com/watch?v=${trailerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`absolute bottom-4 right-4 z-30 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium backdrop-blur-md transition-all duration-300 border border-white/20 pointer-events-auto ${isUIVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
                        >
                            <ExternalLink size={14} /> Open on YouTube
                        </a>

                        {/* Play/Pause indicator overlay */}
                        {indicator && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-300">
                                <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm animate-in zoom-in duration-200">
                                    {indicator === 'play' ? (
                                        <PlayCircle size={64} className="text-white opacity-90" strokeWidth={1.5} />
                                    ) : (
                                        <PauseCircle size={64} className="text-white opacity-90" strokeWidth={1.5} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                                className={`w-full h-full object-cover ${movie.title?.toLowerCase().includes('kraven') ? 'object-[75%_center]' : 'object-center'}`}
                                onError={handleImageError}
                            />
                        )}
                    </>
                )}
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
                <p className="text-gray-500 text-sm mb-6">{movie.genres?.join(', ')}</p>

                <p className="text-[#6b7280] text-[14px] leading-relaxed mb-6">
                    {movie.description}
                </p>

                {/* Formats */}
                <div className="mb-6">
                    <h3 className="text-[16px] font-bold text-[#1a1a24] mb-3">Format Available</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {movie.formats?.map((format: string) => (
                            <span key={format} className="border border-[#e5e7eb] text-[#584cf4] px-4 py-1.5 rounded-md text-sm font-medium">
                                {format}
                            </span>
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
            <div className="fixed bottom-[64px] left-0 right-0 w-full sm:max-w-[390px] mx-auto p-4 bg-white border-t border-gray-100 z-40">
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
