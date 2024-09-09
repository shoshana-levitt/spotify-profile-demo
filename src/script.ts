export const clientId = import.meta.env.VITE_CLIENT_ID;
export const params = new URLSearchParams(window.location.search);
export const code = params.get("code");

let accessToken = localStorage.getItem("spotifyAccessToken");

if (!clientId) {
  throw new Error(
    "Missing clientId. Make sure VITE_CLIENT_ID is set in your .env file."
  );
}

// Redirect to Spotify login if no access token and no authorization code
if (!accessToken && !code) {
  redirectToAuthCodeFlow(clientId);
} else if (!accessToken && code) {
  // Exchange code for access token and store it
  (async () => {
    accessToken = await getAccessToken(clientId, code);
    localStorage.setItem("spotifyAccessToken", accessToken);
    console.log("Access token set:", accessToken); // Debugging to check if token is set
    window.location.reload(); // Reload the page to use the new token
  })();
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
  const verifier = localStorage.getItem("verifier");
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier!);
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const { access_token } = await result.json();
  return access_token;
}

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("verifier", verifier);
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("scope", "user-read-private user-read-email user-top-read");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);
  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
