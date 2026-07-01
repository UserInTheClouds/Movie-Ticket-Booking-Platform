import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function MovieBookSeats() {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

    useEffect(() => {
        const loadSeats = async () => {
            try {
                const res = await fetchWithAuth(`/api/showtimes/${showtimeId}/seats`);
                if (res.ok) {
                    const data = await res.json();
                    setShowtime(data);
                }
            } catch (err) {
                console.error("Error loading seats", err);
            } finally {
                setLoading(false);
            }
        };
        if (showtimeId) loadSeats();
    }, [showtimeId]);

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
    if (!showtime) return <div className="min-h-screen bg-white flex items-center justify-center">Showtime not found.</div>;

    const toggleSeat = (seat: any) => {
        if (seat.status !== 'AVAILABLE') return;
        
        const isSelected = selectedSeats.some(s => s.row === seat.row && s.col === seat.col);
        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => !(s.row === seat.row && s.col === seat.col)));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;
        navigate('/booking/summary', { state: { selectedSeats, showtime } });
    };

    // Parse seats into a grid [row][col]
    const seatGrid: { [key: string]: any[] } = {};
    const maxCol = Math.max(...showtime.seats.map((s: any) => s.col));
    
    showtime.seats.forEach((seat: any) => {
        if (!seatGrid[seat.row]) seatGrid[seat.row] = new Array(maxCol).fill(null);
        seatGrid[seat.row][seat.col - 1] = seat;
    });

    const rows = Object.keys(seatGrid).sort();
    const timeString = new Date(showtime.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const totalPrice = selectedSeats.length * showtime.basePrice;

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-10">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-[#1a1a24]">
                        <ChevronLeft size={24} /> Back
                    </button>
                    <button className="text-sm text-gray-500 font-medium">Cancel</button>
                </div>
                <div className="flex justify-between items-end px-2">
                    <div>
                        <h1 className="text-[20px] font-bold text-[#1a1a24]">Select Seats</h1>
                        <p className="text-sm text-gray-500 font-medium">{showtime.screenName} &nbsp;&nbsp; {timeString}</p>
                    </div>
                    {totalPrice > 0 && <div className="text-[18px] font-bold text-[#1a1a24]">₹{totalPrice}</div>}
                </div>
            </div>

            {/* Seat Map Area */}
            <div className="flex-1 overflow-auto p-4 bg-white mt-2 rounded-t-[2rem]">
                <div className="w-full flex justify-center mb-10 mt-6 relative">
                    <div className="w-[80%] h-6 border-t-[4px] border-[#584cf4] rounded-[50%] blur-[1px] opacity-20 absolute top-0"></div>
                    <div className="w-[80%] h-6 border-t-[2px] border-[#584cf4] rounded-[50%] absolute top-0"></div>
                    <span className="mt-4 text-xs font-bold text-gray-400 tracking-[4px]">SCREEN</span>
                </div>

                <div className="flex flex-col items-center">
                    {rows.map(rowLabel => (
                        <div key={rowLabel} className="flex items-center mb-3">
                            <span className="w-6 text-xs font-bold text-gray-400 mr-2">{rowLabel}</span>
                            <div className="flex space-x-2">
                                {seatGrid[rowLabel].map((seat, idx) => {
                                    if (!seat) return <div key={idx} className="w-7 h-7"></div>; // empty space
                                    
                                    const isSelected = selectedSeats.some(s => s.row === seat.row && s.col === seat.col);
                                    let btnClass = "w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center transition-colors ";
                                    
                                    if (seat.status === 'OCCUPIED') {
                                        btnClass += "bg-gray-300 text-gray-500 cursor-not-allowed";
                                    } else if (isSelected) {
                                        btnClass += "bg-[#584cf4] text-white shadow-md";
                                    } else {
                                        btnClass += "bg-white border border-gray-300 text-gray-500 hover:border-[#584cf4] cursor-pointer";
                                    }

                                    return (
                                        <button 
                                            key={`${seat.row}-${seat.col}`}
                                            onClick={() => toggleSeat(seat)}
                                            className={btnClass}
                                            disabled={seat.status === 'OCCUPIED'}
                                        >
                                            {seat.col}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center items-center space-x-6 mt-10">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
                        <span className="text-xs text-gray-500 font-medium">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-gray-300"></div>
                        <span className="text-xs text-gray-500 font-medium">Occupied</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-[#584cf4]"></div>
                        <span className="text-xs text-gray-500 font-medium">Selected</span>
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
                <button 
                    onClick={handleProceed}
                    disabled={selectedSeats.length === 0}
                    className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors disabled:opacity-50 shadow-lg shadow-[#584cf4]/30"
                >
                    View Booking Summary
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
