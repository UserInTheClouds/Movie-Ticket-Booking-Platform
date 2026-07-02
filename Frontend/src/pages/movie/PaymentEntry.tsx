import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function PaymentEntry() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedSeats, showtime, total, ticketPrice, bookingFee } = location.state || {};
    const [loading, setLoading] = useState(false);
    
    const [nameOnCard, setNameOnCard] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [formError, setFormError] = useState('');

    if (!selectedSeats) return null;

    const handlePayment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Validation
        if (!nameOnCard.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvc.trim()) {
            setFormError('Please fill in all payment fields.');
            return;
        }
        if (cardNumber.length < 15) {
            setFormError('Please enter a valid card number.');
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            setFormError('Please enter a valid expiry date (MM/YY).');
            return;
        }
        if (cvc.length < 3) {
            setFormError('Please enter a valid CVC.');
            return;
        }

        setFormError('');
        setLoading(true);

        try {
            const res = await fetchWithAuth('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showtimeId: showtime._id,
                    seats: selectedSeats.map((s: any) => ({ row: s.row, col: s.col })),
                    ticketPrice,
                    bookingFee,
                    totalAmount: total,
                    paymentMethod: 'Credit Card'
                })
            });

            if (res.ok) {
                const bookingData = await res.json();
                navigate('/booking/status', { state: { status: 'success', booking: bookingData, showtime, selectedSeats } });
            } else {
                const err = await res.json();
                if (res.status === 409) {
                    navigate('/booking/status', { state: { status: 'failed', error: err.error, showtime, selectedSeats } });
                } else {
                    alert(err.error || 'Booking failed');
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error processing payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans">
            <div className="bg-white p-4 shadow-sm mb-4 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium">
                    <ChevronLeft size={24} /> Back
                </button>
                <h1 className="text-[18px] font-bold text-[#1a1a24]">Checkout</h1>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 font-medium">Cancel</button>
            </div>

            <div className="px-4">
                {/* Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <h2 className="font-bold text-[#1a1a24] mb-4">Summary</h2>
                    {selectedSeats.filter((s: any) => s.type === 'PRIME').length > 0 && (
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{selectedSeats.filter((s: any) => s.type === 'PRIME').length}x Prime Tickets</span>
                            <span>₹{selectedSeats.filter((s: any) => s.type === 'PRIME').length * (showtime.basePrice + 60)}</span>
                        </div>
                    )}
                    {selectedSeats.filter((s: any) => s.type !== 'PRIME').length > 0 && (
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{selectedSeats.filter((s: any) => s.type !== 'PRIME').length}x Regular Tickets</span>
                            <span>₹{selectedSeats.filter((s: any) => s.type !== 'PRIME').length * showtime.basePrice}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600 mb-4 border-b border-gray-100 pb-4">
                        <span>Booking Fee</span>
                        <span>₹{bookingFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1a1a24]">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handlePayment} className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-bold text-[#1a1a24] mb-4">Choose payment method</h2>
                    
                    <div className="flex space-x-4 mb-6">
                        <label className="flex items-center space-x-2 text-sm font-medium">
                            <input type="radio" name="payment" defaultChecked className="text-[#584cf4] focus:ring-[#584cf4]" />
                            <span>Credit/Debit Card</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-400">
                            <input type="radio" name="payment" disabled />
                            <span>Mobile Wallet</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        {formError && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold border border-red-100">
                                {formError}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Name on card</label>
                            <input required type="text" value={nameOnCard} onChange={e => setNameOnCard(e.target.value)} placeholder="Name on card" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#584cf4]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Card number</label>
                            <input required type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#584cf4]" />
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Expiry date</label>
                                <input required type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value.slice(0, 5))} placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#584cf4]" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">CVC/CVV</label>
                                <input required type="password" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="CVC" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#584cf4]" />
                            </div>
                        </div>
                        <label className="flex items-center space-x-2 mt-4">
                            <input type="checkbox" className="rounded text-[#584cf4] focus:ring-[#584cf4]" />
                            <span className="text-xs text-gray-500 font-medium">Save payment details for the next purchase</span>
                        </label>
                    </div>
                </form>
            </div>

            <div className="fixed bottom-[64px] left-0 right-0 w-full sm:max-w-[390px] mx-auto p-4 bg-white border-t border-gray-100 z-40">
                <button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-[#584cf4] text-white py-[14px] rounded-xl font-medium text-[16px] hover:bg-[#483de0] transition-colors shadow-lg shadow-[#584cf4]/30 disabled:opacity-70"
                >
                    {loading ? 'Processing...' : 'Complete Payment'}
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
