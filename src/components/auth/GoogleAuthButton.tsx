import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
  onCredential: (credential: string) => void;
  onError?: () => void;
  /** Google's own button copy — defaults to "Sign in with Google". Register
   * passes "signup_with" so it doesn't say "Login" on the signup page. */
  text?: "signin_with" | "signup_with" | "continue_with";
}

// Renders nothing if Google sign-in isn't configured — same "missing
// credential = skip, not crash" stance as every other optional integration
// in this project. Email/password auth works regardless.
export function GoogleAuthButton({ onCredential, onError, text = "signin_with" }: GoogleAuthButtonProps) {
  if (!CLIENT_ID) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        text={text}
        onSuccess={(response) => {
          if (response.credential) onCredential(response.credential);
        }}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}
