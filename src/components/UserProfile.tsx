import React, { useState, useEffect } from "react";

type UserProfileData = {
  displayName: string;
  imageUrl: string;
};

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      const profile: UserProfileData = {
        displayName: data.display_name,
        imageUrl: data.images[0]?.url || "",
      };
      setUserProfile(profile);
      setLoading(false);
    } catch (error) {
      setError("Error fetching user profile");
      console.error(error);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("spotifyAccessToken");
    if (!accessToken) {
      setError("No access token available. Please log in again.");
      setLoading(false);
      return;
    }

    fetchUserProfile(accessToken);
  }, []);

  if (loading) {
    return <p>Loading user profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!userProfile) {
    return <p>No profile information available.</p>;
  }

  return (
    <div className="user-profile">
      <h2>{userProfile.displayName}</h2>
      {userProfile.imageUrl && (
        <img
          src={userProfile.imageUrl}
          alt={`${userProfile.displayName}'s avatar`}
          width={100}
        />
      )}
    </div>
  );
};

export default UserProfile;
