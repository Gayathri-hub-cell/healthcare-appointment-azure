// Shares the signed-in user's profile (name, email, role) across the app.
import { createContext, useContext } from 'react';

export const MeContext = createContext({ me: null, refreshMe: () => {} });
export const useMe = () => useContext(MeContext);
