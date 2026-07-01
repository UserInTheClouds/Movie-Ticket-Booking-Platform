import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { Check } from 'lucide-react';

export default function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, showtime, selectedSeats } = location.state || {};

    if (!booking) return null;

    const movie = showtime.movie;
    const formattedDate = new Date(showtime.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = new Date(showtime.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans flex flex-col items-center">
            <div className="w-full bg-white p-4 shadow-sm flex justify-end">
                <button onClick={() => navigate('/home')} className="text-sm font-medium text-gray-500">Close</button>
            </div>

            <div className="mt-8 mb-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-500" />
                </div>
                <h1 className="font-bold text-[#1a1a24] text-xl">Payment Successful!</h1>
            </div>

            <div className="w-[90%] bg-white rounded-xl shadow-md overflow-hidden relative">
                <img src={movie.bannerUrl} alt="Movie" className="w-full h-[160px] object-cover" />
                
                <div className="p-6">
                    <h2 className="text-[20px] font-bold text-[#1a1a24] mb-6">{movie.title}</h2>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6 text-sm">
                        <div>
                            <p className="text-xs text-gray-400 font-bold mb-1">The Grandview</p>
                            <p className="font-bold text-[#1a1a24]">{formattedDate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold mb-1">Screen {showtime.screenName} - {showtime.format}</p>
                            <p className="font-bold text-[#1a1a24]">{timeString}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold mb-1">Seats:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedSeats.map((s: any) => (
                                    <span key={`${s.row}${s.col}`} className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full">
                                        {s.row}{s.col}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold mb-1">Amount Paid:</p>
                            <p className="font-bold text-[#1a1a24]">₹{booking.totalAmount}</p>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-6 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold mb-1">Transaction Date:</p>
                            <p className="text-xs font-medium text-[#1a1a24]">{new Date(booking.transactionDate).toLocaleString()}</p>
                        </div>
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center p-1">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.qrCodeData}`} alt="QR Code" className="w-full h-full mix-blend-multiply" />
                        </div>
                    </div>
                </div>
                
                {/* Decorative cutouts */}
                <div className="w-6 h-6 bg-[#f8f9fc] rounded-full absolute -left-3 bottom-[100px]"></div>
                <div className="w-6 h-6 bg-[#f8f9fc] rounded-full absolute -right-3 bottom-[100px]"></div>
            </div>
            
            <p className="text-xs text-gray-400 mt-6 px-8 text-center">You may view all purchased tickets in the ticket page.</p>

            <BottomNav />
        </div>
    );
}
