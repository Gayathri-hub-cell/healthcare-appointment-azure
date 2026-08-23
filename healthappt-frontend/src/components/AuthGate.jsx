// Wraps pages that require sign-in. Shows a sign-in card when not authenticated.
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { apiRequest } from '../authConfig';

export default function AuthGate({ children }) {
  const isAuth = useIsAuthenticated();
  const { instance } = useMsal();

  if (isAuth) return children;

  return (
    <div className="card gate">
      <div className="logo-lg">+</div>
      <h2>Please sign in</h2>
      <p className="muted">Sign in with your Microsoft account to book and manage appointments.</p>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => instance.loginRedirect(apiRequest)}>
        Sign in
      </button>
    </div>
  );
}
