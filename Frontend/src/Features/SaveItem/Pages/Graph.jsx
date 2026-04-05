import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import ForceGraph2D from "react-force-graph-2d";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSave } from "../hook/useSave";
import axios from "axios";
import {
  ArrowLeft,
  RefreshCcw,
  Zap,
  Target,
  Search,
  XCircle,
  Loader2,
} from "lucide-react";

// --- 🛠️ THUMBNAIL UTILITY ---
const getNeuralThumbnail = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=800";
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be")) {
    const videoId = lowUrl.includes("youtu.be")
      ? url.split("/").pop().split("?")[0]
      : new URL(url).searchParams.get("v");
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : "https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=800";
  }
  if (lowUrl.includes(".pdf"))
    return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
  if (lowUrl.match(/\.(jpeg|jpg|gif|png|webp|avif)$/)) {
    return url.startsWith("http")
      ? url
      : url.replace("file://", "http://localhost:3000/uploads/");
  }
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
};

const Graph = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fgRef = useRef();
  const imgCache = useRef({});
  const searchTimeoutRef = useRef(null); // Fix: Debounce Ref

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- 🛰️ FIX: CANVAS SCALING & RESPONSIVENESS ---
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const { handleGetCreateSave } = useSave();
  const saveItem = useSelector((state) => state.save.saveItem) || [];

  useEffect(() => {
    if (saveItem.length === 0) handleGetCreateSave();
  }, [handleGetCreateSave, saveItem.length]);

  // --- 🛰️ 1. DATA TRANSFORMATION & DUPLICATE PREVENTION ---
  const graphData = useMemo(() => {
    const nodeMap = new Map();
    saveItem.forEach((item) => {
      // Logic Fix: Ensure strict unique IDs to prevent duplication glitches
      if (!nodeMap.has(item._id)) {
        nodeMap.set(item._id, {
          id: item._id,
          name: item.title || "Untitled Synapse",
          val: isMobile ? 8 : 12, // UI Fix: Scaled up for better visibility
          collection: item.collection || "Default",
          url: item.url,
          imgUrl: getNeuralThumbnail(item.url),
          tags: item.tags || [],
          fallbackColor: item.collection === "Coding" ? "#6366f1" : "#ec4899",
        });
      }
    });

    const nodes = Array.from(nodeMap.values());
    const links = [];

    // Link visibility fix: Optimized adjacency check
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const commonTags = nodeA.tags.filter((tag) => nodeB.tags.includes(tag));
        if (commonTags.length > 0) {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            strength: commonTags.length,
            opacity: Math.min(0.25 + commonTags.length * 0.15, 0.9), // Improved visibility
          });
        }
      }
    }
    return { nodes, links };
  }, [saveItem, isMobile]);

  // --- 🛰️ 2. STABILIZATION & ENGINE INITIALIZATION ---
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const timer = setTimeout(() => {
      try {
        // Fix: Proper stabilization methods to prevent jitter on zoom
        if (fg.d3AlphaDecay) fg.d3AlphaDecay(0.02);
        if (fg.d3VelocityDecay) fg.d3VelocityDecay(0.3);

        const linkForce = fg.d3Force("link");
        if (linkForce) linkForce.distance(isMobile ? 100 : 180);

        const chargeForce = fg.d3Force("charge");
        if (chargeForce) chargeForce.strength(isMobile ? -200 : -450);

        if (fg.d3ReheatSimulation) fg.d3ReheatSimulation();
      } catch (err) {
        console.warn("D3 Simulation stabilization retry...");
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isMobile, graphData]);

  // --- 🛰️ 3. FIX: DEBOUNCED SEARCH & BACKEND FALLBACK ---
  const handleAISearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(async () => {
        if (value.length < 2) return;

        // 1. Local Search (Case-Insensitive partial match)
        const match = graphData.nodes.find(
          (n) =>
            n.name.toLowerCase().includes(value.toLowerCase()) ||
            n.collection.toLowerCase().includes(value.toLowerCase()),
        );

        if (match && fgRef.current) {
          fgRef.current.centerAt(match.x, match.y, 1000);
          fgRef.current.zoom(isMobile ? 4 : 3, 1000);
          setSelectedNode(match);
          return;
        }

        // 2. Backend Fallback Logic
        if (value.length > 3) {
          setIsSearching(true);
          try {
            const res = await axios.get(
              `http://localhost:3000/api/item/search?query=${value}`,
            );
            const aiResults = res.data.data;
            if (aiResults?.length > 0) {
              const target = graphData.nodes.find(
                (n) => n.id === aiResults[0]._id,
              );
              if (target && fgRef.current) {
                fgRef.current.centerAt(target.x, target.y, 1200);
                fgRef.current.zoom(isMobile ? 4.5 : 3.5, 1200);
                setSelectedNode(target);
              }
            }
          } catch (err) {
            console.error("Neural search error", err);
          } finally {
            setIsSearching(false);
          }
        }
      }, 500); // Debounce duration
    },
    [graphData.nodes, isMobile],
  );

  // --- 🛰️ 4. FIX: NODE RENDERING & SELECTION HIGHLIGHT ---
  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedNode?.id === node.id;
      const baseR = isMobile ? 10 : 14;
      const r = isSelected ? baseR * 1.7 : baseR;

      // Selection Aura Fix
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + (isSelected ? 6 : 2), 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected
        ? "rgba(99, 102, 241, 0.45)"
        : "rgba(99, 102, 241, 0.12)";
      ctx.fill();

      // Image Rendering with Coverage logic
      if (!imgCache.current[node.imgUrl]) {
        const img = new Image();
        img.src = node.imgUrl;
        img.onload = () => {
          imgCache.current[node.imgUrl] = img;
        };
        imgCache.current[node.imgUrl] = "loading";
      }

      const cachedImg = imgCache.current[node.imgUrl];
      if (cachedImg && cachedImg !== "loading") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.clip();

        const scale = Math.max(
          (r * 2) / cachedImg.width,
          (r * 2) / cachedImg.height,
        );
        ctx.drawImage(
          cachedImg,
          node.x - (cachedImg.width * scale) / 2,
          node.y - (cachedImg.height * scale) / 2,
          cachedImg.width * scale,
          cachedImg.height * scale,
        );
        ctx.restore();

        // Stroke highlight
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isSelected ? "#ffffff" : "#6366f1";
        ctx.lineWidth = (isSelected ? 3.5 : 1.5) / globalScale;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.fallbackColor;
        ctx.fill();
      }

      // Fix: Label visibility logic based on scale and focus
      const labelThreshold = isMobile ? 3.8 : 2.2;
      if (globalScale > labelThreshold || isSelected) {
        const label =
          node.name.length > 22
            ? node.name.substring(0, 19) + "..."
            : node.name;
        ctx.font = `${isSelected ? "900" : "600"} ${13 / globalScale}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
        ctx.fillText(label, node.x, node.y + r + 14 / globalScale);
      }
    },
    [selectedNode, isMobile],
  );

  return (
    <div className="h-screen w-full bg-[#020204] relative overflow-hidden touch-none">
      {/* --- FLOATING UI CONTROLS --- */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50 flex flex-col gap-4 w-[calc(100%-48px)] max-w-md pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-[#0d0d12]/90 border border-white/10 rounded-2xl text-gray-400 hover:text-white backdrop-blur-xl transition-all shadow-2xl active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter">
            Neural<span className="text-indigo-500">Map</span>
          </h1>
        </div>
        <div className="relative pointer-events-auto shadow-2xl group">
          {isSearching ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          )}
          <input
            type="text"
            placeholder="Search synapses..."
            value={searchTerm}
            onChange={handleAISearch}
            className="w-full pl-12 pr-4 py-3.5 bg-[#0d0d12]/90 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50 flex flex-col gap-3">
        <button
          onClick={() => {
            if (fgRef.current) fgRef.current.zoomToFit(800, 150);
            setSelectedNode(null);
          }}
          title="Center Graph"
          className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-2xl active:scale-90 transition-all"
        >
          <Target size={22} />
        </button>
        <button
          onClick={() => handleGetCreateSave()}
          title="Refresh Data"
          className="p-3.5 bg-[#0d0d12]/90 border border-white/10 text-gray-400 hover:text-white rounded-2xl backdrop-blur-xl active:scale-90 transition-all"
        >
          <RefreshCcw size={22} />
        </button>
      </div>

      {/* --- SELECTION OVERLAY --- */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6 md:right-auto md:w-[400px] z-50 pointer-events-auto"
          >
            <div className="bg-[#0d0d12]/95 backdrop-blur-3xl border border-indigo-500/30 p-7 rounded-[2.8rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] relative">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-7 right-7 text-gray-500 hover:text-white transition-colors"
              >
                <XCircle size={26} />
              </button>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/10 shrink-0 shadow-inner">
                  <img
                    src={selectedNode.imgUrl}
                    className="w-full h-full object-cover"
                    alt="Node Preview"
                  />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-lg mb-2 inline-block tracking-widest">
                    {selectedNode.collection}
                  </span>
                  <h2 className="text-xl font-bold text-white truncate leading-tight tracking-tight">
                    {selectedNode.name}
                  </h2>
                </div>
              </div>
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4.5 rounded-[1.8rem] text-[13px] font-black uppercase text-center active:scale-95 transition-all shadow-xl tracking-widest"
              >
                Explore Intelligence
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={windowWidth}
        height={windowHeight}
        backgroundColor="#020204"
        linkWidth={(link) => Math.max(1.2, link.strength * 1.8)}
        linkColor={(link) => `rgba(99, 102, 241, ${link.opacity})`}
        linkDirectionalParticles={isMobile ? 1 : 2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={drawNode}
        // Fix: Increased pointer area for mobile touch precision
        nodePointerAreaPaint={(node, color, ctx) => {
          const r = isMobile ? 24 : 18;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        cooldownTicks={150}
        minZoom={0.4}
        maxZoom={12}
        onNodeClick={(node) => {
          setSelectedNode(node);
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 800);
            fgRef.current.zoom(isMobile ? 3.2 : 2.6, 800);
          }
        }}
        onBackgroundClick={() => setSelectedNode(null)}
      />

      <style>{`
        canvas { touch-action: none; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Graph;
