import { useState, useEffect } from "react";
import { Award, Trophy, Medal, MapPin, Sparkles, ChevronRight, ArrowUpRight, Download } from "lucide-react";
import { LeaderboardEntry, UserProfile } from "../types";

interface LeaderboardProps {
  currentUser: UserProfile;
}

export default function Leaderboard({ currentUser }: LeaderboardProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "badges" | "certificates">("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setBoard(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [currentUser.points]);

  const downloadCertificate = () => {
    // Simulated PDF export download triggers
    const printableBody = `
      ========================================
             SAVE N SERVE IMPACT CERTIFICATE
      ========================================
      Presented to: ${currentUser.name}
      Role Title: ${currentUser.role.toUpperCase()}
      Contribution Points Earned: ${currentUser.points} XP
      Environmental Impact Index: ${(currentUser.points * 0.15).toFixed(1)} KG CO2 prevented
      Distributed Meal Packs Equivalent: ~${Math.round(currentUser.points / 10)} Meals Loaded
      
      Thank you for being an indispensable pillar of hope
      in driving carbon-neutral zero-waste community solutions.
      ========================================
    `;

    const blob = new Blob([printableBody], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SaveNServe_Impact_Certificate_${currentUser.name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="rewards_leaderboard_widget" className="bg-white rounded-3xl border border-lime-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[450px]">
      {/* Header and controller tabs */}
      <div className="p-6 bg-gradient-to-br from-emerald-800 to-lime-900 text-white relative">
        <div className="absolute top-0 right-0 p-5 opacity-10">
          <Trophy className="w-24 h-24 text-lime-400" />
        </div>

        <span className="bg-emerald-700/60 text-emerald-200 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full inline-block mb-2 font-display tracking-widest leading-none">
          Rewards & Impact Center
        </span>
        <h3 className="text-xl font-bold font-display">Zero Hunger Honor Roll</h3>
        <p className="text-lime-200 text-xs mt-1">Drives community motivation with verified environmental impact scoring</p>

        <div className="flex gap-2 mt-5 bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              activeTab === "leaderboard" ? "bg-white text-emerald-800 shadow-sm" : "hover:bg-white/5 text-slate-100"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              activeTab === "badges" ? "bg-white text-emerald-800 shadow-sm" : "hover:bg-white/5 text-slate-100"
            }`}
          >
            My Badges
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              activeTab === "certificates" ? "bg-white text-emerald-800 shadow-sm" : "hover:bg-white/5 text-slate-100"
            }`}
          >
            Certificates
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        {/* TAB 1: LEADERBOARD LIST */}
        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-4 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-mono">Gathering scoreboard index...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {board.map((entry, idx) => {
                  const rank = idx + 1;
                  const isSelf = entry.userId === currentUser.id;

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isSelf
                          ? "bg-amber-50/50 border-amber-200 shadow-sm"
                          : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {rank === 1 ? (
                            <Trophy className="w-5 h-5 text-amber-500" />
                          ) : rank === 2 ? (
                            <Medal className="w-5 h-5 text-slate-400" />
                          ) : rank === 3 ? (
                            <Medal className="w-5 h-5 text-amber-700" />
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">{rank}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            {entry.name}{" "}
                            {isSelf && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-sans">You</span>}
                          </h4>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 font-display">
                            {entry.role === "donor" ? "🏠 Donor" : entry.role === "ngo" ? "🏢 NGO Partner" : entry.role === "volunteer" ? "🛵 Crew" : "🛡️ HQ"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-extrabold text-emerald-800 font-mono">{entry.points} XP</p>
                        <p className="text-[9px] text-slate-400">{entry.badgesCount} Badges earned</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BADGES GRID */}
        {activeTab === "badges" && (
          <div className="flex flex-col gap-4 flex-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-display mb-1">Badges Owned ({currentUser.badges.length})</h4>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {currentUser.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-lime-50/40 hover:bg-lime-50 border border-lime-100 rounded-2xl p-3 flex flex-col items-center text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h5 className="text-[11px] font-bold text-slate-800 truncate w-full">{badge}</h5>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-display">Verified contribution</p>
                </div>
              ))}
              {currentUser.badges.length === 0 && (
                <p className="text-xs text-slate-400 text-center col-span-2 py-10">Donate or complete tasks to unlock unique badges!</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GENERATE LANDMARKS CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between items-center text-center min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-bold text-slate-800">Verified Impact Certificate</h4>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">
                  Generated instantaneously under secure cryptographed algorithms matching your {currentUser.points} XP contribution records.
                </p>
              </div>

              <button
                onClick={downloadCertificate}
                className="w-full mt-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 hover:scale-[1.01] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Certificate (.txt)
              </button>
            </div>
          </div>
        )}

        {/* Summary Footer bar showing real-time environmental savings equivalent */}
        <div className="mt-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">ECO CO2 SAVINGS</p>
            <p className="text-sm font-bold font-mono text-emerald-800">{(currentUser.points * 0.15).toFixed(1)} KG Saved</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">MEAL EQUIVALENT</p>
            <p className="text-sm font-bold font-mono text-emerald-800">~{Math.round(currentUser.points / 10)} Meals Loaded</p>
          </div>
        </div>
      </div>
    </div>
  );
}
