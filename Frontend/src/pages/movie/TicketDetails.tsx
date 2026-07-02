import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';

export default function TicketDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedSeats, showtime } = location.state || {};

    if (!selectedSeats || !showtime) {
        return <div className="min-h-screen flex items-center justify-center">No booking data found.</div>;
    }

    const movie = showtime.movie;
    const theatre = showtime.theatre;
    
    const formattedDate = new Date(showtime.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = new Date(showtime.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const ticketPrice = selectedSeats.reduce((sum: number, seat: any) => {
        return sum + (seat.type === 'PRIME' ? showtime.basePrice + 60 : showtime.basePrice);
    }, 0);
    const bookingFee = 20;
    const total = ticketPrice + bookingFee;

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-[#1a1a24]">
                    <ChevronLeft size={24} /> Back
                </button>
                <h1 className="text-[18px] font-bold text-[#1a1a24]">Booking Summary</h1>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 font-medium">Cancel</button>
            </div>

            {/* Content */}
            <div className="px-4">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <img src={movie.bannerUrl || "https://via.placeholder.com/800x400"} alt="Movie" className="w-full h-[180px] object-cover" />
                    
                    <div className="p-4">
                        <h2 className="text-[20px] font-bold text-[#1a1a24] mb-2">{movie.title || "Movie"}</h2>
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded mr-2">{theatre.name}</span>
                            <span>{formattedDate}</span>
                        </div>

                        <div className="flex space-x-4 mb-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1">{showtime.screenName}</p>
                                <p className="text-sm font-bold text-[#1a1a24]">{timeString} &nbsp; {showtime.format}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1">Seats</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedSeats.map((s: any) => (
                                        <span key={`${s.row}${s.col}`} className="bg-[#584cf4] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            {s.row}{s.col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            {selectedSeats.filter((s: any) => s.type === 'PRIME').length > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                    <span>{selectedSeats.filter((s: any) => s.type === 'PRIME').length}x Prime Tickets</span>
                                    <span>₹{selectedSeats.filter((s: any) => s.type === 'PRIME').length * (showtime.basePrice + 60)}</span>
                                </div>
                            )}
                            {selectedSeats.filter((s: any) => s.type !== 'PRIME').length > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                    <span>{selectedSeats.filter((s: any) => s.type !== 'PRIME').length}x Regular Tickets</span>
                                    <span>₹{selectedSeats.filter((s: any) => s.type !== 'PRIME').length * showtime.basePrice}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                <span>Booking Fee</span>
                                <span>₹{bookingFee}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-[#1a1a24]">Total</span>
                                <span className="text-[18px] font-bold text-[#1a1a24]">₹{total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-[64px] left-0 right-0 w-full sm:max-w-[390px] mx-auto p-4 bg-white border-t border-gray-100 z-40">
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/booking/payment', { state: { selectedSeats, showtime, total, ticketPrice, bookingFee } })}
                    className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors shadow-lg shadow-[#584cf4]/30"
                >
                    Proceed to Payment
                </motion.button>
            </div>

            <BottomNav />
        </div>
    );
}
