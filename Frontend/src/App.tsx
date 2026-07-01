import './App.css'
import Signuplogin from './pages/authentication/Signuplogin.tsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home.tsx';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from './store/store';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { setCredentials, logOut, setAuthReady } from './store/authSlice';

function App() {
  const { isAuthenticated, isAuthReady } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for authentication state changes from Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(setCredentials({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          token
        }));
      } else {
        dispatch(logOut());
      }
      // Tell Redux that Firebase has finished checking
      dispatch(setAuthReady(true));
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Show a loading screen until Firebase figures out if the user is logged in or not
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]"></div>
    );
  }

  return (
    <div>
      <BrowserRouter>

        <Routes>
          <Route path='/' element={isAuthenticated ? <Navigate to="/home" replace /> : <Signuplogin />} />
          <Route path='/home' element={isAuthenticated ? <Home /> : <Navigate to="/" replace />} />
        </Routes>

      </BrowserRouter>
    </div>
  )
}

export default App
