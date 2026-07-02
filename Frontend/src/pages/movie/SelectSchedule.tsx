import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';

export default function SelectSchedule() {
    const { id, theatreId, date } = useParams();
    const navigate = useNavigate();
    
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState<string>('');
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [movieRes, showtimesRes] = await Promise.all([
                    fetchWithAuth(`/api/movies/${id}`),
                    fetchWithAuth(`/api/showtimes/movie/${id}`)
                ]);
                
                if (movieRes.ok && showtimesRes.ok) {
                    const movieData = await movieRes.json();
                    const showtimesData = await showtimesRes.json();
                    
                    setMovie(movieData);
                    setShowtimes(showtimesData);
                }
            } catch (err) {
                console.error("Error loading schedule data", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">Data not found.</div>;

    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const theatreShowtimes = showtimes.filter(st => 
        getLocalDateString(new Date(st.startTime)) === date &&
        st.theatre._id === theatreId
    );

    const theatreName = theatreShowtimes.length > 0 ? theatreShowtimes[0].theatre.name : 'Unknown Theatre';
    const parsedDate = date ? new Date(date) : new Date();
    const dateString = parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const availableFormats = Array.from(new Set(theatreShowtimes.map(st => st.format)));
    if (!selectedFormat && availableFormats.length > 0) {
        setSelectedFormat(availableFormats[0] as string);
    }

    const formatShowtimes = theatreShowtimes.filter(st => st.format === selectedFormat);
    
    // Group by Screen
    const screens = formatShowtimes.reduce((acc: any, st: any) => {
        if (!acc[st.screenName]) acc[st.screenName] = [];
        acc[st.screenName].push(st);
        return acc;
    }, {});

    // Get min and max price for the format
    const prices = formatShowtimes.map(st => st.basePrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const priceDisplay = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

    return (
        <div className="min-h-screen bg-white pb-32 font-sans flex flex-col">
            {/* Header */}
            <div className="relative h-[220px] w-full bg-black overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a24] to-transparent z-10 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent z-10 opacity-90"></div>
                
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
                            className="absolute inset-0 w-full h-full object-contain pt-10 pb-4"
                        />
                    </>
                ) : (
                    <img 
                        src={movie.bannerUrl} 
                        alt={movie.title}
                        className={`absolute inset-0 w-full h-full object-cover opacity-70 ${movie.title?.toLowerCase().includes('kraven') ? 'object-[75%_center]' : 'object-center'}`}
                        onError={() => setImageFailed(true)}
                    />
                )}
                
                <div className="relative z-20 w-full h-full text-white">
                    {/* Top Action Bar */}
                    <div className="absolute top-0 left-0 w-full p-4 pt-6 flex justify-between items-center z-30">
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium drop-shadow-md hover:text-gray-300 transition-colors">
                            <ChevronLeft size={24} /> Back
                        </button>
                        <button className="text-sm font-medium drop-shadow-md hover:text-gray-300 transition-colors" onClick={() => navigate('/home')}>Cancel</button>
                    </div>
                    
                    {/* Bottom Left Movie Details */}
                    <div className="absolute bottom-6 left-5 z-30">
                        <h1 className="text-2xl font-bold mb-1 drop-shadow-lg text-white">{movie.title}</h1>
                        <div className="flex items-center text-xs text-gray-200 drop-shadow-md mt-2 space-x-3 font-medium">
                            <span className="flex items-center"><span className="w-3 h-3 bg-white/20 rounded-sm mr-1.5 flex items-center justify-center text-[8px]">🏛️</span> {theatreName}</span>
                            <span className="flex items-center"><span className="w-3 h-3 bg-white/20 rounded-sm mr-1.5 flex items-center justify-center text-[8px]">📅</span> {dateString}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-3 relative z-30">
                {/* Progress bar removed */}
            </div>

            {/* Choose Schedule Section */}
            <div className="px-6 mt-8 flex-1">
                <h2 className="text-[22px] font-bold text-[#1a1a24] mb-6">Choose Schedule</h2>
                
                {/* Formats */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center">
                        <span className="text-[15px] font-bold text-[#1a1a24] mr-4">Format</span>
                        <div className="flex space-x-2">
                            {availableFormats.map((fmt: any) => (
                                <button 
                                    key={fmt}
                                    onClick={() => setSelectedFormat(fmt)}
                                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors hover:border-[#584cf4] hover:bg-[#584cf4]/5 ${selectedFormat === fmt ? 'bg-[#584cf4] text-white border-[#584cf4] hover:text-white hover:bg-[#4a3fdb]' : 'border-[#e5e7eb] text-[#584cf4]'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-400">{priceDisplay}</span>
                </div>

                {/* Screens and Showtimes */}
                <div className="space-y-6 pb-20">
                    {Object.keys(screens).map(screenName => (
                        <div key={screenName}>
                            <h3 className="font-bold text-[#1a1a24] text-[15px] mb-3">{screenName}</h3>
                            <div className="flex flex-wrap gap-3">
                                {screens[screenName].map((st: any) => {
                                    const startTimeDate = new Date(st.startTime);
                                    const timeString = startTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                    const isSelected = selectedShowtimeId === st._id;
                                    const isPast = startTimeDate < new Date();
                                    
                                    let btnClass = "min-w-[80px] px-3 py-1.5 border text-xs font-bold rounded transition-colors ";
                                    if (isPast) {
                                        btnClass += "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60";
                                    } else if (isSelected) {
                                        btnClass += "bg-[#584cf4] text-white border-[#584cf4] hover:bg-[#4a3fdb]";
                                    } else {
                                        btnClass += "border-[#e5e7eb] text-[#584cf4] hover:border-[#584cf4] hover:bg-[#584cf4]/5";
                                    }

                                    return (
                                        <button 
                                            key={st._id}
                                            onClick={() => !isPast && setSelectedShowtimeId(st._id)}
                                            disabled={isPast}
                                            className={btnClass}
                                        >
                                            {timeString}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {Object.keys(screens).length === 0 && (
                        <div className="text-gray-400 text-sm">No showtimes available for {selectedFormat}.</div>
                    )}
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-[64px] left-0 right-0 w-full sm:max-w-[390px] mx-auto p-4 bg-white border-t border-gray-100 z-40">
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectedShowtimeId && navigate(`/showtime/${selectedShowtimeId}/seats`)}
                    disabled={!selectedShowtimeId}
                    className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors disabled:opacity-50 shadow-lg shadow-[#584cf4]/30"
                >
                    Get Tickets
                </motion.button>
            </div>

            <BottomNav />
        </div>
    );
}
