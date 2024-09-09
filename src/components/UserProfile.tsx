import React, { useState, useEffect } from "react";

type UserProfileData = {
  displayName: string;
  imageUrl: string;
};

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const fetchUserProfile = async () => {
    const accessToken = localStorage.getItem("spotifyAccessToken");
    if (!accessToken) {
      console.error("No access token available");
      return;
    }
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    const profile: UserProfileData = {
      displayName: data.display_name,
      imageUrl: data.images[0]?.url || "",
    };
    setUserProfile(profile);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);
  if (!userProfile) {
    return <p>Loading user profile...</p>;
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
