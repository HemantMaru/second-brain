import { useSelector } from "react-redux";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Pin,
  Hash,
  FolderOpen,
  Globe,
  Video,
  Camera,
  ArrowLeft,
  Cpu,
  TrendingUp,
  Layers,
} from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();
  // IMPORTANT: Keeping original Redux logic exactly as provided
  const items = useSelector((state) => state.save.saveItem) || [];

  const stats = useMemo(() => {
    const total = items.length;
    const pinned = items.filter((item) => item.isPinned).length;

    const tagCount = {};
    const collectionCount = {};
    const platformCount = { youtube: 0, instagram: 0, web: 0 };

    items.forEach((item) => {
      item.tags?.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });

      if (item.collection) {
        collectionCount[item.collection] =
          (collectionCount[item.collection] || 0) + 1;
      }

      const url = item.url?.toLowerCase() || "";
      if (url.includes("youtube.com") || url.includes("youtu.be"))
        platformCount.youtube++;
      else if (url.includes("instagram.com")) platformCount.instagram++;
      else platformCount.web++;
    });

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const topCollections = Object.entries(collectionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { total, pinned, topTags, topCollections, platformCount };
  }, [items]);

  // Improved StatCard with responsive sizing and premium hover
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="relative group h-full">
      {/* Outer Glow Effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-15 transition duration-500 rounded-[1.5rem] md:rounded-[2rem] blur-sm`}
      />

      <div className="relative h-full bg-[#0a0a0c] border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-[-4px] group-hover:border-white/20 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
            <Icon
              size={18}
              className="text-gray-400 group-hover:text-white transition-colors"
            />
          </div>
          <Zap
            size={12}
            className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all animate-pulse"
          />
        </div>

        <div>
          <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">
            {label}
          </p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter truncate">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020204] text-gray-300 font-sans antialiased pb-10 md:pb-20 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* --- Responsive Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[100%] md:w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] md:blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[100%] md:w-[50%] h-[50%] bg-purple-600/5 blur-[120px] md:blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
        {/* --- Responsive Header --- */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 md:mb-16 border-b border-white/5 pb-8 md:pb-12">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all group active:scale-95"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <div className="overflow-hidden">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2 md:gap-3">
                Command<span className="text-indigo-500">Center</span>
                <TrendingUp size={20} className="text-indigo-400 shrink-0" />
              </h1>
              <p className="text-[8px] md:text-[10px] text-gray-500 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mt-1 md:mt-2 flex items-center gap-2">
                <Cpu size={10} className="shrink-0" /> Neural Network Status:
                Optimal
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center bg-indigo-500/10 border border-indigo-500/20 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3">
            <Activity
              className="text-indigo-400 animate-pulse"
              size={14}
              md:size={18}
            />
            <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">
              Live Sync Active
            </span>
          </div>
        </header>

        {/* --- Primary Stats Grid (Responsive 1 -> 2 -> 4 Columns) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatCard
            icon={Layers}
            label="Total Fragments"
            value={stats.total}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            icon={Pin}
            label="High Priority"
            value={stats.pinned}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={Hash}
            label="Lead Descriptor"
            value={stats.topTags.length ? stats.topTags[0][0] : "None"}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={FolderOpen}
            label="Core Cluster"
            value={
              stats.topCollections.length ? stats.topCollections[0][0] : "None"
            }
            color="from-cyan-500 to-blue-500"
          />
        </div>

        {/* --- Detailed Breakdown (Responsive 1 -> 2 Columns) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Platform Distribution Card */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden">
            <h2 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 flex items-center gap-3">
              <PieChart size={14} className="text-indigo-500" /> Platform
              Connectivity
            </h2>
            <div className="space-y-6 md:space-y-8">
              {[
                {
                  name: "YouTube Protocol",
                  count: stats.platformCount.youtube,
                  icon: Video,
                  color: "bg-red-500",
                },
                {
                  name: "Instagram Network",
                  count: stats.platformCount.instagram,
                  icon: Camera,
                  color: "bg-pink-500",
                },
                {
                  name: "Global Web Interface",
                  count: stats.platformCount.web,
                  icon: Globe,
                  color: "bg-blue-500",
                },
              ].map((p) => {
                const percentage = Math.round(
                  (p.count / stats.total) * 100 || 0,
                );
                return (
                  <div key={p.name} className="group cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <p.icon
                          size={14}
                          className="text-gray-500 group-hover:text-white transition-colors"
                        />
                        <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-white tracking-widest">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${p.color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semantic Density Card */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            <h2 className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-10 flex items-center gap-3">
              <BarChart3 size={14} className="text-indigo-500" /> Semantic
              Density
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
              {/* Peak Tags */}
              <div className="space-y-4 md:space-y-6">
                <p className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">
                  Peak Tags
                </p>
                {stats.topTags.length > 0 ? (
                  stats.topTags.map(([tag, count]) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-indigo-300 transition-colors truncate pr-2">
                        #{tag}
                      </span>
                      <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded text-indigo-400 border border-white/5 shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-700 italic">
                    No tags processed
                  </p>
                )}
              </div>

              {/* Top Clusters */}
              <div className="space-y-4 md:space-y-6">
                <p className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest border-l-2 border-cyan-500 pl-3">
                  Top Clusters
                </p>
                {stats.topCollections.length > 0 ? (
                  stats.topCollections.map(([col, count]) => (
                    <div
                      key={col}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-cyan-300 transition-colors truncate pr-2">
                        {col}
                      </span>
                      <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded text-cyan-400 border border-white/5 shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-700 italic">
                    No clusters found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Responsive System Footer --- */}
        <footer className="mt-12 md:mt-20 border-t border-white/5 pt-8">
          <p className="text-center text-gray-700 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] opacity-50 flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <Zap size={10} className="text-indigo-500" />
            NeuroVault Analytical Core v3.0.4
            <span className="hidden sm:inline">•</span>
            Neural Sync Verified
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Analytics;
