import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { setCredentials } from '../../store/authSlice';

export default function Signuplogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleToggleMode = (mode: boolean) => {
        setIsLogin(mode);
        setError('');
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim() || (!isLogin && (!name.trim() || !confirmPassword.trim()))) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setIsLoading(true);
            let userCredential;

            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: name });
                }
            }

            const token = await userCredential.user.getIdToken();

            dispatch(setCredentials({
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName || name,
                },
                token
            }));

        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('This email is already registered.');
                    break;
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    setError('Invalid email or password.');
                    break;
                default:
                    setError(err.message || 'An error occurred during authentication.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex justify-center w-full font-sans overflow-hidden">
            <div className="w-full max-w-[390px] bg-[#f8f9fc] flex flex-col px-8 py-8 relative shadow-sm sm:shadow-none">

                <div className="flex flex-col items-center mt-6 mb-8">
                    <img src="/assets/logo.svg" alt="Logo" className="h-14 mb-3" />
                    <h1 className="text-[20px] font-bold text-center text-gray-900 leading-snug tracking-tight">
                        Movie Ticket Booking Platform (Creative Upaay<br />Hiring Assignment)
                    </h1>
                </div>

                <div className="relative flex p-1 bg-[#e9ecef] rounded-lg mb-8 shrink-0">
                    <div
                        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-in-out ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
                    />
                    <button
                        onClick={() => handleToggleMode(true)}
                        type="button"
                        className={`relative z-10 flex-1 py-2 text-[15px] font-medium rounded-md transition-colors duration-300 hover:cursor-pointer ${isLogin ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => handleToggleMode(false)}
                        type="button"
                        className={`relative z-10 flex-1 py-2 text-[15px] font-medium rounded-md transition-colors duration-300 hover:cursor-pointer ${!isLogin ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow relative overflow-hidden">
                    <div className={`flex flex-grow transition-transform duration-500 ease-in-out w-full ${isLogin ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="w-full flex-shrink-0 flex flex-col justify-center gap-8 pr-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors pr-12"
                                />
                                {password.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-2 flex items-center text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full flex-shrink-0 flex flex-col justify-center gap-8 pl-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (min 8 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors pr-12"
                                />
                                {password.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-2 flex items-center text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pb-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#584cf4] text-[15px] text-gray-800 placeholder-gray-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-2 flex flex-col gap-3 pb-4">
                        {error && (
                            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-[14px] bg-[#584cf4] text-white text-[16px] font-medium rounded-lg shadow-sm hover:bg-[#483de0] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}