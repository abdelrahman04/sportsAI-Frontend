import React, { useState, useEffect } from "react";
import {
  Bar,
  Radar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement
);

const teamsByLeague = {
  "Premier League": [
    "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Burnley",
    "Chelsea", "Crystal Palace", "Everton", "Fulham", "Liverpool", "Luton Town",
    "Manchester City", "Manchester Utd", "Newcastle Utd", "Nott'ham Forest",
    "Sheffield Utd", "Tottenham", "West Ham", "Wolves"
  ],
  "La Liga": [
    "Alavés", "Almería", "Athletic Club", "Atlético Madrid", "Barcelona", "Betis",
    "Cádiz", "Celta Vigo", "Getafe", "Girona", "Granada", "Las Palmas",
    "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad",
    "Sevilla", "Valencia", "Villarreal"
  ],
  "Bundesliga": [
    "Augsburg", "Bayern Munich", "Bochum", "Darmstadt 98", "Dortmund",
    "Eint Frankfurt", "Freiburg", "Gladbach", "Heidenheim", "Hoffenheim",
    "Köln", "Leverkusen", "Mainz 05", "RB Leipzig", "Stuttgart", "Union Berlin",
    "Werder Bremen", "Wolfsburg"
  ],
  "Serie A": [
    "Atalanta", "Bologna", "Cagliari", "Empoli", "Fiorentina", "Frosinone",
    "Genoa", "Hellas Verona", "Inter", "Juventus", "Lazio", "Lecce", "Milan",
    "Monza", "Napoli", "Roma", "Salernitana", "Sassuolo", "Torino", "Udinese"
  ],
  "Ligue 1": [
    "Brest", "Clermont Foot", "Le Havre", "Lens", "Lille", "Lorient", "Lyon",
    "Marseille", "Metz", "Monaco", "Montpellier", "Nantes", "Nice", "Paris S-G",
    "Reims", "Rennes", "Strasbourg", "Toulouse"
  ]
};

const attributeMap = {
  "Goals": "Gls",
  "Shots on Target": "SoT",
  "Shots On Target Per 90": "SoT/90",
  "Goals/Shots on target": "G/SoT",
  "Penalty Kicks Made": "PK",
  "xG (Expected Goals)": "xG",
  "Shot-creating actions": "SCA",
  "Shots from Freekick": "FK",
  "Assists": "Ast",
  "xA (Expected Assists)": "xA",
  "Key Passes": "KP",
  "Crosses into Penalty Area": "CrsPA",
  "Progressive Passes": "PrgP",
  "Completed Passes Total": "Cmp%",
  "Passes into Penalty Area": "PPA",
  "Successful Take-On%": "Succ%",
  "Carries": "Carries",
  "Tackles Won": "TklW",
  "% of Dribblers Tackled": "Tkl%",
  "Blocks": "Blocks",
  "Passes Block": "Pass",
  "Interceptions": "Int",
  "Clearances": "Clr",
  "Ball Recoveries": "Recov",
  "% of Aerial Duels Won": "Won%",
  "Goals Against /90": "GA90",
  "Save Percentage": "Save%",
  "Clean Sheet Percentage": "CS%",
  "Penalty Kicks Saved %": "Save%2",
  "Passes Completed (Launched)": "Cmp%",
  "Crosses Stopped": "Stp%",
  "% of Passes that were Launched": "Launch%",
};

const roles = {
  Forward: ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shot-creating actions"],
  Winger: ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shots from Freekick", "Assists", "xA (Expected Assists)", "Key Passes", "Crosses into Penalty Area"],
  "Attacking Mid": ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shots from Freekick", "Assists", "xA (Expected Assists)", "Key Passes", "Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Passes into Penalty Area"],
  "Centre Mid": ["Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Assists", "xA (Expected Assists)", "Successful Take-On%", "Carries", "Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances"],
  "Fullback": ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Successful Take-On%", "Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Assists", "xA (Expected Assists)", "Carries", "Passes into Penalty Area", "Key Passes"],
  "Centre Defense": ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Carries", "Successful Take-On%", "Ball Recoveries", "% of Aerial Duels Won"],
  Goalkeeping: ["Goals Against /90", "Save Percentage", "Clean Sheet Percentage", "Penalty Kicks Saved %", "Passes Completed (Launched)", "Crosses Stopped", "% of Passes that were Launched"]
};

// Player chart colors for consistency across visualizations
const playerColors = [
  { bg: "rgba(255, 99, 132, 0.2)", border: "rgba(255, 99, 132, 1)" },   // Red
  { bg: "rgba(54, 162, 235, 0.2)", border: "rgba(54, 162, 235, 1)" },   // Blue
  { bg: "rgba(255, 206, 86, 0.2)", border: "rgba(255, 206, 86, 1)" },   // Yellow
  { bg: "rgba(75, 192, 192, 0.2)", border: "rgba(75, 192, 192, 1)" },   // Green
  { bg: "rgba(153, 102, 255, 0.2)", border: "rgba(153, 102, 255, 1)" }, // Purple
];

const App = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [attributeWeight, setAttributeWeight] = useState(2);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSuggestions, setPlayerSuggestions] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:8000/players");
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        setAllPlayers(data.players);
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };
    fetchPlayers();
  }, []);

  // Update suggestions when player search changes
  useEffect(() => {
    if (playerSearch.trim() === "") {
      setPlayerSuggestions([]);
      return;
    }

    const searchTerm = playerSearch.toLowerCase();
    const suggestions = allPlayers
      .filter(player => 
        player.name.toLowerCase().includes(searchTerm) ||
        player.team.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5);

    setPlayerSuggestions(suggestions);
  }, [playerSearch, allPlayers]);

  // Function to standardize the data for radar charts
  const standardizeData = (data, averageProfile) => {
    if (!data || !Array.isArray(data)) {
      return { players: [], average: null };
    }
    
    // Get all attributes from both players and average profile
    const allAttributes = new Set();
    
    // Collect attributes from players
    data.forEach(player => {
      if (player.stats) {
        Object.keys(player.stats).forEach(key => {
          if (typeof player.stats[key] === "number") {
            allAttributes.add(key);
          }
        });
      }
    });
    
    // Collect attributes from average profile
    if (averageProfile) {
      Object.keys(averageProfile).forEach(key => {
        if (typeof averageProfile[key] === "number") {
          allAttributes.add(key);
        }
      });
    }
    
    const attributesList = Array.from(allAttributes);
    
    // Calculate min and max for each attribute individually
    const ranges = {};
    attributesList.forEach(attr => {
      const values = [];
      
      // Collect values from players
      data.forEach(player => {
        if (player.stats && player.stats[attr] !== undefined) {
          values.push(player.stats[attr]);
        }
      });
      
      // Add average profile value if it exists
      if (averageProfile && averageProfile[attr] !== undefined) {
        values.push(averageProfile[attr]);
      }
      
      if (values.length > 0) {
        ranges[attr] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });
    
    // Process players data
    const processedPlayers = data.map(player => {
      const processedStats = {};
      
      attributesList.forEach(attr => {
        const range = ranges[attr];
        if (range) {
          const value = player.stats?.[attr];
          if (value !== undefined) {
            if (range.max === range.min) {
              processedStats[attr] = 0.5;
            } else {
              processedStats[attr] = (value - 0) / (range.max - 0);
            }
          } else {
            // If player is missing an attribute, set it to 0
            processedStats[attr] = 0;
          }
        }
      });
      
      return {
        ...player,
        standardizedStats: processedStats
      };
    });
    
    // Process the average profile
    let processedAverage = null;
    if (averageProfile) {
      processedAverage = {};
      attributesList.forEach(attr => {
        const range = ranges[attr];
        if (range) {
          const value = averageProfile[attr];
          if (value !== undefined) {
            if (range.max === range.min) {
              processedAverage[attr] = 0.5;
            } else {
              processedAverage[attr] = (value - range.min) / (range.max - range.min);
            }
          } else {
            // If average profile is missing an attribute, set it to 0
            processedAverage[attr] = 0;
          }
        }
      });
    }
    
    return {
      players: processedPlayers,
      average: processedAverage
    };
  };

  const prepareRadarData = (player, standardizedAverage, index) => {
    if (!player || !player.standardizedStats || !standardizedAverage) return null;

    // Get common attributes between player and average profile
    const commonAttributes = Object.keys(player.standardizedStats).filter(
      attr => standardizedAverage[attr] !== undefined
    );
    
    // Format the attribute labels for better display
    const labels = commonAttributes.map(key => 
      key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim()
    );
    
    // Create datasets for player and average
    return {
      labels,
      datasets: [
        {
          label: `${player.player}`,
          data: commonAttributes.map(attr => player.standardizedStats[attr]),
          backgroundColor: playerColors[index % playerColors.length].bg,
          borderColor: playerColors[index % playerColors.length].border,
          borderWidth: 2,
          pointBackgroundColor: playerColors[index % playerColors.length].border,
        },
        {
          label: "Team Average",
          data: commonAttributes.map(attr => standardizedAverage[attr]),
          backgroundColor: "rgba(128, 128, 128, 0.2)",
          borderColor: "rgba(128, 128, 128, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(128, 128, 128, 1)",
          pointStyle: 'circle',
        }
      ],
    };
  };

  // Function to prepare data for attribute comparison bar charts
  const prepareAttributeBarData = (players, attribute) => {
    if (!players || players.length === 0) return null;
    
    return {
      labels: players.map(player => player.player),
      datasets: [
        {
          label: attribute.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim(),
          data: players.map(player => 
            player.stats && player.stats[attribute] ? player.stats[attribute] : 0
          ),
          backgroundColor: players.map((_, index) => playerColors[index % playerColors.length].bg),
          borderColor: players.map((_, index) => playerColors[index % playerColors.length].border),
          borderWidth: 1,
        }
      ]
    };
  };

  // Helper function to prepare comparison bar chart
  const prepareComparisonData = (players) => {
    if (!players || players.length < 2 || !selectedAttributes || selectedAttributes.length === 0) return null;
    
    try {
      const topPlayers = players.slice(0, 5);
      
      // Only use the selected attributes that exist in player stats
      const validAttributes = selectedAttributes.filter(attr => 
        topPlayers[0].stats && typeof topPlayers[0].stats[attr] === "number"
      );

      if (validAttributes.length === 0) return null;
      
      return {
        labels: validAttributes,
        datasets: topPlayers.map((player, idx) => ({
          label: player.player,
          data: validAttributes.map(attr => player.stats[attr] || 0),
          backgroundColor: playerColors[idx % playerColors.length].bg,
          borderColor: playerColors[idx % playerColors.length].border,
          borderWidth: 1,
        })),
      };
    } catch (error) {
      console.error("Error preparing comparison data:", error);
      return null;
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setSelectedAttributes([]);
    setAnalysisResult(null);
  };

  const handleLeagueChange = (event) => {
    setSelectedLeague(event.target.value);
    setSelectedTeam("");
  };

  const handleCheckboxChange = (attribute) => {
    setSelectedAttributes((prev) => {
      const newAttributes = prev.includes(attribute)
        ? prev.filter((item) => item !== attribute)
        : [...prev, attribute];
      
      return newAttributes;
    });
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player === selectedPlayer ? null : player);
  };

  const handleSuggestionClick = (player) => {
    setPlayerSearch(player.name);
    setSelectedRole(player.position);
    setPlayerSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (searchMode) {
      if (!playerSearch || !selectedTeam || !selectedLeague) {
        setError("Please select a player, league, and team");
        return;
      }
    } else {
      if (!selectedRole || !selectedTeam || !selectedLeague) {
        setError("Please select a role, league, and team");
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const endpoint = searchMode ? "/analyze-player-to-player" : "/analyze-players";
      const body = searchMode ? {
        player_name: playerSearch,
        team: selectedTeam,
      } : {
        position: selectedRole,
        team: selectedTeam,
        league: selectedLeague,
        specific_role_cols: selectedAttributes.map(attr => attributeMap[attr] || attr),
        specific_role_weight: attributeWeight
      };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      if (data && data.similar_players && data.average_profile) {
        data.similar_players = data.similar_players.slice(0, 5);
        const standardizedData = standardizeData(data.similar_players, data.average_profile);
        data.similar_players = standardizedData.players;
        data.standardized_average = standardizedData.average;
      }
      
      setAnalysisResult(data);
      setSelectedPlayer(null);
    } catch (err) {
      setError("Failed to fetch analysis results. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            TalentVision AI
          </h1>
          <p className="text-gray-600">
            Advanced analytics for player performance evaluation
          </p>
        </header>

        {/* Selection Panel - Now Horizontal */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Player Selection Criteria
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Search Mode:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={searchMode}
                  onChange={() => {
                    setSearchMode(!searchMode);
                    setPlayerSearch("");
                    setPlayerSuggestions([]);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Role Selection - Only show in attribute mode */}
            {!searchMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Role
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={handleRoleChange}
                  value={selectedRole}
                >
                  <option value="">Select a role</option>
                  {Object.keys(roles).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Player Search - Only show in search mode */}
            {searchMode && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Player
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Add a small delay to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Type player name..."
                />
                {showSuggestions && playerSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {playerSuggestions.map((player, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent the blur event from firing
                          setPlayerSearch(player.name);
                          setSelectedRole(player.position);
                          setPlayerSuggestions([]);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.team} • {player.position}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* League Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={handleLeagueChange}
                value={selectedLeague}
              >
                <option value="">Select a league</option>
                {Object.keys(teamsByLeague).map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={(e) => setSelectedTeam(e.target.value)}
                value={selectedTeam}
                disabled={!selectedLeague}
              >
                <option value="">Select a team</option>
                {selectedLeague && teamsByLeague[selectedLeague].map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Generate Scouting Report"
                )}
              </button>
            </div>
          </div>

          {/* Attributes Selection - Only show in attribute mode */}
          {!searchMode && selectedRole && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select Attributes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {roles[selectedRole].map((attribute) => (
                  <label
                    key={attribute}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedAttributes.includes(attribute)
                        ? "bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedAttributes.includes(attribute)}
                      onChange={() => handleCheckboxChange(attribute)}
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {attribute}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Collective Weight Slider */}
              {selectedAttributes.length > 0 && (
                <div className="mt-4 flex items-center gap-4 bg-gray-50 p-3 rounded-lg max-w-md">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">Attribute Weight</span>
                  </div>
                  <div className="flex-grow flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={attributeWeight}
                      onChange={(e) => setAttributeWeight(parseInt(e.target.value))}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">{attributeWeight}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500">Higher = More Focus</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Panel - Now Full Width */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Scouting Report
          </h2>

          {analysisResult ? (
            <div className="space-y-8">
              {/* Selected Criteria */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Selected Criteria:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
                    {analysisResult.position}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">
                    {selectedLeague}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded">
                    {analysisResult.team}
                  </span>
                  {selectedAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Players */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Team Players:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.team_players?.map((player) => (
                    <span
                      key={player}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top 5 Suggested Players */}
              {analysisResult.similar_players && analysisResult.similar_players.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Top 5 Suggested Players
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.similar_players.map((player, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg cursor-pointer transition duration-200 ${
                          selectedPlayer === player ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handlePlayerSelect(player)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                              style={{ backgroundColor: playerColors[index % playerColors.length].bg }}>
                            <span className="font-bold text-lg">{index + 1}</span>
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-lg">{player.player}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                {player.team || 'Unknown Team'}
                              </span>
                              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                {player.position || analysisResult.position}
                              </span>
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                                Distance: {player.distance ? player.distance.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Radar Charts for Each Player */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Player Performance Analysis
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {analysisResult.similar_players.map((player, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-3 text-center">
                            {player.player} vs. Team Average
                          </h4>
                          <div className="h-64">
                            <Radar
                              data={prepareRadarData(player, analysisResult.standardized_average, index)}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  r: {
                                    angleLines: {
                                      display: true,
                                    },
                                    suggestedMin: 0,
                                    suggestedMax: 1,
                                    ticks: {
                                      stepSize: 0.2
                                    }
                                  },
                                },
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        return `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Attribute-based Bar Charts */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Player Attribute Comparison
                    </h3>
                    
                    {/* Comparison Bar Chart */}
                    {selectedAttributes.length > 0 && prepareComparisonData(analysisResult.similar_players) && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Key Attributes Comparison
                        </h4>
                        <div className="h-80">
                          <Bar
                            data={prepareComparisonData(analysisResult.similar_players)}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                },
                              },
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Individual attribute comparisons */}
                    {analysisResult.similar_players.length > 0 && analysisResult.similar_players[0].stats && (
                      <div className="space-y-6">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Individual Attribute Comparisons
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.keys(analysisResult.similar_players[0].stats)
                            .filter(attr => typeof analysisResult.similar_players[0].stats[attr] === "number")
                            .map((attribute, attrIndex) => (
                              <div key={attrIndex} className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-800 mb-2 text-center">
                                  {attribute.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim()}
                                </h5>
                                <div className="h-48">
                                  <Bar
                                    data={prepareAttributeBarData(analysisResult.similar_players, attribute)}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      indexAxis: 'y',
                                      scales: {
                                        x: {
                                          beginAtZero: true,
                                        },
                                      },
                                      plugins: {
                                        legend: {
                                          display: false,
                                        },
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detailed Player Profiles */}
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      Complete Player Profiles
                    </h3>
                    
                    {analysisResult.similar_players.map((player, index) => (
                      <div key={index} className="mb-6">
                        <div 
                          className="p-5 rounded-lg mb-4"
                          style={{ 
                            backgroundColor: playerColors[index % playerColors.length].bg,
                            borderLeft: `6px solid ${playerColors[index % playerColors.length].border}`
                          }}  
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <h4 className="text-xl font-bold">{player.player}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-white bg-opacity-70 text-gray-800 text-sm px-3 py-1 rounded-full">
                                  Team: {player.team || "Unknown"}
                                </span>
                                <span className="bg-white bg-opacity-70 text-gray-800 text-sm px-3 py-1 rounded-full">
                                  Position: {player.position || analysisResult.position}
                                </span>
                                <span className="bg-white bg-opacity-70 text-gray-800 text-sm px-3 py-1 rounded-full">
                                  Age: {player.age || "N/A"}
                                </span>
                                {player.nationality && (
                                  <span className="bg-white bg-opacity-70 text-gray-800 text-sm px-3 py-1 rounded-full">
                                    Nationality: {player.nationality}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 md:mt-0">
                              <span className="inline-block bg-white text-gray-800 text-lg font-bold px-4 py-2 rounded-lg">
                                Distance: {player.distance ? player.distance.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Player Stats Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="p-4 border-b border-gray-200">
                            <h5 className="font-medium text-gray-800">Performance Statistics</h5>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attribute
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team Avg
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fulfilment
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {player.stats && Object.entries(player.stats)
                                  .filter(([, value]) => typeof value === "number")
                                  .map(([key, value], statIdx) => {
                                    const teamAvg = analysisResult.average_profile?.[key] || 0;
                                    //const difference = value - teamAvg;
                                    //const percentDiff = teamAvg !== 0 ? (difference / teamAvg) * 100 : 0;
                                    
                                    return (
                                      <tr key={statIdx} className={statIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim()}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                          {typeof value === 'number' ? value.toFixed(2) : value}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {teamAvg.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <div className="flex items-center">
                                            {(() => {
                                              let fulfillmentPercentage;
                                              if (teamAvg === 0) {
                                                fulfillmentPercentage = value > 0 ? value*100 : 100;
                                              } else {
                                                fulfillmentPercentage = (value / teamAvg) * 100;
                                              }

                                              if (fulfillmentPercentage >= 100) {
                                                return (
                                                  <span className="text-green-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    {fulfillmentPercentage.toFixed(1)}%
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span className="text-red-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    {fulfillmentPercentage.toFixed(1)}%
                                                  </span>
                                                );
                                              }
                                            })()}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Strengths and Weaknesses */}
                        {player.stats && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-white rounded-lg shadow p-4">
                              <h5 className="font-medium text-green-600 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                Key Strengths
                              </h5>
                              <ul className="space-y-2">
                                {Object.entries(player.stats)
                                  .filter(([, value]) => typeof value === "number")
                                  .map(([key, value]) => {
                                    const teamAvg = analysisResult.average_profile?.[key] || 0;
                                    let fulfillmentPercentage;
                                    if (teamAvg === 0) {
                                      fulfillmentPercentage = value > 0 ? value*100 : 100;
                                    } else {
                                      fulfillmentPercentage = (value / teamAvg) * 100;
                                    }
                                    return { key, fulfillmentPercentage };
                                  })
                                  .filter(item => item.fulfillmentPercentage >= 100)
                                  .sort((a, b) => b.fulfillmentPercentage - a.fulfillmentPercentage)
                                  .slice(0, 5)
                                  .map((item, i) => (
                                    <li key={i} className="flex items-center text-sm">
                                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                      <span className="text-gray-800">
                                        {item.key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="ml-auto text-green-600 font-medium">
                                        {item.fulfillmentPercentage.toFixed(1)}%
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow p-4">
                              <h5 className="font-medium text-red-600 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Development Areas
                              </h5>
                              <ul className="space-y-2">
                                {Object.entries(player.stats)
                                  .filter(([, value]) => typeof value === "number")
                                  .map(([key, value]) => {
                                    const teamAvg = analysisResult.average_profile?.[key] || 0;
                                    let fulfillmentPercentage;
                                    if (teamAvg === 0) {
                                      fulfillmentPercentage = value > 0 ? value*100 : 100;
                                    } else {
                                      fulfillmentPercentage = (value / teamAvg) * 100;
                                    }
                                    return { key, fulfillmentPercentage };
                                  })
                                  .filter(item => item.fulfillmentPercentage < 100)
                                  .sort((a, b) => a.fulfillmentPercentage - b.fulfillmentPercentage)
                                  .slice(0, 5)
                                  .map((item, i) => (
                                    <li key={i} className="flex items-center text-sm">
                                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                      <span className="text-gray-800">
                                        {item.key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="ml-auto text-red-600 font-medium">
                                        {item.fulfillmentPercentage.toFixed(1)}%
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No report generated
              </h3>
              <p className="text-gray-500 max-w-md">
                Select player role, attributes, league and team to generate a
                scouting report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;