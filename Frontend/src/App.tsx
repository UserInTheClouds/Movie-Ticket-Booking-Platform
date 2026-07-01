import './App.css'
import Signuplogin from './pages/authentication/Signuplogin.tsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route path='/' element={<Signuplogin />} />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
