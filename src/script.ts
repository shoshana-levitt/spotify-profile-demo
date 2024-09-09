export const clientId = import.meta.env.VITE_CLIENT_ID;
export const params = new URLSearchParams(window.location.search);
export const code = params.get("code");

if (!clientId) {
  throw new Error(
    "Missing clientId. Make sure VITE_CLIENT_ID is set in your .env file."
  );
}

const timeRanges = {
  shortTerm: "short_term",
  mediumTerm: "medium_term",
  longTerm: "long_term",
};

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  (async () => {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);

    // Event listeners should be added only after accessToken is available
    setupTabListeners(accessToken); // NEW: Setup event listeners for tabs

    // Load medium term data by default
    loadTopTracksAndArtists(accessToken, timeRanges.mediumTerm);
  })();
}

function setupTabListeners(accessToken: string) {
  document.getElementById("shortTerm")!.addEventListener("click", () => {
    setActiveTab("shortTerm");
    loadTopTracksAndArtists(accessToken, timeRanges.shortTerm);
  });

  document.getElementById("mediumTerm")!.addEventListener("click", () => {
    setActiveTab("mediumTerm");
    loadTopTracksAndArtists(accessToken, timeRanges.mediumTerm);
  });

  document.getElementById("longTerm")!.addEventListener("click", () => {
    setActiveTab("longTerm");
    loadTopTracksAndArtists(accessToken, timeRanges.longTerm);
  });
}

async function loadTopTracksAndArtists(token: string, timeRange: string) {
  const topTracks = await fetchTopTracks(token, timeRange);
  populateTopTracks(topTracks.items);
  const topArtists = await fetchTopArtists(token, timeRange);
  populateTopArtists(topArtists.items);
}

async function fetchTopTracks(token: string, timeRange: string): Promise<any> {
  const result = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return await result.json();
}

async function fetchTopArtists(token: string, timeRange: string): Promise<any> {
  const result = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return await result.json();
}

function setActiveTab(activeButtonId: string) {
  document.querySelectorAll("#timeRangeTabs button").forEach((button) => {
    button.classList.remove("active"); // Remove 'active' class from all buttons
  });
  document.getElementById(activeButtonId)!.classList.add("active"); // Add 'active' class to clicked button
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

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await result.json();
}

function populateUI(profile: UserProfile) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText =
    profile.images[0]?.url ?? "(no profile image)";
}

function populateTopTracks(tracks: any[]) {
  const topTracksContainer = document.getElementById("topTracks")!;

  // Clear only the track list, not the header
  const existingTracks = topTracksContainer.querySelector(".tracks-list");
  if (existingTracks) {
    existingTracks.remove();
  }

  // Create a container for the track list
  const tracksList = document.createElement("div");
  tracksList.classList.add("tracks-list");

  // Use a DocumentFragment for efficient DOM updates
  const fragment = document.createDocumentFragment();

  tracks.forEach((track, index) => {
    const trackElement = document.createElement("div");
    trackElement.innerText = `${index + 1}. ${track.name} by ${track.artists
      .map((artist: any) => artist.name)
      .join(", ")}`; // Add numbering
    fragment.appendChild(trackElement); // Add track to fragment
  });

  tracksList.appendChild(fragment);
  topTracksContainer.appendChild(tracksList); // Add the track list to the container
}

function populateTopArtists(artists: any[]) {
  const topArtistsContainer = document.getElementById("topArtists")!;

  // Clear only the artist list, not the header
  const existingArtists = topArtistsContainer.querySelector(".artists-list");
  if (existingArtists) {
    existingArtists.remove();
  }

  // Create a container for the artist list
  const artistsList = document.createElement("div");
  artistsList.classList.add("artists-list");

  // Use a DocumentFragment for efficient DOM updates
  const fragment = document.createDocumentFragment();

  artists.forEach((artist, index) => {
    const artistElement = document.createElement("div");
    artistElement.innerText = `${index + 1}. ${artist.name}`; // Add numbering
    fragment.appendChild(artistElement); // Add artist to fragment
  });

  artistsList.appendChild(fragment);
  topArtistsContainer.appendChild(artistsList); // Add the artist list to the container
}
