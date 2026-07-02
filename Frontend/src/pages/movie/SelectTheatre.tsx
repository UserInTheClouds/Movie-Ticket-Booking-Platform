import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, MapPin } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function SelectTheatre() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageFailed, setImageFailed] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string>('');

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
                    
                    // Extract unique dates
                    if (showtimesData.length > 0) {
                        // Do not auto-select date, require user to select one
                    }
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

    // Filter showtimes by selected date, or show all if none selected
    const activeShowtimes = showtimes.filter(st => {
        const isFuture = new Date(st.startTime) >= new Date();
        const matchesDate = selectedDate ? getLocalDateString(new Date(st.startTime)) === selectedDate : true;
        return isFuture && matchesDate;
    });

    // Group by Theatre
    const theatreGroups = activeShowtimes.reduce((acc: any, st: any) => {
        const tId = st.theatre._id;
        if (!acc[tId]) {
            acc[tId] = { theatre: st.theatre, prices: [] };
        }
        acc[tId].prices.push(st.basePrice);
        return acc;
    }, {});

    const generateDateStrip = () => {
        const dates = [];
        let curr = new Date();
        if (movie?.status === 'COMING_SOON') {
            curr.setDate(curr.getDate() + 7);
        }
        for (let i = 0; i < 7; i++) {
            dates.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

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
                        <p className="text-xs text-gray-200 drop-shadow-md mt-1 font-medium">{movie.genres?.join(', ')} • {movie.ageRating}</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar Removed */}

            <div className="px-6 mt-8 flex-1">
                <h2 className="text-[22px] font-bold text-[#1a1a24] mb-6">Select Movie Theatre</h2>
                
                {/* Date Strip */}
                <div className="flex overflow-x-auto space-x-3 pb-6 border-b border-gray-100 hide-scrollbar">
                    {generateDateStrip().map((date, idx) => {
                        const dateStr = getLocalDateString(date);
                        const isSelected = dateStr === selectedDate;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        
                        return (
                            <button 
                                key={idx}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex flex-col items-center justify-center min-w-[50px] transition-colors`}
                            >
                                <span className={`text-[13px] font-medium mb-1.5 ${isSelected ? 'text-[#584cf4]' : 'text-gray-400'}`}>{dayName}</span>
                                <span className={`w-10 h-10 flex items-center justify-center rounded-lg text-[15px] font-bold transition-colors ${isSelected ? 'bg-[#584cf4] text-white shadow-md' : 'border border-gray-200 text-gray-700 hover:border-[#584cf4] hover:bg-[#584cf4]/5'}`}>{dayNum}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Theatres */}
                <div className="mt-6 space-y-6">
                    {Object.values(theatreGroups).length === 0 ? (
                        <div className="text-gray-400 text-center py-8">No theatres available for this date.</div>
                    ) : (
                        Object.values(theatreGroups).map((group: any) => {
                            const minPrice = Math.min(...group.prices);
                            const maxPrice = Math.max(...group.prices);
                            const priceString = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

                            return (
                                <div 
                                    key={group.theatre._id} 
                                    onClick={() => {
                                        if (selectedDate) {
                                            navigate(`/movie/${id}/theatre/${group.theatre._id}/date/${selectedDate}/schedule`);
                                        }
                                    }}
                                    className={`flex items-center space-x-4 p-2 rounded-xl transition-colors group ${!selectedDate ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-gray-50'}`}
                                >
                                    {/* Theatre Logo */}
                                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-sm transition-shadow overflow-hidden">
                                        {group.theatre.logoUrl ? (
                                            <img src={group.theatre.logoUrl} alt={group.theatre.name} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <span className="text-2xl">🎬</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#1a1a24] text-[16px] mb-1 group-hover:text-[#584cf4] transition-colors">{group.theatre.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium flex items-center mb-1">
                                            <MapPin size={12} className="mr-1" /> {group.theatre.location || 'Location Info'}
                                        </p>
                                        <p className="text-sm font-bold text-gray-600">{priceString}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
