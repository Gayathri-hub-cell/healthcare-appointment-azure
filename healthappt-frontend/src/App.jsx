// Top-level app: navigation, routes, and the shared "me" profile.
import { Routes, Route } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useEffect, useState, useCallback } from 'react';
import { MeContext } from './MeContext';
import { useApi } from './api';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Book from './pages/Book';
import MyAppointments from './pages/MyAppointments';
import Provider from './pages/Provider';
import Profile from './pages/Profile';

export default function App() {
  const isAuth = useIsAuthenticated();
  const api = useApi();
  const [me, setMe] = useState(null);

  const refreshMe = useCallback(() => {
    if (isAuth) api('/me').then(setMe).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  useEffect(() => { refreshMe(); }, [isAuth, refreshMe]);

  return (
    <MeContext.Provider value={{ me, refreshMe }}>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/provider" element={<Provider />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <footer className="foot">HealthAppt GKDM · Cloud Computing project · running on Microsoft Azure</footer>
    </MeContext.Provider>
  );
}
