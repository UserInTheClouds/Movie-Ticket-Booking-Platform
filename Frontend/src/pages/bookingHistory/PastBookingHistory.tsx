import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function PastBookingHistory() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const res = await fetchWithAuth('/api/bookings/my-tickets');
                if (res.ok) {
                    const data = await res.json();
                    
                    // Filter past bookings (where showtime is in the past OR status is cancelled)
                    const past = data.filter((b: any) => {
                        if (!b.showtime || !b.showtime.movie || !b.showtime.theatre) return false;
                        return new Date(b.showtime.startTime) <= new Date() || b.status === 'CANCELLED';
                    });
                    setBookings(past);
                }
            } catch (err) {
                console.error("Failed to load past bookings", err);
            } finally {
                setLoading(false);
            }
        };
        loadBookings();
    }, []);

    return (
        <div className="min-h-screen bg-white pb-24 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 z-30 sticky top-0">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate('/home')} className="flex items-center text-sm font-medium text-gray-700 hover:text-black transition-colors">
                        <ChevronLeft size={24} /> Back
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button onClick={() => navigate('/tickets')} className="flex-1 pb-3 text-sm font-bold text-gray-400 hover:text-gray-600 border-b-[3px] border-transparent transition-colors">
                        My Bookings
                    </button>
                    <button className="flex-1 pb-3 text-sm font-bold text-[#584cf4] border-b-[3px] border-[#584cf4]">
                        Past Bookings
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-gray-50/50">
                {loading ? null : bookings.length === 0 ? (
                    <div className="text-gray-400 text-center mt-10">No past bookings found.</div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => {
                            const showtimeDate = new Date(booking.showtime.startTime);
                            const dateStr = showtimeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            const timeStr = showtimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                            
                            const txDate = new Date(booking.transactionDate);
                            const txDateStr = txDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
                            const txTimeStr = txDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                            const isCancelled = booking.status === 'CANCELLED';

                            return (
                                <div key={booking._id} className={`bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isCancelled ? 'border-red-100 opacity-60 grayscale-[40%]' : 'border-gray-100'} transition-all relative`}>
                                    {isCancelled && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                            <div className="border-4 border-red-500 text-red-500 text-4xl font-black px-6 py-2 rounded-xl rotate-[-15deg] opacity-70 tracking-widest">
                                                CANCELLED
                                            </div>
                                        </div>
                                    )}
                                    <div className="h-40 w-full relative">
                                        <img src={booking.showtime.movie.bannerUrl} alt={booking.showtime.movie.title} className="w-full h-full object-cover grayscale-[30%]" />
                                    </div>
                                    
                                    <div className="p-5">
                                        <h2 className="text-[20px] font-bold text-[#1a1a24] mb-4">{booking.showtime.movie.title}</h2>
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[13px] font-medium text-gray-500 mb-1">{booking.showtime.theatre.name}</p>
                                                <p className="text-[13px] font-medium text-gray-400">{dateStr}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-medium text-gray-500 mb-1">{booking.showtime.screenName} - {booking.showtime.format}</p>
                                                <p className="text-[13px] font-medium text-gray-400">{timeStr}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[13px] font-bold text-[#1a1a24] mb-2">Seats:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.seats.map((seat: any, i: number) => (
                                                        <span key={i} className="bg-gray-500 text-white text-[11px] font-bold px-2 py-1 rounded">
                                                            {seat.row}{seat.col}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-bold text-[#1a1a24] mb-2">Amount Paid:</p>
                                                <p className="text-[13px] font-medium text-gray-500">₹{booking.totalAmount}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-dashed border-gray-200 my-6 relative">
                                            <div className="w-6 h-6 bg-gray-50/50 rounded-full absolute -left-8 -top-3"></div>
                                            <div className="w-6 h-6 bg-gray-50/50 rounded-full absolute -right-8 -top-3"></div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="pb-2">
                                                <p className="text-[10px] text-gray-400">Transaction Date:<br/>{txDateStr} {txTimeStr}</p>
                                            </div>
                                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center p-1 rounded-lg">
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.qrCodeData}`} alt="QR Code" className="w-full h-full mix-blend-multiply opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
