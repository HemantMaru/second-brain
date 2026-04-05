import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSave } from "../hook/useSave";
import {
  Folder,
  Layers,
  ArrowRight,
  Database,
  LayoutGrid,
  Zap,
  Activity,
  ArrowLeft,
  Plus,
} from "lucide-react";

const Collection = () => {
  const navigate = useNavigate();
  const items = useSelector((state) => state.save.saveItem) || [];
  const { handleGetCreateSave } = useSave();

  useEffect(() => {
    handleGetCreateSave();
  }, []);
  const collectionData = useMemo(() => {
    const collections = [
      ...new Set(items.map((item) => item.collection || "Uncategorized")),
    ];
    return collections
      .map((col) => {
        const filtered = items.filter(
          (item) => (item.collection || "Uncategorized") === col,
        );
        return { name: col, count: filtered.length };
      })
      .sort((a, b) => b.count - a.count);
  }, [items]);

  return (
    <div className="min-h-screen bg-[#010103] text-gray-300 font-sans pb-20">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Exit
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-2xl">
                <LayoutGrid className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Memory<span className="text-indigo-500">Clusters</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.4em] uppercase flex items-center gap-2">
              <Database size={12} /> {items.length} Nodes Indexed
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
            <Activity className="text-green-500 animate-pulse" size={16} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {collectionData.length} Neural Sectors Active
            </span>
          </div>
        </div>
        {collectionData.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            No collections found 😭
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionData.map((col, idx) => (
            <div
              key={col.name}
              onClick={() =>
                navigate("/saved", { state: { collection: col.name } })
              }
              className="group relative cursor-pointer h-full"
            >
              <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
              <div className="relative bg-[#09090b] border border-white/5 p-8 rounded-[2rem] h-full flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-500 group-hover:-translate-y-2 shadow-2xl">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 group-hover:bg-indigo-500/20 transition-all">
                      <Folder className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5 font-black text-white text-[10px]">
                      {col.count}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">
                    {col.name}
                  </h2>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">
                    Sector ID: NV-0{idx + 1}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Access Cluster
                  </span>
                  <ArrowRight size={16} className="text-indigo-500" />
                </div>
              </div>
            </div>
          ))}
          <div
            onClick={() => navigate("/")}
            className="group border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[250px]"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Add New Node
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
