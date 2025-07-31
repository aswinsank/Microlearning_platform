import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentPage.css"; // Reusing the same CSS file

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError("");
      
      try {
        const leaderboardResponse = await axios.get("http://localhost:8000/api/leaderboard");
        setLeaderboard(leaderboardResponse.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
        setError("Failed to load leaderboard. Please try again.");
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const refreshLeaderboard = async () => {
    setLoading(true);
    setError("");
    
    try {
      const leaderboardResponse = await axios.get("http://localhost:8000/api/leaderboard");
      setLeaderboard(leaderboardResponse.data);
    } catch (err) {
      console.error("Failed to refresh leaderboard data:", err);
      setError("Failed to refresh leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏆 Leaderboard</h2>
        <button onClick={refreshLeaderboard} className="search-button" disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {loading && <p className="message">Loading leaderboard...</p>}
      {error && <p className="message error">{error}</p>}

      <div className="gamification-container">
        <div className="leaderboard">
          <h3>🥇 Top Players</h3>
          {leaderboard.length > 0 ? (
            <ol>
              {leaderboard.map((user, index) => (
                <li key={user.id || index}>
                  <span className="rank">{index + 1}</span>
                  <span className="name">{user.username || 'Unknown User'}</span>
                  <span className="points">{user.points || 0} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            !loading && <p>No leaderboard data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;