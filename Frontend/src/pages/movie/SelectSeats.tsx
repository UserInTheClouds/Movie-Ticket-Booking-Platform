import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function SelectSeats() {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<any[]>(() => {
        const saved = sessionStorage.getItem(`seats_${showtimeId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [showMaxSeatsPopup, setShowMaxSeatsPopup] = useState(false);

    useEffect(() => {
        sessionStorage.setItem(`seats_${showtimeId}`, JSON.stringify(selectedSeats));
    }, [selectedSeats, showtimeId]);

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

    useEffect(() => {
        if (showtime) {
            setSelectedSeats(prev => {
                const filtered = prev.filter(s => {
                    const dbSeat = showtime.seats.find((dbS: any) => dbS.row === s.row && dbS.col === s.col);
                    return dbSeat && dbSeat.status === 'AVAILABLE';
                });
                return filtered.length !== prev.length ? filtered : prev;
            });
        }
    }, [showtime]);

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
    if (!showtime) return <div className="min-h-screen bg-white flex items-center justify-center">Showtime not found.</div>;

    const toggleSeat = (seat: any) => {
        if (seat.status !== 'AVAILABLE') return;
        
        const isSelected = selectedSeats.some(s => s.row === seat.row && s.col === seat.col);
        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => !(s.row === seat.row && s.col === seat.col)));
        } else {
            if (selectedSeats.length >= 10) {
                setShowMaxSeatsPopup(true);
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;
        navigate('/booking/summary', { state: { selectedSeats, showtime } });
    };

    // Parse seats into a grid [row][col]
    const seatGrid: { [key: string]: any[] } = {};
    let maxCol = 1;
    if (showtime.seats && showtime.seats.length > 0) {
        maxCol = Math.max(...showtime.seats.map((s: any) => s.col));
    }
    
    showtime.seats.forEach((seat: any) => {
        if (!seatGrid[seat.row]) seatGrid[seat.row] = new Array(maxCol).fill(null);
        seatGrid[seat.row][seat.col - 1] = seat;
    });

    const rows = Object.keys(seatGrid).sort();
    
    const groupedRows: { PRIME: string[], REGULAR: string[] } = { PRIME: [], REGULAR: [] };
    rows.forEach(rowLabel => {
        const firstSeat = seatGrid[rowLabel].find((s: any) => s !== null);
        if (firstSeat) {
            groupedRows[(firstSeat.type as 'PRIME' | 'REGULAR') || 'REGULAR'].push(rowLabel);
        }
    });

    const timeString = new Date(showtime.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const isPVR = showtime.theatre?.name?.toLowerCase().includes('pvr') || false;
    const isINOX = showtime.theatre?.name?.toLowerCase().includes('inox') || false;
    
    const totalPrice = selectedSeats.reduce((sum, seat) => {
        return sum + (seat.type === 'PRIME' ? showtime.basePrice + 60 : showtime.basePrice);
    }, 0);

    const renderRow = (rowLabel: string) => (
        <div key={rowLabel} className="flex items-center mb-3">
            <span className="w-6 text-[10px] font-bold text-gray-400 mr-4 text-right">{rowLabel}</span>
            <div className="flex space-x-1.5">
                {seatGrid[rowLabel].map((seat, idx) => {
                    let extraMargin = "";
                    if (isPVR && idx === 5) extraMargin = "mr-6 sm:mr-10";
                    if (isINOX && (idx === 2 || idx === 8)) extraMargin = "mr-6 sm:mr-10";

                    if (!seat) return <div key={idx} className={`w-7 h-7 flex-shrink-0 ${extraMargin}`}></div>; // empty space
                    
                    const isSelected = selectedSeats.some(s => s.row === seat.row && s.col === seat.col);
                    let btnClass = `w-7 h-7 flex-shrink-0 rounded-[4px] text-[10px] font-bold flex items-center justify-center transition-colors ${extraMargin} `;
                    
                    if (seat.status === 'OCCUPIED') {
                        btnClass += "bg-[#9ca3af] text-white border border-[#9ca3af] cursor-not-allowed";
                    } else if (isSelected) {
                        btnClass += "bg-[#584cf4] text-white shadow-md border border-[#584cf4]";
                    } else {
                        btnClass += "bg-white border border-green-500 text-green-500 hover:bg-green-50 cursor-pointer";
                    }

                    return (
                        <button 
                            key={`${seat.row}-${seat.col}`}
                            onClick={() => toggleSeat(seat)}
                            className={btnClass}
                            disabled={seat.status === 'OCCUPIED'}
                        >
                            {seat.label || seat.col}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 pt-6 z-10 shadow-sm relative">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-700 hover:text-black transition-colors">
                        <ChevronLeft size={24} /> Back
                    </button>
                    <button onClick={() => navigate(-1)} className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors">Cancel</button>
                </div>
                
                <div className="flex flex-col">
                    <h1 className="text-[22px] font-bold text-[#1a1a24] mb-2">Select Seats</h1>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-[#1a1a24] font-bold">
                            <span className="mr-3">{showtime.screenName}</span>
                            <span className="text-[#584cf4]">{timeString}</span>
                        </div>
                        <div className="text-[16px] font-bold text-[#1a1a24]">₹{totalPrice}</div>
                    </div>
                </div>
            </div>

            {/* Seat Map Area */}
            <div className="flex-1 overflow-auto bg-white pb-48 hide-scrollbar">
                <div className="w-max min-w-full mx-auto px-6 py-6">
                    {/* Screen Indicator at Top */}
                    <div className="w-full flex flex-col items-center mb-12 mt-2 relative">
                        <div className="w-[80%] max-w-[200px] h-6 border-t-[3px] border-blue-200 rounded-[50%] blur-[2px] opacity-40 absolute top-0"></div>
                        <div className="w-[80%] max-w-[200px] h-6 border-t-[2px] border-[#c4d0eb] rounded-[50%] absolute top-0"></div>
                        <span className="mt-4 text-[10px] font-bold text-gray-400 tracking-[4px]">SCREEN THIS WAY</span>
                    </div>
                    
                    {['REGULAR', 'PRIME'].map(type => {
                        if (groupedRows[type as 'PRIME' | 'REGULAR'].length === 0) return null;
                        return (
                            <div key={type} className="mb-6">
                                <div className="w-full border-b border-gray-200 mt-2 mb-6 relative flex justify-center">
                                    <span className="bg-white px-3 text-[10px] text-gray-500 font-bold absolute -top-2">₹{type === 'PRIME' ? showtime.basePrice + 60 : showtime.basePrice} {type} ROWS</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    {groupedRows[type as 'PRIME' | 'REGULAR'].map(renderRow)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Action Area (Fixed) */}
            <div className="fixed bottom-[64px] left-0 right-0 w-full sm:max-w-[390px] mx-auto bg-white border-t border-gray-100 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {/* Legend */}
                <div className="flex justify-center items-center space-x-6 py-3 border-b border-gray-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 rounded-[3px] border border-green-500 bg-white"></div>
                        <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-[#9ca3af]"></div>
                        <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Occupied</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-[#584cf4]"></div>
                        <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Selected</span>
                    </div>
                </div>

                <div className="p-4">
                    <button 
                        onClick={handleProceed}
                        disabled={selectedSeats.length === 0}
                        className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors disabled:opacity-50 shadow-md shadow-[#584cf4]/20"
                    >
                        View Booking Summary
                    </button>
                </div>
            </div>

            {/* Max Seats Popup */}
            {showMaxSeatsPopup && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center mx-4">
                        <h3 className="text-lg font-bold text-[#1a1a24] mb-2">Maximum Seats Reached</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Cannot select more than 10 seats in one transaction. First finish the transaction for 10 seats, then come back to the selection screen to book more.
                        </p>
                        <button 
                            onClick={() => setShowMaxSeatsPopup(false)}
                            className="w-full bg-[#584cf4] text-white py-3 rounded-xl font-bold text-[15px] hover:bg-[#483de0] transition-colors"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}
            
            <div className="fixed bottom-0 left-0 right-0 w-full sm:max-w-[390px] mx-auto z-50">
                <BottomNav />
            </div>
        </div>
    );
}
