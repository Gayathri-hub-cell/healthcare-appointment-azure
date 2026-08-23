import { NavLink } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { apiRequest } from '../authConfig';
import { useMe } from '../MeContext';

export default function NavBar() {
  const { instance } = useMsal();
  const isAuth = useIsAuthenticated();
  const { me } = useMe();
  const role = me?.Role;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand"><span className="logo">+</span> HealthAppt GKDM</NavLink>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          {isAuth && <NavLink to="/book">Book</NavLink>}
          {isAuth && <NavLink to="/appointments">My Appointments</NavLink>}
          {isAuth && (role === 'Provider' || role === 'Admin') && <NavLink to="/provider">Provider</NavLink>}
          {isAuth && <NavLink to="/profile">Profile</NavLink>}
        </div>

        <div className="nav-user">
          {isAuth ? (
            <>
              {me && <span className="who"><b>{me.DisplayName}</b>{me.Role}</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => instance.logoutRedirect()}>Sign out</button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => instance.loginRedirect(apiRequest)}>Sign in</button>
          )}
        </div>
      </div>
    </nav>
  );
}
