import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { logOut } from '../../store/authSlice';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        const auth = getAuth();
        await signOut(auth);
        dispatch(logOut());
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome Home!</h1>
                {user ? (
                    <div>
                        <p className="text-gray-600 mb-6">You are logged in as <br /><strong className="text-black">{user.displayName}</strong></p>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <p className="text-red-500">You are not logged in.</p>
                )}
            </div>
        </div>
    );
}