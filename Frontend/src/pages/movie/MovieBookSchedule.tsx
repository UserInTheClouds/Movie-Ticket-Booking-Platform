import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft, Calendar } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function MovieBookSchedule() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<string>('2D');

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
                        const uniqueDates = Array.from(new Set(showtimesData.map((s: any) => 
                            new Date(s.startTime).toISOString().split('T')[0]
                        ))) as string[];
                        
                        if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0]);
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

    // Filter showtimes by selected date and format
    const filteredShowtimes = showtimes.filter(st => 
        new Date(st.startTime).toISOString().split('T')[0] === selectedDate &&
        st.format === selectedFormat
    );

    // Group by Theatre
    const theatreGroups = filteredShowtimes.reduce((acc: any, st: any) => {
        const tId = st.theatre._id;
        if (!acc[tId]) acc[tId] = { theatre: st.theatre, screens: {} };
        if (!acc[tId].screens[st.screenName]) acc[tId].screens[st.screenName] = [];
        acc[tId].screens[st.screenName].push(st);
        return acc;
    }, {});

    const generateDateStrip = () => {
        const dates = [];
        let curr = new Date();
        for (let i = 0; i < 7; i++) {
            dates.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    return (
        <div className="min-h-screen bg-white pb-32 font-sans">
            {/* Header */}
            <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-[#1a1a24] z-10"></div>
                <img src={movie.bannerUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                
                <div className="relative z-20 pt-12 px-4 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium">
                            <ChevronLeft size={24} /> Back
                        </button>
                        <button className="text-sm">Cancel</button>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{movie.title}</h1>
                    <div className="flex items-center text-sm text-gray-300">
                        <Calendar size={14} className="mr-1" /> Select Schedule
                    </div>
                </div>
            </div>

            {/* Date Strip */}
            <div className="bg-white rounded-t-[2rem] -mt-6 relative z-30 pt-6 px-4">
                <div className="flex overflow-x-auto space-x-3 pb-2 hide-scrollbar">
                    {generateDateStrip().map((date, idx) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = dateStr === selectedDate;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        
                        return (
                            <button 
                                key={idx}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex flex-col items-center justify-center min-w-[50px] h-16 rounded-xl border ${isSelected ? 'bg-[#584cf4] border-[#584cf4] text-white' : 'border-gray-200 text-gray-500'}`}
                            >
                                <span className="text-xs font-medium mb-1">{dayName}</span>
                                <span className="text-lg font-bold">{dayNum}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Formats */}
            <div className="px-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[18px] font-bold text-[#1a1a24]">Choose Schedule</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-500 mr-2">Format</span>
                    {movie.formats?.map((fmt: string) => (
                        <button 
                            key={fmt}
                            onClick={() => setSelectedFormat(fmt)}
                            className={`px-4 py-1.5 rounded text-sm font-bold border ${selectedFormat === fmt ? 'bg-[#584cf4] text-white border-[#584cf4]' : 'border-[#e5e7eb] text-[#584cf4]'}`}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theatres & Showtimes */}
            <div className="px-4 mt-8 space-y-8">
                {Object.values(theatreGroups).length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No showtimes available for this date/format.</div>
                ) : (
                    Object.values(theatreGroups).map((group: any) => (
                        <div key={group.theatre._id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-center mb-4">
                                <h3 className="font-bold text-[#1a1a24] text-[16px]">{group.theatre.name}</h3>
                            </div>
                            
                            {Object.keys(group.screens).map(screenName => (
                                <div key={screenName} className="mb-4 last:mb-0">
                                    <p className="text-sm font-bold text-gray-500 mb-3">{screenName}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {group.screens[screenName].map((st: any) => {
                                            const timeString = new Date(st.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                            return (
                                                <button 
                                                    key={st._id}
                                                    onClick={() => navigate(`/showtime/${st._id}/seats`)}
                                                    className="px-4 py-2 border border-gray-200 text-[#584cf4] text-sm font-bold rounded hover:border-[#584cf4] transition-colors"
                                                >
                                                    {timeString}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}
