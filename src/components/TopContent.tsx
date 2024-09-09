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

  const fetchTopTracksAndArtists = async (timeRange: string) => {
    const accessToken = localStorage.getItem("spotifyAccessToken");
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

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

    localStorage.setItem("topTracks", JSON.stringify(newTracks));
    localStorage.setItem("topArtists", JSON.stringify(newArtists));

    setTopTracks(newTracks);
    setTopArtists(newArtists);
  };

  const handleTabClick = (timeRange: keyof typeof timeRanges) => {
    setActiveTab(timeRange);
    fetchTopTracksAndArtists(timeRanges[timeRange]);
  };

  useEffect(() => {
    // Load default data when the component mounts (mediumTerm)
    fetchTopTracksAndArtists(timeRanges.mediumTerm);
  }, []);

  return (
    <div>
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
