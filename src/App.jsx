import React, { useState } from "react";

const teams = [
  "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Burnley", "Chelsea",
  "Crystal Palace", "Everton", "Fulham", "Liverpool", "Luton Town", "Manchester City",
  "Manchester United", "Newcastle United", "Nottingham Forest", "Sheffield United", "Tottenham Hotspur",
  "West Ham United", "Wolverhampton Wanderers"
];

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
  Fullbacks: ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Successful Take-On%", "Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Assists", "xA (Expected Assists)", "Carries", "Passes into Penalty Area", "Key Passes"],
  "Centre Defense": ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Carries", "Successful Take-On%", "Ball Recoveries", "% of Aerial Duels Won"],
  Goalkeeping: ["Goals Against /90", "Save Percentage", "Clean Sheet Percentage", "Penalty Kicks Saved %", "Passes Completed (Launched)", "Crosses Stopped", "% of Passes that were Launched", "Assists", "xA (Expected Assists)"]
};

const App = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setSelectedAttributes([]);
  };

  const handleCheckboxChange = (attribute) => {
    setSelectedAttributes((prev) =>
      prev.includes(attribute)
        ? prev.filter((item) => item !== attribute)
        : [...prev, attribute]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedTeam) {
      setError("Please select a role, team, and at least one attribute");
      return;
    }

    setLoading(true);
    setError(null);
    console.log(JSON.stringify({
      position: selectedRole,
      team: selectedTeam,
      specific_role_cols: selectedAttributes.map(attr => attributeMap[attr] || attr)
    }));
    try {
      const response = await fetch("http://localhost:8000/analyze-players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position: selectedRole,
          team: selectedTeam,
          specific_role_cols: selectedAttributes.map(attr => attributeMap[attr] || attr)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Failed to fetch analysis results. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center w-96 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Select Role & Attributes</h1>

        <select 
          className="w-full p-2 border rounded-md mb-4" 
          onChange={handleRoleChange} 
          value={selectedRole}
        >
          <option value="">Select Role</option>
          {Object.keys(roles).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {selectedRole && (
          <div className="text-left mb-4">
            <h2 className="font-semibold">Attributes:</h2>
            {roles[selectedRole].map((attribute) => (
              <label key={attribute} className="block">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedAttributes.includes(attribute)}
                  onChange={() => handleCheckboxChange(attribute)}
                />
                {attribute}
              </label>
            ))}
          </div>
        )}

        <select 
          className="w-full p-2 border rounded-md mb-4" 
          onChange={(e) => setSelectedTeam(e.target.value)} 
          value={selectedTeam}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        <button 
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </div>

      {analysisResult && (
        <div className="p-6 bg-white rounded-2xl shadow-lg w-full max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>
          <div className="overflow-x-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
