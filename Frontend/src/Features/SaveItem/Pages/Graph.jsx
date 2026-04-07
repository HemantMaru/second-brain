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
  Globe,
} from "lucide-react";

// ===========================================================================
// --- 🛠️ THUMBNAIL & FALLBACK UTILITIES (FAANG LEVEL OPTIMIZED) ---
// ===========================================================================

// Get main thumbnail
const getNeuralThumbnail = (url) => {
  if (!url) return null;
  const lowUrl = url.toLowerCase();

  if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be")) {
    const videoId = lowUrl.includes("youtu.be")
      ? url.split("/").pop().split("?")[0]
      : new URL(url).searchParams.get("v");
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  }
  if (lowUrl.match(/\.(jpeg|jpg|gif|png|webp|avif)$/)) {
    return url.startsWith("http")
      ? url
      : url.replace("file://", "http://localhost:3000/uploads/");
  }
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
};

// Ultimate Fallback: Platform Logos if original thumbnail fails
const getPlatformFallbackIcon = (url) => {
  if (!url) return "https://cdn-icons-png.flaticon.com/512/1005/1005141.png"; // Generic Globe
  const lowUrl = url.toLowerCase();

  if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be"))
    return "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
  if (lowUrl.includes("instagram.com"))
    return "https://cdn-icons-png.flaticon.com/512/1384/1384063.png";
  if (lowUrl.includes("twitter.com") || lowUrl.includes("x.com"))
    return "https://cdn-icons-png.flaticon.com/512/5969/5969020.png";
  if (lowUrl.includes("linkedin.com"))
    return "https://cdn-icons-png.flaticon.com/512/1384/1384014.png";
  if (lowUrl.includes("facebook.com"))
    return "https://cdn-icons-png.flaticon.com/512/1384/1384053.png";
  if (lowUrl.includes("github.com"))
    return "https://cdn-icons-png.flaticon.com/512/733/733553.png";
  if (lowUrl.includes(".pdf"))
    return "https://cdn-icons-png.flaticon.com/512/337/337946.png";

  return "https://cdn-icons-png.flaticon.com/512/1005/1005141.png"; // Default Web Icon
};

// ===========================================================================
// --- 🌌 MAIN 2D GRAPH COMPONENT ---
// ===========================================================================
const Graph = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fgRef = useRef();

  // Custom Cache Array to handle fallbacks seamlessly
  const imgCache = useRef({});
  const searchTimeoutRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [selectedNode, setSelectedNode] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- 🛰️ CANVAS RESPONSIVENESS ---
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
      if (!nodeMap.has(item._id)) {
        nodeMap.set(item._id, {
          id: item._id,
          name: item.title || "Untitled Synapse",
          val: isMobile ? 8 : 12,
          collection: item.collection || "Default",
          url: item.url,
          imgUrl: getNeuralThumbnail(item.url),
          fallbackIcon: getPlatformFallbackIcon(item.url), // Add Fallback icon URL
          tags: item.tags || [],
          fallbackColor: item.collection === "Coding" ? "#6366f1" : "#ec4899",
        });
      }
    });

    const nodes = Array.from(nodeMap.values());
    const links = [];

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
            opacity: Math.min(0.25 + commonTags.length * 0.15, 0.9),
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

  // --- 🛰️ 3. DEBOUNCED SEARCH ---
  const handleAISearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(async () => {
        if (value.length < 2) return;

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
      }, 500);
    },
    [graphData.nodes, isMobile],
  );

  const focusOnNode = useCallback(
    (node) => {
      setSelectedNode(node);
      setSearchTerm("");
      setSearchResults([]);
      setIsSearchFocused(false);

      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(isMobile ? 4 : 3, 1000);
      }
    },
    [isMobile],
  );

  // --- 🛰️ 4. BULLETPROOF NODE RENDERING WITH FALLBACKS ---
  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedNode?.id === node.id;
      const isSearched = searchResults.some((r) => r.id === node.id);

      const baseR = isMobile ? 12 : 16;
      const r = isSelected ? baseR * 1.6 : baseR;

      // 1. Draw Selection/Search Aura (Glowing Ring)
      if (isSelected || isSearched) {
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          r + (isSelected ? 6 : 4),
          0,
          2 * Math.PI,
          false,
        );
        ctx.fillStyle = isSelected
          ? "rgba(99, 102, 241, 0.45)"
          : "rgba(16, 185, 129, 0.45)";
        ctx.fill();
      }

      // 2. Setup Robust Image Cache with Fallback Logic
      const cacheKey = node.id; // Use ID to prevent overlap
      if (!imgCache.current[cacheKey]) {
        imgCache.current[cacheKey] = "loading"; // Set to loading immediately

        const loadFallback = () => {
          const fallbackImg = new Image();
          fallbackImg.crossOrigin = "Anonymous";
          fallbackImg.src = node.fallbackIcon;
          fallbackImg.onload = () => {
            imgCache.current[cacheKey] = { img: fallbackImg, isFallback: true };
          };
          fallbackImg.onerror = () => {
            imgCache.current[cacheKey] = "error"; // Ultimate fallback
          };
        };

        if (node.imgUrl) {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = node.imgUrl;
          img.onload = () => {
            imgCache.current[cacheKey] = { img: img, isFallback: false };
          };
          img.onerror = loadFallback; // Triggers fallback if main thumbnail breaks
        } else {
          loadFallback(); // Load fallback directly if no main thumbnail URL exists
        }
      }

      const cacheData = imgCache.current[cacheKey];

      // 3. Draw Rounded Image Node
      if (cacheData && cacheData !== "loading" && cacheData !== "error") {
        ctx.save();

        // Create Circular Clipping Path
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.clip();

        // Fill white background so transparent PNG logos (fallbacks) look perfect
        ctx.fillStyle = cacheData.isFallback ? "#f8fafc" : "#000000";
        ctx.fillRect(node.x - r, node.y - r, r * 2, r * 2);

        // Calculate size for padding (shrink logos slightly so they fit nicely)
        const padding = cacheData.isFallback ? r * 0.4 : 0;
        const imgSize = r * 2 - padding * 2;

        ctx.drawImage(
          cacheData.img,
          node.x - r + padding,
          node.y - r + padding,
          imgSize,
          imgSize,
        );

        ctx.restore(); // Remove clipping mask

        // Draw Outer Border
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.strokeStyle = isSelected ? "#ffffff" : "#6366f1";
        ctx.lineWidth = (isSelected ? 3 : 1.5) / globalScale;
        ctx.stroke();
      } else {
        // Ultimate Fallback: Just draw a colored circle with initial letter
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.fallbackColor || "#4f46e5";
        ctx.fill();

        ctx.font = `${r}px Inter`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((node.name[0] || "X").toUpperCase(), node.x, node.y);
      }

      // 4. Draw Crisp Labels
      const labelThreshold = isMobile ? 3.8 : 2.2;
      if (globalScale > labelThreshold || isSelected) {
        const label =
          node.name.length > 22
            ? node.name.substring(0, 19) + "..."
            : node.name;
        ctx.font = `${isSelected ? "900" : "600"} ${13 / globalScale}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text Shadow for readability over graph links
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 5;
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.85)";

        ctx.fillText(label, node.x, node.y + r + 14 / globalScale);
        ctx.shadowBlur = 0; // Reset shadow for next frame
      }
    },
    [selectedNode, searchResults, isMobile],
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

        {/* --- OPTIMIZED FRONTEND SEARCH BAR --- */}
        <div className="relative pointer-events-auto shadow-2xl group w-full">
          <div
            className={`flex items-center bg-[#0d0d12]/95 border ${isSearchFocused || searchTerm ? "border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.2)]" : "border-white/10"} rounded-2xl px-4 py-3.5 backdrop-blur-xl transition-all`}
          >
            <Search
              className={`w-5 h-5 ${isSearchFocused || searchTerm ? "text-indigo-400" : "text-gray-500"}`}
            />
            <input
              type="text"
              placeholder="Search concepts, collections..."
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={handleAISearch} // Linked to your API logic but retains visual states
              className="w-full bg-transparent border-none text-white outline-none ml-3 placeholder:text-gray-600 font-medium text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-500 hover:text-white"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50 flex flex-col gap-3">
        <button
          onClick={() => {
            if (fgRef.current) fgRef.current.zoomToFit(800, 150);
            setSelectedNode(null);
          }}
          title="Center Graph"
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl active:scale-90 transition-all border border-indigo-400"
        >
          <Target size={22} />
        </button>
        <button
          onClick={() => handleGetCreateSave()}
          title="Refresh Data"
          className="p-3.5 bg-[#0d0d12]/90 border border-white/10 text-gray-400 hover:text-white rounded-2xl backdrop-blur-xl active:scale-90 transition-all shadow-xl"
        >
          <RefreshCcw size={22} />
        </button>
      </div>

      {/* --- BOTTOM SELECTION OVERLAY (WITH FALLBACK HANDLING) --- */}
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
                <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/10 shrink-0 shadow-inner relative flex items-center justify-center bg-white/5">
                  <img
                    src={selectedNode.imgUrl || selectedNode.fallbackIcon}
                    className="w-full h-full object-cover"
                    alt="Node Preview"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loops
                      e.target.src = selectedNode.fallbackIcon;
                      e.target.className =
                        "w-full h-full object-contain p-4 bg-white"; // Fits logo perfectly
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg mb-2 inline-flex items-center gap-1.5 tracking-widest">
                    <Globe size={10} /> {selectedNode.collection}
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
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4.5 rounded-[1.8rem] text-[13px] font-black uppercase text-center active:scale-95 transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] tracking-widest"
              >
                <Zap size={18} /> Explore Intelligence
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 2D GRAPH ENGINE --- */}
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
        onNodeClick={focusOnNode}
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
