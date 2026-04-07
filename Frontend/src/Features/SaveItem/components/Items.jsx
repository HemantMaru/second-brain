import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutAPI } from "../services/auth.api";
import { logout } from "../auth.slices";

// --- 🧠 Neural Iconography Mapping ---
import {
  Search,
  BrainCircuit,
  Video,
  Globe,
  Network,
  Loader2,
  ChevronRight,
  Zap,
  Pin,
  Share2,
  X,
  Target,
  FileText,
  LayoutGrid,
  Clock,
  Image as ImageIcon,
  Highlighter,
  Tag,
  LogOut,
  Bookmark,
  RefreshCcw,
  ShieldCheck,
  Command,
  Cpu,
  Unplug,
  Fingerprint,
  Settings,
  Filter,
  PanelLeft,
  PlayCircle,
  MessageSquare,
  BarChart3,
  Activity,
  Sparkles,
  ExternalLink,
  BoxSelect,
  Brain,
  History,
  Camera,
  AlertCircle,
} from "lucide-react";

// --- 🛰️ API Neural Gateway Services ---
import {
  getRecommendations,
  searchItems,
  getFlashcardsAPI,
  addHighlightAPI,
  saveYoutubeAPI,
} from "../services/save.api";

import { setsaveItem } from "../save.slice";
import { useSave } from "../hook/useSave";
import Flashcard from "../components/Flashcard";

// ===========================================================================
// --- 🛰️ COMPONENT: NODE CARD (OPTIMIZED) ---
// ===========================================================================
const NodeCard = memo(
  ({
    item,
    onFocus,
    onPin,
    onShare,
    getThumb,
    classify,
    contentIcon,
    autoTags,
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const type = classify(item.url);
    const thumb = getThumb(item);

    // ✅ TASK 6: MERGE BACKEND TAGS + AI TAGS + PLATFORM TAGS
    const allTags = useMemo(() => {
      const merged = [...new Set([...(item.tags || []), ...(autoTags || [])])];
      return merged.slice(0, 4);
    }, [item.tags, autoTags]);

    // LinkedIn, Twitter, FB, Insta Check for Microlink Fallback
    const isSocial =
      item.url?.includes("linkedin.com") ||
      item.url?.includes("twitter.com") ||
      item.url?.includes("x.com") ||
      item.url?.includes("facebook.com") ||
      item.url?.includes("instagram.com");

    const finalThumb = isSocial
      ? `https://api.microlink.io/?url=${encodeURIComponent(
          item.url,
        )}&screenshot=true&meta=false&embed=screenshot.url`
      : thumb;

    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group relative bg-[#09090b]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[480px] lg:min-h-[520px] shadow-2xl transition-all hover:border-indigo-500/40 cursor-pointer will-change-transform w-full"
        onClick={onFocus}
      >
        {/* ✅ TASK 4: FIX CARD IMAGE HEIGHT (h-[280px] lg:h-[320px]) */}
        <div className="relative w-full h-[280px] lg:h-[320px] overflow-hidden bg-zinc-900 border-b border-white/5 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/5 flex items-center justify-center">
              <BrainCircuit className="text-white/10" size={40} />
            </div>
          )}

          <img
            src={finalThumb}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imgLoaded
                ? "opacity-60 group-hover:opacity-90 group-hover:scale-110"
                : "opacity-0"
            }`}
            alt={item.title || "preview"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://api.microlink.io/?url=${encodeURIComponent(
                item.url,
              )}&screenshot=true`;
            }}
          />

          {type === "Videos" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayCircle className="text-white fill-indigo-600/20" size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-2xl z-10">
            {contentIcon}
            <span className="text-[9px] font-black uppercase tracking-widest">
              {type}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col flex-grow justify-between relative z-10">
          <div className="space-y-4">
            <h3 className="text-sm lg:text-base font-black text-slate-100 leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-indigo-400 transition-colors italic">
              {item.title || "Untitled Intelligence"}
            </h3>

            {/* ✅ TASK 6: RESPONSIVE TAG SYSTEM */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map((tag, idx) => (
                  <motion.span
                    key={`${tag}-${idx}`}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(99, 102, 241, 0.2)",
                      boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)",
                    }}
                    className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity pt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                {item.collection || "Omni_Vault"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
            <div className="flex gap-5">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await onPin();
                }}
                className={`transition-all hover:scale-125 active:scale-90 ${
                  item.isPinned
                    ? "text-orange-500"
                    : "text-slate-700 hover:text-white"
                }`}
              >
                <Pin size={18} fill={item.isPinned ? "currentColor" : "none"} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="text-slate-700 hover:text-white hover:scale-125 active:scale-90 transition-all"
              >
                <Share2 size={18} />
              </button>
            </div>
            <span className="text-[9px] font-black text-slate-800 tracking-widest italic uppercase">
              0x{item._id?.slice(-4) || "NULL"}
            </span>
          </div>
        </div>
      </motion.article>
    );
  },
);

// ===========================================================================
// --- 🛰️ MAIN COMPONENT ---
// ===========================================================================
const Items = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigationTabs = useMemo(
    () => [
      { id: "All", icon: <LayoutGrid size={18} />, label: "Omni Index" },
      { id: "Videos", icon: <Video size={18} />, label: "Stream Nodes" },
      { id: "Images", icon: <ImageIcon size={18} />, label: "Visual Frames" },
      { id: "Docs", icon: <FileText size={18} />, label: "Archives" },
      { id: "Web", icon: <Globe size={18} />, label: "Web Intel" },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedNode, setFocusedNode] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [notification, setNotification] = useState({
    active: false,
    text: "",
    type: "info",
  });

  const handleLogout = useCallback(async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed");
    }
  }, [dispatch, navigate]);

  const [ytInput, setYtInput] = useState("");
  const [isYtProcessing, setIsYtProcessing] = useState(false);
  const [relatedNodes, setRelatedNodes] = useState({});
  const [highlightBuffer, setHighlightBuffer] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    itemId: null,
  });

  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [recallDeck, setRecallDeck] = useState([]);
  const [isRecallSyncing, setIsRecallSyncing] = useState(false);

  const { handleGetCreateSave, handleDeleteSaveItems, handleTogglePin } =
    useSave();
  const saveItems = useSelector((state) => state.save.saveItem) || [];
  const user = useSelector((state) => state.auth?.user) || {
    name: "Neural Admin",
    email: "admin@neurovault.io",
  };

  // ✅ TASK 6: AUTO TAGS INJECTION (OPTIMIZED)
  const getAutoTags = useCallback((item) => {
    if (!item) return [];
    const url = item.url?.toLowerCase() || "";
    const title = item.title?.toLowerCase() || "";
    const tags = new Set();

    if (url.includes("youtube.com") || url.includes("youtu.be"))
      tags.add("youtube");
    if (url.includes("instagram.com")) tags.add("instagram");
    if (url.includes("linkedin.com")) tags.add("linkedin");
    if (url.includes("twitter.com") || url.includes("x.com"))
      tags.add("twitter");
    if (url.includes("facebook.com")) tags.add("facebook");

    if (title.includes("react")) tags.add("react");
    if (title.includes("js") || title.includes("javascript"))
      tags.add("javascript");
    if (title.includes("ai") || title.includes("gpt")) tags.add("ai");
    if (title.includes("job") || title.includes("hiring")) tags.add("career");

    title
      .split(" ")
      .slice(0, 2)
      .forEach((w) => {
        if (w.length > 3 && !["this", "that", "with"].includes(w)) tags.add(w);
      });

    return Array.from(tags);
  }, []);

  const pushNotification = useCallback((text, type = "info") => {
    setNotification({ text, type, active: true });
    setTimeout(
      () => setNotification({ text: "", type: "info", active: false }),
      4000,
    );
  }, []);

  useEffect(() => {
    handleGetCreateSave();
  }, [handleGetCreateSave]);

  useEffect(() => {
    if (focusedNode || isRecallOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [focusedNode, isRecallOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        handleGetCreateSave();
        return;
      }
      setIsSearching(true);
      try {
        const response = await searchItems(searchQuery);
        dispatch(setsaveItem(response.data || []));
      } catch (err) {
        pushNotification("Semantic Search pathway corrupted.", "error");
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch, handleGetCreateSave, pushNotification]);

  const classifyContentType = useCallback((url) => {
    if (!url) return "Web";
    const str = url.toLowerCase();
    if (str.includes("youtube.com") || str.includes("youtu.be"))
      return "Videos";
    if (str.match(/.(jpeg|jpg|gif|png|webp|avif)$/)) return "Images";
    if (str.includes(".pdf")) return "Docs";
    return "Web";
  }, []);

  // ✅ TASK 5: IMPROVED SOCIAL PREVIEW LOGIC
  const getSmartThumbnail = useCallback((item) => {
    if (!item || !item.url)
      return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800";

    const url = item.url;
    const lowUrl = url.toLowerCase();

    // YouTube Handling
    if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be")) {
      const vId = lowUrl.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : new URL(url).searchParams.get("v");
      return vId
        ? `https://img.youtube.com/vi/${vId}/hqdefault.jpg`
        : "[https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=800](https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=800)";
    }

    // Direct Image Link
    if (lowUrl.match(/\.(jpeg|jpg|png|webp|avif)$/)) return url;

    // Social Media Fallbacks (Microlink)
    if (
      lowUrl.includes("linkedin.com") ||
      lowUrl.includes("twitter.com") ||
      lowUrl.includes("x.com") ||
      lowUrl.includes("facebook.com") ||
      lowUrl.includes("instagram.com")
    ) {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
    }

    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  }, []);

  const resolveAssetProtocol = useCallback((url) => {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : url.replace("file://", "http://localhost:3000/uploads/");
  }, []);

  const executeDeepScan = useCallback(async () => {
    if (!ytInput)
      return pushNotification("URL required for ingestion.", "error");
    try {
      setIsYtProcessing(true);
      pushNotification("Synthesizing Metadata...", "info");
      await saveYoutubeAPI({ url: ytInput, collection: "Streaming Archives" });
      setYtInput("");
      await handleGetCreateSave();
      pushNotification("Deep Scan synchronization verified.", "success");
    } catch (err) {
      pushNotification("Neural ingestion protocol failed.", "error");
    } finally {
      setIsYtProcessing(false);
    }
  }, [ytInput, handleGetCreateSave, pushNotification]);

  const handleRecall = useCallback(
    async (id) => {
      setIsRecallOpen(true);
      setIsRecallSyncing(true);
      setRecallDeck([]);
      try {
        const res = await getFlashcardsAPI(id);
        setRecallDeck(res.data || []);
        pushNotification("Recall active.", "success");
      } catch (err) {
        pushNotification("Synthesis failed.", "error");
      } finally {
        setIsRecallSyncing(false);
      }
    },
    [pushNotification],
  );

  const handleShare = useCallback(
    async (item) => {
      const url = `${window.location.origin}/share/${item.shareId || item._id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(item._id);
        pushNotification("Link copied to clipboard.", "success");
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        pushNotification("Share failed.", "error");
      }
    },
    [pushNotification],
  );

  const captureNeuralFragment = useCallback((e, itemId) => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (text.length > 5) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setHighlightBuffer({
          visible: true,
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 60,
          text,
          itemId,
        });
      }
    }, 0);
  }, []);

  const persistHighlight = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!highlightBuffer.itemId || !highlightBuffer.text) return;
      try {
        await addHighlightAPI(highlightBuffer.itemId, highlightBuffer.text);
        if (focusedNode?._id === highlightBuffer.itemId) {
          setFocusedNode((prev) => ({
            ...prev,
            highlights: [
              ...(prev.highlights || []),
              { text: highlightBuffer.text, createdAt: new Date() },
            ],
          }));
        }
        setHighlightBuffer((prev) => ({ ...prev, visible: false }));
        window.getSelection().removeAllRanges();
        await handleGetCreateSave();
        pushNotification("Synapse fragment indexed.", "success");
      } catch (err) {
        pushNotification("Indexing failed.", "error");
      }
    },
    [highlightBuffer, focusedNode, handleGetCreateSave, pushNotification],
  );

  const cognitivePool = useMemo(() => {
    return saveItems
      .filter((node) => {
        const type = classifyContentType(node.url);
        const tabMatch = activeTab === "All" || type === activeTab;
        const searchMatch = (node.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const catMatch = activeCategory
          ? node.category === activeCategory
          : true;
        return tabMatch && searchMatch && catMatch;
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [saveItems, activeTab, searchQuery, activeCategory, classifyContentType]);

  const categories = useMemo(() => {
    const catSet = new Set();
    saveItems.forEach((i) => i.category && catSet.add(i.category));
    return [...catSet];
  }, [saveItems]);

  // ✅ TASK 1: CRITICAL RESURFACING SYSTEM FIX
  const memoryFlashes = useMemo(() => {
    if (!saveItems || saveItems.length === 0) return [];

    const now = Date.now();
    const twoDaysInMs = 172800000;

    // 1. Items older than 2 days
    let oldItems = saveItems.filter((i) => {
      const created = i.createdAt ? new Date(i.createdAt).getTime() : 0;
      return now - created > twoDaysInMs;
    });

    // 2. Mix: Shuffle old items
    let mixed = oldItems.sort(() => 0.5 - Math.random());

    // 3. Fill logic: If less than 3, add recent items or random
    if (mixed.length < 3) {
      const others = saveItems
        .filter((i) => !mixed.find((m) => m._id === i._id))
        .sort(() => 0.5 - Math.random());
      mixed = [...mixed, ...others].slice(0, 3);
    } else {
      mixed = mixed.slice(0, 3);
    }

    return mixed;
  }, [saveItems]);

  const discoverRelativity = useCallback(async (id) => {
    try {
      const res = await getRecommendations(id);
      setRelatedNodes((prev) => ({ ...prev, [id]: res.data || [] }));
    } catch (err) {
      console.error("Discovery failed");
    }
  }, []);

  // ✅ TASK 3: DESKTOP SIDEBAR FIX (z-index & pointer-events)
  const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <button
      onClick={() => {
        if (path) navigate(path);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative z-[110] pointer-events-auto ${
        active
          ? "bg-indigo-600/10 text-white border border-indigo-500/20"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <Icon
        size={20}
        className={
          active
            ? "text-indigo-400"
            : "group-hover:text-indigo-400 transition-colors"
        }
      />
      {(!isSidebarCollapsed || isMobileMenuOpen) && (
        <span className="text-sm font-bold tracking-tight">{label}</span>
      )}
    </button>
  );

  const ContentIcon = useCallback(
    ({ url }) => {
      const type = classifyContentType(url);
      const lowUrl = url?.toLowerCase() || "";
      if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be"))
        return <Video size={16} className="text-red-500" />;
      if (lowUrl.includes("instagram.com"))
        return <Camera size={16} className="text-pink-500" />;
      if (lowUrl.includes("linkedin.com"))
        return <FileText size={16} className="text-blue-600" />;
      if (lowUrl.includes("x.com") || lowUrl.includes("twitter.com"))
        return <MessageSquare size={16} className="text-sky-400" />;
      if (lowUrl.includes("facebook.com"))
        return <Globe size={16} className="text-blue-500" />;
      if (type === "Docs")
        return <FileText size={16} className="text-orange-500" />;
      if (type === "Images")
        return <ImageIcon size={16} className="text-purple-500" />;
      return <Globe size={16} className="text-indigo-500" />;
    },
    [classifyContentType],
  );

  return (
    <div className="flex h-screen bg-[#010103] text-gray-300 font-sans antialiased overflow-hidden selection:bg-indigo-500/30 relative">
      <AnimatePresence>
        {notification.active && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-[20000] px-8 py-4 rounded-2xl backdrop-blur-md border flex items-center gap-4 shadow-3xl ${
              notification.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {notification.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {highlightBuffer.visible && (
        <div
          className="fixed z-[10000] neural-action-popup"
          style={{ top: highlightBuffer.y, left: highlightBuffer.x }}
        >
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onMouseDown={persistHighlight}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-3 shadow-3xl border border-indigo-400"
          >
            <Highlighter size={14} /> Index Synapse
          </motion.button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[160] w-80 bg-[#09090b] border-r border-white/5 p-8 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <BrainCircuit className="text-white" size={22} />
                  </div>
                  <span className="text-xl font-black text-white italic uppercase">
                    Vault
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-3">
                <SidebarItem
                  icon={LayoutGrid}
                  label="Dashboard"
                  active={true}
                />
                <SidebarItem
                  icon={Network}
                  label="Knowledge Map"
                  path="/graph"
                />
                <SidebarItem
                  icon={BarChart3}
                  label="Analytics"
                  path="/analytics"
                />
                <SidebarItem icon={Activity} label="Create Node" path="/" />

                <div className="h-px bg-white/5 mx-2 my-4" />
                <SidebarItem icon={Settings} label="Core Settings" />
              </nav>
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-[2rem] mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className="text-xs font-bold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 text-red-400 font-black uppercase text-[10px] tracking-widest"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-black/40 backdrop-blur-md border-r border-white/5 relative z-[120] h-screen transition-all duration-500 ${
          isSidebarCollapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="p-8 flex items-center justify-between shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BrainCircuit className="text-white" size={22} />
              </div>
              <span className="text-xl font-black text-white italic tracking-tighter uppercase">
                Vault
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 relative z-[130] pointer-events-auto"
          >
            <PanelLeft size={20} />
          </button>
        </div>
        <nav className="flex-1 relative z-[130] px-4 mt-6 space-y-2 pointer-events-auto">
          <SidebarItem icon={LayoutGrid} label="Dashboard" active={true} />
          <SidebarItem icon={Network} label="Knowledge Map" path="/graph" />
          <SidebarItem icon={BarChart3} label="Analytics" path="/analytics" />
          <SidebarItem icon={Activity} label="Create Node" path="/" />
          <div className="my-6 h-px bg-white/5 mx-4" />
          <SidebarItem icon={Settings} label="Core Settings" />
        </nav>
        <div className="p-6 border-t border-white/5 overflow-hidden shrink-0">
          {!isSidebarCollapsed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-2xl">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
                    {user.name}
                  </p>
                  <p className="text-[9px] text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest relative z-[130] pointer-events-auto"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-white/10">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all relative z-[130] pointer-events-auto"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_transparent_50%)]">
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500"
            >
              <PanelLeft size={24} />
            </button>
            <div className="relative w-full max-w-lg lg:max-w-2xl group block">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
                size={20}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search synapses... (Ctrl + K)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                <Command size={12} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-500">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6 ml-4">
            <button className="p-3 bg-white/5 rounded-xl text-slate-500 border border-white/5">
              <History size={20} />
            </button>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 group cursor-pointer hover:border-indigo-500/50 transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-white/20">
                <Fingerprint size={18} />
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  Status
                </p>
                <p className="text-xs font-bold text-white mt-1">Authorized</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          {/* HERO SECTION */}
          <section className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/10 rounded-[2.5rem] p-8 lg:p-12 mb-10 lg:mb-16 flex flex-col xl:flex-row items-center gap-8 lg:gap-12 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                <Zap size={12} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Accelerator Active
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase leading-none tracking-tighter">
                Deep Ingestion
              </h2>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Instantly synchronize social nodes, transcripts and web nodes
                into cognitive persistent summaries.
              </p>
            </div>
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-red-500 transition-colors">
                  <Globe size={20} />
                </div>
                <input
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  placeholder="PASTE_LINK_HERE..."
                  className="w-full bg-black/60 border border-white/10 rounded-3xl py-5 lg:py-6 pl-16 pr-8 text-xs font-black tracking-widest text-white outline-none focus:border-red-500/40 transition-all"
                />
              </div>
              <button
                onClick={executeDeepScan}
                disabled={isYtProcessing}
                className="px-10 py-5 lg:py-6 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isYtProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Zap size={20} />
                )}
                Ingest
              </button>
            </div>
          </section>

          {/* CONTROLS */}
          <div className="flex flex-col gap-10 mb-12 lg:mb-16 border-b border-white/5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="flex gap-2 lg:gap-3 bg-white/5 p-1.5 lg:p-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                {navigationTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-3 px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-white text-black shadow-3xl scale-105"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-4 bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/20 shadow-xl">
                <History size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                  Resurfacing Pipeline Sync
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <Filter size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                  Clusters
                </span>
              </div>
              <button
                onClick={() => setActiveCategory("")}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                  !activeCategory
                    ? "bg-white text-black border-white shadow-xl"
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                }`}
              >
                Spectrum
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-xl"
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ TASK 2: RESURFACING UI IMPROVEMENT */}
          {!searchQuery && memoryFlashes.length > 0 && activeTab === "All" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 lg:mb-20"
            >
              <div className="flex items-center gap-4 mb-8">
                <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                  Memory Resurfacing
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {memoryFlashes.map((node) => (
                  <motion.div
                    key={node._id}
                    whileHover={{ scale: 1.03, rotate: -1 }}
                    onClick={() => {
                      setFocusedNode(node);
                      discoverRelativity(node._id);
                    }}
                    className="relative group bg-indigo-600/[0.04] border border-indigo-500/20 p-8 rounded-[2.5rem] cursor-pointer transition-all flex items-center justify-between shadow-[0_0_40px_rgba(79,70,229,0.1)] backdrop-blur-md overflow-hidden"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all" />

                    <div className="flex items-center gap-6 overflow-hidden relative z-10">
                      <div className="p-4 bg-indigo-500/20 rounded-2xl group-hover:bg-indigo-500 transition-all duration-500 shrink-0 shadow-lg shadow-indigo-500/20">
                        <Clock
                          size={22}
                          className="text-indigo-400 group-hover:text-white"
                        />
                      </div>
                      <div className="overflow-hidden text-left">
                        <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors truncate block uppercase tracking-tight italic">
                          {node.title || "Restoring Synapse..."}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.3em]">
                            Synapse Recall
                          </span>
                          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={24}
                      className="text-indigo-500/40 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all shrink-0 relative z-10"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* GRID VIEW */}
          {cognitivePool.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-10 pb-20">
              <AnimatePresence mode="popLayout">
                {cognitivePool.map((item) => (
                  <NodeCard
                    key={item._id}
                    item={item}
                    autoTags={getAutoTags(item)}
                    onFocus={() => {
                      setFocusedNode(item);
                      discoverRelativity(item._id);
                    }}
                    onPin={() => handleTogglePin(item._id)}
                    onShare={() => handleShare(item)}
                    getThumb={getSmartThumbnail}
                    classify={classifyContentType}
                    contentIcon={<ContentIcon url={item.url} />}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-60 opacity-30 text-center">
              <Unplug size={80} className="mb-8" />
              <h3 className="text-5xl font-black uppercase tracking-tighter italic">
                Sector Offline
              </h3>
              <p className="text-xs font-black uppercase tracking-[0.5em] mt-4">
                System awaiting cognitive synchronization
              </p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {focusedNode !== null && (
          <NodeExpansionModal
            node={focusedNode}
            onClose={() => setFocusedNode(null)}
            getThumb={getSmartThumbnail}
            resolveAsset={resolveAssetProtocol}
            classify={classifyContentType}
            onRecall={() => {
              setFocusedNode(null);
              handleRecall(focusedNode._id);
            }}
            onHighlight={captureNeuralFragment}
            onDelete={() => {
              if (window.confirm("Purge thought node permanently?")) {
                handleDeleteSaveItems(focusedNode._id);
                setFocusedNode(null);
              }
            }}
            onTogglePin={() => handleTogglePin(focusedNode._id)}
            related={relatedNodes[focusedNode._id] || []}
            setNode={setFocusedNode}
            discover={discoverRelativity}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecallOpen && (
          <RecallSystemModal
            isLoading={isRecallSyncing}
            deck={recallDeck}
            onClose={() => setIsRecallOpen(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes loading { 0% { transform: translateX(-250%); } 100% { transform: translateX(450%); } }
    .shadow-3xl { box-shadow: 0 50px 150px -30px rgba(0, 0, 0, 1); }
    .animate-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
    </div>
  );
};

// ===========================================================================
// --- 🛰️ EXPANDED MODAL COMPONENT ---
// ===========================================================================
const NodeExpansionModal = ({
  node,
  onClose,
  getThumb,
  resolveAsset,
  classify,
  onRecall,
  onHighlight,
  onDelete,
  onTogglePin,
  related,
  setNode,
  discover,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-12 bg-black/98 backdrop-blur-md overflow-hidden pointer-events-auto"
    >
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-7xl h-[85vh] md:h-[80vh] lg:h-[85vh] flex flex-col md:flex-row bg-[#0c0c0e] border border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-3xl overflow-hidden pointer-events-auto"
      >
        <div className="w-full md:w-[45%] h-[250px] md:h-full relative overflow-hidden bg-black border-r border-white/5 shrink-0">
          <img
            decoding="async"
            src={getThumb(node)}
            loading="lazy"
            className="w-full h-full object-cover opacity-60"
            alt={node.title || "Focus"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 z-20 space-y-6 text-left">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
              {node.title || "Untitled"}
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Globe size={14} /> {classify(node.url)} Node
              </div>
              <div className="bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center gap-3 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <Tag size={14} /> {node.category || "General Intel"}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-6">
              <button
                onClick={() => window.open(node.url, "_blank")}
                className="px-8 lg:px-10 py-4 lg:py-5 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-3xl flex items-center gap-3"
              >
                Launch <ExternalLink size={18} />
              </button>
              <button
                onClick={onRecall}
                className="px-8 lg:px-10 py-4 lg:py-5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 shadow-2xl active:scale-95"
              >
                <Target size={18} /> Recall
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto h-full max-h-full min-h-0 no-scrollbar p-6 md:p-8 lg:p-12 space-y-10 bg-[#0c0c0e] relative text-left">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 lg:top-12 lg:right-12 p-3 lg:p-6 bg-white/5 rounded-full hover:bg-red-500 transition-all border border-white/5 hover:rotate-90 z-20"
          >
            <X size={28} />
          </button>

          <section className="animate-in">
            <div className="flex items-center gap-6 mb-10 opacity-60">
              <Sparkles size={24} className="text-indigo-400" />
              <h3 className="text-xl font-black uppercase tracking-[0.6em] text-white italic text-left">
                Neural Synthesis
              </h3>
              <div className="h-px flex-grow bg-white/5" />
            </div>
            <div className="p-8 lg:p-14 bg-white/[0.01] border border-white/5 rounded-[3rem] lg:rounded-[4rem] border-l-[16px] border-l-indigo-600 relative shadow-inner">
              <Fingerprint
                size={60}
                className="absolute top-10 right-12 text-indigo-500 opacity-5 animate-pulse"
              />
              <p
                onMouseUp={(e) => onHighlight(e, node._id)}
                onTouchEnd={(e) => onHighlight(e, node._id)}
                className="text-base md:text-lg lg:text-xl text-slate-300 italic leading-relaxed break-words whitespace-pre-wrap font-medium selection:bg-indigo-600 selection:text-white transition-all text-left"
              >
                {node.note || "Awaiting intelligence synthesis..."}
              </p>
              <div className="mt-12 flex items-center gap-4 text-[10px] font-black uppercase text-slate-700 tracking-[0.5em]">
                <BoxSelect size={18} /> Drag text to segment thought
              </div>
            </div>
          </section>

          {node.highlights?.length > 0 && (
            <section className="animate-in">
              <div className="flex items-center gap-6 mb-10 opacity-60">
                <Highlighter size={24} className="text-yellow-500" />
                <h3 className="text-xl font-black uppercase tracking-[0.6em] text-white italic">
                  Indexed Synapses
                </h3>
              </div>
              <div className="grid gap-8">
                {node.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-8 lg:p-10 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[3rem] relative hover:border-yellow-500/30 transition-all shadow-xl text-left"
                  >
                    <Bookmark
                      size={24}
                      className="absolute top-10 right-12 text-yellow-600 opacity-20"
                    />
                    <p className="text-lg lg:text-2xl text-yellow-100/70 italic leading-relaxed">
                      "{h.text}"
                    </p>
                    <div className="mt-8 flex items-center gap-4 opacity-40">
                      <div className="w-10 h-px bg-yellow-950" />
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase tracking-widest italic">
                        Hash 0x{(node._id || "0000").slice(-4)}_FRG_{i}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="pt-20 border-t border-white/5 text-left">
              <div className="flex items-center gap-6 mb-12 opacity-60 text-left">
                <Network size={24} className="text-purple-400" />
                <h3 className="text-xl font-black uppercase tracking-[0.6em] text-white italic">
                  Semantic Relative Pathways
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {related.slice(0, 4).map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setNode(rec);
                      discover(rec._id);
                    }}
                    className="p-8 lg:p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group flex items-center justify-between shadow-lg"
                  >
                    <span className="text-sm font-black text-slate-400 group-hover:text-white uppercase tracking-[0.3em] truncate pr-6 italic">
                      {rec.title || "Related Intelligence"}
                    </span>
                    <ChevronRight
                      size={28}
                      className="text-slate-800 group-hover:text-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-24 border-t border-white/5 flex flex-wrap items-center justify-between gap-10">
            <div className="flex gap-12 text-left">
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
                  Establish Date
                </span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {node.createdAt
                    ? new Date(node.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
                  Node Sector
                </span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {node.collection || "UNIVERSE_ROOT"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <button
                onClick={onTogglePin}
                className={`px-8 lg:px-10 py-4 lg:py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] border transition-all ${node.isPinned ? "bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-xl" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"}`}
              >
                {node.isPinned ? "Unlock Node" : "Pin Synapse"}
              </button>
              <button
                onClick={onDelete}
                className="px-8 lg:px-10 py-4 lg:py-5 bg-red-600/10 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-3xl"
              >
                Purge Link
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RecallSystemModal = ({ isLoading, deck, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[5000] flex items-center justify-center p-6 lg:p-12 bg-black/99 backdrop-blur-[150px] overflow-y-auto pointer-events-auto"
  >
    <div className="absolute inset-0 z-0" onClick={onClose} />
    <button
      onClick={onClose}
      className="absolute top-10 right-10 p-4 lg:p-6 hover:bg-white/5 rounded-full border border-white/5 hover:rotate-90 transition-all z-20"
    >
      <X size={40} className="lg:hidden" />
      <X size={60} className="hidden lg:block" />
    </button>
    <div
      className="w-full max-w-5xl text-center flex flex-col items-center py-20 relative z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-20">
        <div className="inline-block p-10 lg:p-14 bg-indigo-500/10 rounded-[8rem] border border-indigo-500/20 mb-12 shadow-3xl animate-in">
          <Brain
            size={80}
            className="lg:hidden text-indigo-400 animate-pulse"
          />
          <Brain
            size={120}
            className="hidden lg:block text-indigo-400 animate-pulse"
          />
        </div>
        <h2 className="text-4xl lg:text-9xl font-black text-white italic tracking-tighter uppercase leading-none">
          RECALL ACTIVE
        </h2>
        <div className="mt-12 flex items-center gap-8 lg:gap-12 justify-center opacity-40">
          <Cpu size={32} className="text-indigo-500" />
          <span className="text-sm lg:text-xl font-black uppercase text-slate-500 tracking-[0.5em] lg:tracking-[1em] italic">
            Cognitive Synthesis Mode
          </span>
        </div>
      </div>
      <div className="w-full space-y-24 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center gap-12 py-32">
            <Loader2 size={120} className="animate-spin text-indigo-500" />
            <div className="w-72 lg:w-96 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
              <div className="w-full h-full bg-indigo-500 animate-[loading_4s_infinite]" />
            </div>
            <span className="text-sm lg:text-lg font-black uppercase text-indigo-400 tracking-[0.5em] lg:tracking-[1em] animate-pulse">
              Mapping Context...
            </span>
          </div>
        ) : deck && deck.length > 0 ? (
          deck.map((c, i) => (
            <div
              key={i}
              className="transform hover:scale-[1.05] transition-all duration-1000"
            >
              <Flashcard question={c.q} answer={c.a} />
            </div>
          ))
        ) : (
          <div className="text-slate-700 font-black uppercase text-2xl lg:text-4xl opacity-20 italic tracking-widest">
            Synthesis Blocked: Insufficient Data
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-24 px-12 lg:px-32 py-6 lg:py-10 bg-white/5 border border-white/10 text-white rounded-[5rem] text-sm lg:text-xl font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] hover:bg-indigo-600 transition-all shadow-3xl active:scale-95 flex items-center gap-6 lg:gap-10 group"
      >
        <RefreshCcw
          size={32}
          className="group-hover:rotate-180 transition-transform duration-1000"
        />
        Terminate Protocol
      </button>
    </div>
  </motion.div>
);

export default Items;
