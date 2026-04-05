import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Zap, ExternalLink, Globe } from "lucide-react";
import { getSharedItem } from "../services/save.api";

const Share = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        const data = await getSharedItem(id);
        console.log("Shared Data Received:", data); // Check in Console
        if (data) {
          setItem(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Neural Sync Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#010103] flex flex-col items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin w-12 h-12 mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">
          Accessing Vault...
        </p>
      </div>
    );

  if (error || !item)
    return (
      <div className="min-h-screen bg-[#010103] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4 opacity-40" />
        <h2 className="text-white font-black uppercase tracking-widest text-lg italic">
          Access Denied
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Fragment not found or link expired.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 text-indigo-400 font-bold uppercase text-[10px] tracking-[0.3em] border-b border-indigo-500/20 pb-1"
        >
          Return Home
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#010103] text-gray-300 font-sans p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[140px] rounded-full" />

      <div className="max-w-2xl mx-auto mt-20 relative z-10">
        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Zap size={14} fill="#6366f1" className="text-indigo-500" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
              Synaptic Link Verified
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase italic mb-8">
            {item.title}
          </h1>

          {item.note && (
            <div className="bg-indigo-500/5 border-l-2 border-indigo-500/40 p-6 rounded-r-2xl mb-10">
              <p className="text-gray-300 italic leading-relaxed">
                "{item.note}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-12">
            {item.tags?.map((t) => (
              <span
                key={t}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest"
              >
                #{t}
              </span>
            ))}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Access Source Material <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Share;
