import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
  onCredential: (credential: string) => void;
  onError?: () => void;
}

// Renders nothing if Google sign-in isn't configured — same "missing
// credential = skip, not crash" stance as every other optional integration
// in this project. Email/password auth works regardless.
export function GoogleAuthButton({ onCredential, onError }: GoogleAuthButtonProps) {
  if (!CLIENT_ID) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) onCredential(response.credential);
        }}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}
