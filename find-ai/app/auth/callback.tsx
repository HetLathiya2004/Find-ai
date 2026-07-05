import { Redirect } from 'expo-router';

/**
 * Landing route for the OAuth deep link (findai://auth/callback). The token
 * exchange itself happens in useAuth via WebBrowser.openAuthSessionAsync —
 * but expo-router also navigates to the deep-link path when the OS delivers
 * it, which used to dead-end on the "+not-found" screen. Bounce to the index
 * redirect, which routes based on auth + onboarding state.
 */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
