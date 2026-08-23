import { Link } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { apiRequest } from '../authConfig';

export default function Home() {
  const isAuth = useIsAuthenticated();
  const { instance } = useMsal();

  return (
    <div className="stack">
      <section className="hero">
        <img src="/hospital.svg" className="hero-art" alt="" aria-hidden="true" />
        <div className="hero-content">
          <h1>Healthcare appointments, booked in seconds</h1>
          <p>Find a provider, pick a time, and manage your visits online — securely, from anywhere.</p>
          {isAuth ? (
            <>
              <Link to="/book" className="btn btn-primary">Book an appointment</Link>
              <Link to="/appointments" className="btn btn-ghost" style={{ marginLeft: '.6rem' }}>My appointments</Link>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => instance.loginRedirect(apiRequest)}>Sign in to get started</button>
          )}
        </div>
      </section>

      <div className="grid grid-3">
        <div className="card feature">
          <div className="ficon">🗓️</div>
          <h3>Easy booking</h3>
          <p>Browse providers and open time slots, and book in a couple of clicks.</p>
        </div>
        <div className="card feature">
          <div className="ficon">🔒</div>
          <h3>Secure &amp; private</h3>
          <p>Microsoft sign-in and an encrypted, private database keep your data safe.</p>
        </div>
        <div className="card feature">
          <div className="ficon">⚡</div>
          <h3>Manage anytime</h3>
          <p>Reschedule or cancel from any device, whenever you need to.</p>
        </div>
      </div>
    </div>
  );
}
