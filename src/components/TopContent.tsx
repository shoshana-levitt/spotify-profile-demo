import React, { useState, useEffect } from "react";

type Track = {
  name: string;
  artist: string;
  image: string;
};

type Artist = {
  name: string;
  image: string;
};

const timeRanges = {
  shortTerm: "short_term",
  mediumTerm: "medium_term",
  longTerm: "long_term",
};

const TopContent: React.FC = () => {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState("mediumTerm");
  const [error, setError] = useState<string | null>(null);

  const handleReLogin = () => {
    localStorage.removeItem("spotifyAccessToken");
    redirectToAuthCodeFlow();
  };

  const redirectToAuthCodeFlow = async () => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
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

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const generateCodeVerifier = (length: number) => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const generateCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const fetchTopTracksAndArtists = async (timeRange: string) => {
    const accessToken = localStorage.getItem("spotifyAccessToken");
    if (!accessToken) {
      setError("No access token available");
      return;
    }

    try {
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const artistsResponse = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!tracksResponse.ok || !artistsResponse.ok) {
        throw new Error("Failed to fetch tracks or artists");
      }

      const tracksData = await tracksResponse.json();
      const artistsData = await artistsResponse.json();

      const newTracks = tracksData.items.map((track: any) => ({
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(", "),
        image: track.album.images[0]?.url || "",
      }));
      const newArtists = artistsData.items.map((artist: any) => ({
        name: artist.name,
        image: artist.images[0]?.url || "",
      }));

      setTopTracks(newTracks);
      setTopArtists(newArtists);
    } catch (error) {
      setError("Error fetching data");
      console.error(error);
    }
  };

  const handleTabClick = (timeRange: keyof typeof timeRanges) => {
    setActiveTab(timeRange);
    fetchTopTracksAndArtists(timeRanges[timeRange]);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("spotifyAccessToken");
    if (!accessToken) {
      setError("No access token available");
      return;
    }

    fetchTopTracksAndArtists(timeRanges.mediumTerm);
  }, []);

  return (
    <div>
      <div>
        <button onClick={handleReLogin}>Re-Login to Spotify</button>
      </div>
      <div id="timeRangeTabs">
        <button
          className={activeTab === "shortTerm" ? "active" : ""}
          onClick={() => handleTabClick("shortTerm")}
        >
          Short Term
        </button>
        <button
          className={activeTab === "mediumTerm" ? "active" : ""}
          onClick={() => handleTabClick("mediumTerm")}
        >
          Medium Term
        </button>
        <button
          className={activeTab === "longTerm" ? "active" : ""}
          onClick={() => handleTabClick("longTerm")}
        >
          Long Term
        </button>
      </div>

      <h2>Your Top Tracks</h2>
      <div id="topTracks">
        {topTracks.length > 0 ? (
          topTracks.map((track, index) => (
            <div key={index}>
              <img src={track.image} alt={track.name} width={100} />
              <div>
                {index + 1}. {track.name} by {track.artist}
              </div>
            </div>
          ))
        ) : (
          <p>No tracks available</p>
        )}
      </div>

      <h2>Your Top Artists</h2>
      <div id="topArtists">
        {topArtists.length > 0 ? (
          topArtists.map((artist, index) => (
            <div key={index}>
              <img src={artist.image} alt={artist.name} width={100} />
              <div>
                {index + 1}. {artist.name}
              </div>
            </div>
          ))
        ) : (
          <p>No artists available</p>
        )}
      </div>
    </div>
  );
};

export default TopContent;
