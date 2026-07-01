import './App.css'
import Signuplogin from './pages/authentication/Signuplogin';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import MovieBook from './pages/movie/MovieBook';
import MovieBookSchedule from './pages/movie/MovieBookSchedule';
import MovieBookSeats from './pages/movie/MovieBookSeats';
import MovieBookSummary from './pages/movie/MovieBookSummary';
import PaymentEntry from './pages/movie/PaymentEntry';
import PaymentStatus from './pages/movie/PaymentStatus';
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
      dispatch(setAuthReady(true));
    });

    return () => unsubscribe();
  }, [dispatch]);

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
          <Route path='/movie/:id' element={isAuthenticated ? <MovieBook /> : <Navigate to="/" replace />} />
          <Route path='/movie/:id/schedule' element={isAuthenticated ? <MovieBookSchedule /> : <Navigate to="/" replace />} />
          <Route path='/showtime/:showtimeId/seats' element={isAuthenticated ? <MovieBookSeats /> : <Navigate to="/" replace />} />
          <Route path='/booking/summary' element={isAuthenticated ? <MovieBookSummary /> : <Navigate to="/" replace />} />
          <Route path='/booking/payment' element={isAuthenticated ? <PaymentEntry /> : <Navigate to="/" replace />} />
          <Route path='/booking/success' element={isAuthenticated ? <PaymentStatus /> : <Navigate to="/" replace />} />
        </Routes>

      </BrowserRouter>
    </div>
  )
}

export default App
