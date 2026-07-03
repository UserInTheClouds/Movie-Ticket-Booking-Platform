import './App.css';
import Signuplogin from './pages/authentication/Signuplogin';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/home/Home';
import MovieDetails from './pages/movie/MovieDetails';
import SelectTheatre from './pages/movie/SelectTheatre';
import SelectSchedule from './pages/movie/SelectSchedule';
import SelectSeats from './pages/movie/SelectSeats';
import TicketDetails from './pages/movie/TicketDetails';
import PaymentEntry from './pages/movie/PaymentEntry';
import PaymentStatus from './pages/movie/PaymentStatus';
import ActiveBooking from './pages/bookingHistory/ActiveBooking';
import PastBookingHistory from './pages/bookingHistory/PastBookingHistory';
import Profile from './pages/profile/Profile';
import Favorites from './pages/favorites/Favorites';
import MovieList from './pages/movie/MovieList';
import TheatreList from './pages/theatre/TheatreList';
import TheatreDetail from './pages/theatre/TheatreDetail';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from './store/store';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { setCredentials, logOut, setAuthReady } from './store/authSlice';
import { AnimatePresence, motion } from 'framer-motion';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={isAuthenticated ? <Navigate to="/home" replace /> : <PageWrapper><Signuplogin /></PageWrapper>} />
        <Route path='/home' element={isAuthenticated ? <PageWrapper><Home /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/movie/:id' element={isAuthenticated ? <PageWrapper><MovieDetails /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/movie/:id/schedule' element={isAuthenticated ? <PageWrapper><SelectTheatre /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/movie/:id/theatre/:theatreId/date/:date/schedule' element={isAuthenticated ? <PageWrapper><SelectSchedule /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/showtime/:showtimeId/seats' element={isAuthenticated ? <PageWrapper><SelectSeats /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/booking/summary' element={isAuthenticated ? <PageWrapper><TicketDetails /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/booking/payment' element={isAuthenticated ? <PageWrapper><PaymentEntry /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/booking/status' element={isAuthenticated ? <PageWrapper><PaymentStatus /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/tickets' element={isAuthenticated ? <PageWrapper><ActiveBooking /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/tickets/past' element={isAuthenticated ? <PageWrapper><PastBookingHistory /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/favorites' element={isAuthenticated ? <PageWrapper><Favorites /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/profile' element={isAuthenticated ? <PageWrapper><Profile /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/movies' element={isAuthenticated ? <PageWrapper><MovieList /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/theatres' element={isAuthenticated ? <PageWrapper><TheatreList /></PageWrapper> : <Navigate to="/" replace />} />
        <Route path='/theatre/:id' element={isAuthenticated ? <PageWrapper><TheatreDetail /></PageWrapper> : <Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { isAuthReady } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
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
      } catch (error) {
        console.error("Auth state change error:", error);
        dispatch(logOut());
      } finally {
        dispatch(setAuthReady(true));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]"></div>
    );
  }

  return (
    <div className="w-full sm:max-w-[390px] mx-auto bg-white min-h-screen relative shadow-2xl overflow-x-hidden">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
