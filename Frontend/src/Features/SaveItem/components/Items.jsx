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
  CheckCircle2,
  Code,
  Briefcase,
  Info,
  PlusCircle,
  ArrowRight,
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
// --- 🛰️ COMPONENT: ONBOARDING MODAL ---
// ===========================================================================
const OnboardingModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-full max-w-md bg-[#0a0a0c] border border-indigo-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
          Welcome to NeuroVault
        </h2>
      </div>

      <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
        Save anything from the internet. Organize it seamlessly. Find it
        instantly. Build your ultimate Second Brain.
      </p>

      <div className="space-y-4 mb-10 relative z-10">
        {[
          { icon: <Globe size={18} />, text: "Paste a link to save content" },
          { icon: <LayoutGrid size={18} />, text: "View it in your dashboard" },
          { icon: <Network size={18} />, text: "Explore it in the neural map" },
        ].map((step, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5"
          >
            <div className="text-indigo-400">{step.icon}</div>
            <span className="text-sm font-bold text-slate-200">
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 relative z-10">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-white/10"
        >
          Skip
        </button>
        <button
          onClick={() => {
            onClose();
            document.getElementById("deep-ingestion-input")?.focus();
          }}
          className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2"
        >
          Get Started <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ===========================================================================
// --- 🛰️ COMPONENT: MINIMAL FOOTER ---
// ===========================================================================
const MinimalFooter = () => (
  <footer className="mt-auto border-t border-white/5 bg-white/[0.02] backdrop-blur-md py-6 px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shrink-0">
    <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
      Crafted with{" "}
      <Zap size={14} className="text-yellow-500 fill-yellow-500/20" /> by Hemant
      Maru
    </p>
    <div className="flex items-center gap-6">
      <a
        href="https://github.com/HemantMaru"
        target="_blank"
        rel="noreferrer"
        title="GitHub"
        className="text-slate-500 hover:text-white transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] flex items-center gap-2"
      >
        <Code size={18} />
      </a>
      <a
        href="https://www.linkedin.com/in/hemant-maru-63012029a"
        target="_blank"
        rel="noreferrer"
        title="LinkedIn"
        className="text-slate-500 hover:text-white transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] flex items-center gap-2"
      >
        <Briefcase size={18} />
      </a>
    </div>
  </footer>
);

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
    isCopied,
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const type = classify(item.url);
    const thumb = getThumb(item);

    const allTags = useMemo(() => {
      const merged = [...new Set([...(item.tags || []), ...(autoTags || [])])];
      return merged.slice(0, 4);
    }, [item.tags, autoTags]);

    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="group relative bg-[#09090b]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[480px] lg:min-h-[520px] shadow-2xl transition-all hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] cursor-pointer will-change-transform w-full"
        onClick={onFocus}
      >
        <div className="relative w-full h-[280px] lg:h-[320px] overflow-hidden bg-zinc-950 border-b border-white/5 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/5 flex items-center justify-center">
              <BrainCircuit className="text-white/10" size={40} />
            </div>
          )}

          <img
            src={thumb}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imgLoaded
                ? "opacity-60 group-hover:opacity-90 group-hover:scale-110"
                : "opacity-0"
            }`}
            alt={item.title || "preview"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
            }}
          />

          {type === "Videos" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayCircle
                className="text-white fill-indigo-600/20 drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                size={48}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent opacity-90" />
          <div
            className="absolute top-6 left-6 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-2xl z-10 title-tooltip"
            title="Saved item"
          >
            {contentIcon}
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
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
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_#6366f1]" />
              <span
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate title-tooltip"
                title="Your saved knowledge"
              >
                {item.collection || "Omni_Vault"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
            <div className="flex gap-5">
              <button
                title="Pin to Dashboard"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(item);
                }}
                className={`transition-all hover:scale-125 active:scale-90 ${
                  item.isPinned
                    ? "text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                    : "text-slate-600 hover:text-white"
                }`}
              >
                <Pin size={18} fill={item.isPinned ? "currentColor" : "none"} />
              </button>
              <button
                title="Share Node"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(item);
                }}
                className={`${
                  isCopied ? "text-green-400" : "text-slate-600"
                } hover:text-white hover:scale-125 active:scale-90 transition-all`}
              >
                {isCopied ? <CheckCircle2 size={18} /> : <Share2 size={18} />}
              </button>
            </div>
            <span className="text-[9px] font-black text-slate-700 tracking-widest italic uppercase">
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

  // 🚀 INFINITE SCROLLING STATE & REFS
  const [displayCount, setDisplayCount] = useState(12);
  const loadMoreRef = useRef(null);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("neurovault_onboarded");
  });

  const handleDismissOnboarding = () => {
    localStorage.setItem("neurovault_onboarded", "true");
    setShowOnboarding(false);
  };

  const [notification, setNotification] = useState({
    active: false,
    text: "",
    type: "info",
  });

  const [localPins, setLocalPins] = useState({});

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
    if (focusedNode || isRecallOpen || showOnboarding) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [focusedNode, isRecallOpen, showOnboarding]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setIsSearching(false);
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
    if (str.match(/\.(jpeg|jpg|gif|png|webp|avif)$/)) return "Images";
    if (str.includes(".pdf")) return "Docs";
    return "Web";
  }, []);

  const resolveAssetProtocol = useCallback((url) => {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : url.replace("file://", "http://localhost:3000/uploads/");
  }, []);

  const getSmartThumbnail = useCallback(
    (item) => {
      const url = item?.url?.toLowerCase() || "";

      // 🔥 ULTIMATE PDF FIX: Agar file PDF hai, toh humesha yeh mast si Unsplash image dikhao! (Old DB records bhi fix ho jayenge)
      if (url.includes(".pdf") || item?.type === "pdf") {
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
      }

      if (!item || !item.url)
        return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

      if (item.thumbnail && !item.thumbnail.includes("microlink")) {
        return resolveAssetProtocol(item.thumbnail);
      }

      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const vId = url.includes("youtu.be")
          ? url.split("youtu.be/")[1]?.split("?")[0]
          : new URL(url).searchParams.get("v");

        return vId ? `https://img.youtube.com/vi/${vId}/hqdefault.jpg` : "";
      }

      if (url.match(/\.(jpeg|jpg|png|webp|avif)$/))
        return resolveAssetProtocol(url);

      return `https://image.thum.io/get/width/800/crop/600/${url}`;
    },
    [resolveAssetProtocol],
  );

  const executeDeepScan = useCallback(async () => {
    if (!ytInput.trim())
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

  const handleYtKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeDeepScan();
    }
  };

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

  const handleOptimisticPin = async (item) => {
    const currentPinned =
      localPins[item._id] !== undefined ? localPins[item._id] : item.isPinned;

    setLocalPins((prev) => ({ ...prev, [item._id]: !currentPinned }));
    if (focusedNode && focusedNode._id === item._id) {
      setFocusedNode((prev) =>
        prev ? { ...prev, isPinned: !currentPinned } : null,
      );
    }

    try {
      await handleTogglePin(item._id);
    } catch (error) {
      setLocalPins((prev) => ({ ...prev, [item._id]: currentPinned }));
      if (focusedNode && focusedNode._id === item._id) {
        setFocusedNode((prev) =>
          prev ? { ...prev, isPinned: currentPinned } : null,
        );
      }
      pushNotification("Failed to pin item.", "error");
    }
  };

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

      setHighlightBuffer((prev) => ({ ...prev, visible: false }));

      try {
        await addHighlightAPI(highlightBuffer.itemId, highlightBuffer.text);

        setFocusedNode((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            highlights: [
              ...(prev.highlights || []),
              { text: highlightBuffer.text, createdAt: new Date() },
            ],
          };
        });

        window.getSelection()?.removeAllRanges();
        await handleGetCreateSave();
        pushNotification("Synapse fragment indexed.", "success");
      } catch (err) {
        pushNotification("Indexing failed.", "error");
      }
    },
    [highlightBuffer, handleGetCreateSave, pushNotification],
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
      .map((item) => ({
        ...item,
        isPinned:
          localPins[item._id] !== undefined
            ? localPins[item._id]
            : item.isPinned,
      }))
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [
    saveItems,
    activeTab,
    searchQuery,
    activeCategory,
    classifyContentType,
    localPins,
  ]);

  const categories = useMemo(() => {
    const catSet = new Set();
    saveItems.forEach((i) => i.category && catSet.add(i.category));
    return [...catSet];
  }, [saveItems]);

  const memoryFlashes = useMemo(() => {
    if (!saveItems || saveItems.length === 0) return [];

    const now = Date.now();
    const twoDaysInMs = 172800000;

    let oldItems = saveItems.filter((i) => {
      const created = i.createdAt ? new Date(i.createdAt).getTime() : 0;
      return now - created > twoDaysInMs;
    });

    let mixed = oldItems.sort(() => 0.5 - Math.random());

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

  // 🚀 RESET DISPLAY COUNT ON FILTER CHANGES
  useEffect(() => {
    setDisplayCount(12);
  }, [activeTab, activeCategory, searchQuery]);

  // 🚀 INTERSECTION OBSERVER FOR INFINITE SCROLLING
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <button
      onClick={() => {
        if (path) navigate(path);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative z-[110] pointer-events-auto ${
        active
          ? "bg-indigo-600/15 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
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
            className={`fixed bottom-10 left-1/2 z-[20000] px-8 py-4 rounded-2xl backdrop-blur-xl border flex items-center gap-4 shadow-3xl ${
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

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal onClose={handleDismissOnboarding} />
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400 transition-all"
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
              className="fixed inset-y-0 left-0 z-[160] w-80 bg-[#09090b]/95 backdrop-blur-2xl border-r border-white/5 p-8 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                    <BrainCircuit className="text-white" size={22} />
                  </div>
                  <span className="text-xl font-black text-white italic uppercase">
                    Vault
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
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
                  title="Disconnect from NeuroVault"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"
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
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <BrainCircuit className="text-white" size={22} />
              </div>
              <span className="text-xl font-black text-white italic tracking-tighter uppercase">
                Vault
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all relative z-[130] pointer-events-auto"
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
                  <p className="text-[9px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                title="Disconnect from NeuroVault"
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
                title="Disconnect from NeuroVault"
                onClick={handleLogout}
                className="p-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-xl transition-all relative z-[130] pointer-events-auto"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area: Scrollable Container */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_transparent_50%)]">
        {/* 🔥 STICKY HEADER 🔥 */}
        <header className="sticky top-0 z-[100] h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 border-b border-white/10 bg-[#010103]/70 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <PanelLeft size={24} />
            </button>
            <div className="relative w-full max-w-lg lg:max-w-2xl group block">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                size={20}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search synapses... (Ctrl + K)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 lg:py-4 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
              />

              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-12 top-1/2 -translate-y-1/2"
                  >
                    <Loader2
                      className="animate-spin text-indigo-400"
                      size={16}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-2 py-1 bg-black/40 rounded-md border border-white/10 shadow-inner">
                <Command size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6 ml-4">
            <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 hidden sm:block">
              <History size={20} />
            </button>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 group cursor-pointer hover:border-indigo-500/40 hover:bg-white/10 transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-white/20 shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                <Fingerprint size={18} />
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Status
                </p>
                <p className="text-xs font-bold text-white mt-1">Authorized</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 relative z-0">
          {/* HERO SECTION */}
          <section className="bg-gradient-to-br from-indigo-900/30 to-black/40 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 mb-10 lg:mb-16 flex flex-col xl:flex-row items-center gap-8 lg:gap-12 relative overflow-hidden text-left shadow-[0_0_40px_rgba(79,70,229,0.05)] backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 blur-[120px] -z-10 rounded-full" />
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10 rounded-full" />
            <div className="flex-1 space-y-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <Zap size={12} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Accelerator Active
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase leading-none tracking-tighter drop-shadow-md">
                  Deep Ingestion
                </h2>
                <span className="group relative cursor-help hidden sm:block">
                  <Info
                    size={18}
                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                  />
                  <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-48 px-4 py-2.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl normal-case tracking-normal not-italic font-medium">
                    Save content from any link instantly.
                  </span>
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                <span className="text-white font-semibold">
                  Save content from any link.
                </span>{" "}
                Instantly synchronize social nodes, transcripts, and web nodes
                into cognitive persistent summaries.
              </p>
            </div>
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4 z-10">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-red-500 transition-colors">
                  <Globe size={20} />
                </div>
                <input
                  id="deep-ingestion-input"
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  onKeyDown={handleYtKeyDown}
                  placeholder="PASTE_LINK_HERE... (Press Enter)"
                  className="w-full bg-black/60 border border-white/10 rounded-3xl py-5 lg:py-6 pl-16 pr-8 text-xs font-black tracking-widest text-white outline-none focus:border-red-500/50 focus:bg-black/80 transition-all placeholder:text-slate-600 shadow-inner"
                />
              </div>
              <button
                onClick={executeDeepScan}
                disabled={isYtProcessing || !ytInput.trim()}
                className="px-10 py-5 lg:py-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              <div className="flex gap-2 lg:gap-3 bg-white/5 p-1.5 lg:p-2 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar-horizontal">
                {navigationTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-3 px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-4 bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)] cursor-default">
                <History
                  size={16}
                  className="text-indigo-400 animate-spin-slow"
                />
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                  Resurfacing Pipeline Sync
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <Filter size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                  Clusters
                </span>
              </div>
              <button
                onClick={() => setActiveCategory("")}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                  !activeCategory
                    ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-105"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
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
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {!searchQuery && memoryFlashes.length > 0 && activeTab === "All" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 lg:mb-20"
            >
              <div className="flex items-center gap-4 mb-8">
                <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter drop-shadow-md">
                  Memory Resurfacing
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 via-indigo-500/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {memoryFlashes.map((node) => (
                  <motion.div
                    key={node._id}
                    whileHover={{ scale: 1.03, y: -5 }}
                    onClick={() => {
                      setFocusedNode(node);
                      discoverRelativity(node._id);
                    }}
                    className="relative group bg-indigo-600/[0.04] border border-indigo-500/20 p-8 rounded-[2.5rem] cursor-pointer transition-all flex items-center justify-between shadow-[0_0_40px_rgba(79,70,229,0.05)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.15)] hover:border-indigo-500/40 backdrop-blur-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all" />

                    <div className="flex items-center gap-6 overflow-hidden relative z-10">
                      <div className="p-4 bg-indigo-500/20 rounded-2xl group-hover:bg-indigo-500 transition-all duration-500 shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
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
                          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.3em]">
                            Synapse Recall
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shadow-[0_0_5px_#6366f1]" />
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

          {/* GRID VIEW WITH INFINITE SCROLL */}
          {cognitivePool.length > 0 ? (
            <LayoutGroup>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-10 pb-10"
              >
                <AnimatePresence mode="popLayout">
                  {cognitivePool.slice(0, displayCount).map((item) => (
                    <NodeCard
                      key={item._id}
                      item={item}
                      autoTags={getAutoTags(item)}
                      onFocus={() => {
                        setFocusedNode(item);
                        discoverRelativity(item._id);
                      }}
                      onPin={handleOptimisticPin}
                      onShare={handleShare}
                      getThumb={getSmartThumbnail}
                      classify={classifyContentType}
                      contentIcon={<ContentIcon url={item.url} />}
                      isCopied={copiedId === item._id}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Intersection Observer Target for Loading More */}
              {displayCount < cognitivePool.length && (
                <div
                  ref={loadMoreRef}
                  className="w-full h-24 flex items-center justify-center pb-10"
                >
                  <Loader2
                    className="animate-spin text-indigo-500/60"
                    size={32}
                  />
                </div>
              )}
            </LayoutGroup>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 lg:py-40 opacity-90 text-center animate-in">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-inner relative">
                <Unplug size={40} className="text-slate-500" />
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic text-white drop-shadow-lg mb-4">
                No Data Yet
              </h3>
              <p className="text-sm text-slate-400 mb-10 max-w-md leading-relaxed">
                Your neural vault is currently empty. Start by adding your first
                link to ingest content into your second brain.
              </p>
              <button
                onClick={() => {
                  document.getElementById("deep-ingestion-input")?.focus();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-8 py-4 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all flex items-center gap-3 active:scale-95 group"
              >
                <PlusCircle
                  size={18}
                  className="group-hover:rotate-90 transition-transform"
                />{" "}
                Add First Node
              </button>
            </div>
          )}
        </div>

        <MinimalFooter />
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
            onTogglePin={() => handleOptimisticPin(focusedNode)}
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

      {/* Global & Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }

        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes loading { 0% { transform: translateX(-250%); } 100% { transform: translateX(450%); } }
        .shadow-3xl { box-shadow: 0 50px 150px -30px rgba(0, 0, 0, 1); }
        .animate-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin-slow { animation: spin 4s linear infinite; }
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
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 lg:p-12 bg-black/95 backdrop-blur-xl overflow-hidden pointer-events-auto"
    >
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-7xl h-[85vh] md:h-[80vh] lg:h-[85vh] flex flex-col md:flex-row bg-[#0a0a0c] border border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto"
      >
        <div className="w-full md:w-[45%] h-[250px] md:h-full relative overflow-hidden bg-black border-r border-white/5 shrink-0 group">
          <img
            decoding="async"
            src={getThumb(node)}
            loading="lazy"
            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
            alt={node.title || "Focus"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://image.thum.io/get/width/800/crop/600/${node.url}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent" />
          <div className="absolute bottom-10 left-8 right-8 lg:left-12 lg:right-12 z-20 space-y-6 text-left">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight drop-shadow-xl">
              {node.title || "Untitled"}
            </h2>
            <div className="flex flex-wrap gap-4">
              <div
                className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3 text-[10px] lg:text-xs font-bold text-slate-200 uppercase tracking-widest shadow-lg title-tooltip"
                title="Content Type"
              >
                <Globe size={14} /> {classify(node.url)} Node
              </div>
              <div
                className="bg-indigo-600/20 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-500/30 flex items-center gap-3 text-[10px] lg:text-xs font-bold text-indigo-300 uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.3)] title-tooltip"
                title="Category Tag"
              >
                <Tag size={14} /> {node.category || "General Intel"}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-6">
              <button
                onClick={() => window.open(node.url, "_blank")}
                className="px-8 lg:px-10 py-4 lg:py-4 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all shadow-xl flex items-center gap-3 active:scale-95"
              >
                Launch <ExternalLink size={18} />
              </button>
              <button
                onClick={onRecall}
                className="px-8 lg:px-10 py-4 lg:py-4 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all flex items-center gap-3 shadow-lg active:scale-95"
              >
                <Target size={18} /> Recall
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto h-full max-h-full min-h-0 custom-scrollbar p-6 md:p-8 lg:p-12 space-y-12 bg-[#0a0a0c] relative text-left">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 lg:top-8 lg:right-8 p-3 lg:p-4 bg-white/5 rounded-full hover:bg-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all border border-white/10 hover:border-red-500 hover:rotate-90 z-20"
          >
            <X size={24} className="text-slate-300 hover:text-white" />
          </button>

          <section className="animate-in pt-4 lg:pt-0">
            <div className="flex items-center gap-6 mb-8 opacity-70">
              <Sparkles
                size={24}
                className="text-indigo-400 drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]"
              />
              <h3 className="text-lg lg:text-xl font-black uppercase tracking-[0.5em] lg:tracking-[0.6em] text-white italic text-left">
                Neural Synthesis
              </h3>
              <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="p-8 lg:p-12 bg-white/[0.02] border border-white/5 rounded-[2rem] lg:rounded-[3rem] border-l-[8px] lg:border-l-[12px] border-l-indigo-600 relative shadow-inner">
              <Fingerprint
                size={80}
                className="absolute top-1/2 -translate-y-1/2 right-10 text-indigo-500 opacity-[0.03] pointer-events-none"
              />
              <p
                onMouseUp={(e) => onHighlight(e, node._id)}
                onTouchEnd={(e) => onHighlight(e, node._id)}
                className="text-base md:text-lg lg:text-xl text-slate-300 italic leading-relaxed break-words whitespace-pre-wrap font-medium selection:bg-indigo-500 selection:text-white transition-all text-left relative z-10"
              >
                {node.note || "Awaiting intelligence synthesis..."}
              </p>
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-4 text-[9px] lg:text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] lg:tracking-[0.5em]">
                <BoxSelect size={16} /> Drag text to index synapse fragment
              </div>
            </div>
          </section>

          {node.highlights?.length > 0 && (
            <section className="animate-in">
              <div className="flex items-center gap-6 mb-8 opacity-70">
                <Highlighter
                  size={24}
                  className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                />
                <h3 className="text-lg lg:text-xl font-black uppercase tracking-[0.5em] lg:tracking-[0.6em] text-white italic">
                  Indexed Synapses
                </h3>
              </div>
              <div className="grid gap-6">
                {node.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-8 lg:p-10 bg-yellow-500/[0.03] border border-yellow-500/10 rounded-[2rem] relative hover:border-yellow-500/30 hover:bg-yellow-500/[0.05] transition-all shadow-lg text-left group"
                  >
                    <Bookmark
                      size={24}
                      className="absolute top-10 right-10 text-yellow-600 opacity-20 group-hover:opacity-60 transition-opacity"
                    />
                    <p className="text-lg lg:text-xl text-yellow-100/80 italic leading-relaxed font-medium pr-8">
                      "{h.text}"
                    </p>
                    <div className="mt-6 flex items-center gap-4 opacity-40 group-hover:opacity-80 transition-opacity">
                      <div className="w-8 h-px bg-yellow-500/50" />
                      <span className="text-[9px] lg:text-[10px] font-black tracking-[0.3em] uppercase text-yellow-600 italic">
                        Hash 0x{(node._id || "0000").slice(-4)}_FRG_{i}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="pt-16 border-t border-white/5 text-left">
              <div className="flex items-center gap-6 mb-10 opacity-70 text-left">
                <Network
                  size={24}
                  className="text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
                />
                <h3 className="text-lg lg:text-xl font-black uppercase tracking-[0.5em] lg:tracking-[0.6em] text-white italic">
                  Relative Pathways
                </h3>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {related.slice(0, 4).map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setNode(rec);
                      discover(rec._id);
                    }}
                    className="p-6 lg:p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center justify-between shadow-md hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                  >
                    <span className="text-xs lg:text-sm font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em] lg:tracking-[0.3em] truncate pr-6 italic transition-colors">
                      {rec.title || "Related Intelligence"}
                    </span>
                    <ChevronRight
                      size={24}
                      className="text-slate-700 group-hover:text-indigo-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-16 pb-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
            <div className="flex flex-wrap gap-8 lg:gap-12 text-left">
              <div className="space-y-2 lg:space-y-3 text-left">
                <span className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                  Establish Date
                </span>
                <p className="text-[10px] lg:text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {node.createdAt
                    ? new Date(node.createdAt).toLocaleString()
                    : "Unknown Axis"}
                </p>
              </div>
              <div className="space-y-2 lg:space-y-3 text-left">
                <span className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                  Node Sector
                </span>
                <p className="text-[10px] lg:text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {node.collection || "UNIVERSE_ROOT"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 lg:gap-6 w-full sm:w-auto">
              <button
                onClick={onTogglePin}
                className={`flex-1 sm:flex-none px-6 lg:px-8 py-4 lg:py-4 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] border transition-all active:scale-95 ${
                  node.isPinned
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {node.isPinned ? "Unlock Node" : "Pin Synapse"}
              </button>
              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none px-6 lg:px-8 py-4 lg:py-4 bg-red-500/10 text-red-500 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95"
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
    className="fixed inset-0 z-[6000] flex items-center justify-center p-6 lg:p-12 bg-black/98 backdrop-blur-[100px] overflow-y-auto pointer-events-auto custom-scrollbar"
  >
    <div className="absolute inset-0 z-0" onClick={onClose} />
    <button
      onClick={onClose}
      className="absolute top-6 right-6 lg:top-10 lg:right-10 p-4 lg:p-6 hover:bg-red-500/20 rounded-full border border-white/5 hover:border-red-500/50 hover:text-red-400 hover:rotate-90 transition-all z-20 text-slate-400"
    >
      <X size={30} className="lg:hidden" />
      <X size={40} className="hidden lg:block" />
    </button>
    <div
      className="w-full max-w-5xl text-center flex flex-col items-center py-20 relative z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-16 lg:mb-20">
        <div className="inline-block p-10 lg:p-14 bg-indigo-500/10 rounded-[4rem] lg:rounded-[6rem] border border-indigo-500/20 mb-8 lg:mb-12 shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-in">
          <Brain
            size={60}
            className="lg:hidden text-indigo-400 animate-pulse drop-shadow-[0_0_15px_rgba(79,70,229,0.8)]"
          />
          <Brain
            size={100}
            className="hidden lg:block text-indigo-400 animate-pulse drop-shadow-[0_0_20px_rgba(79,70,229,0.8)]"
          />
        </div>
        <h2 className="text-4xl lg:text-8xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
          RECALL ACTIVE
        </h2>
        <div className="mt-8 lg:mt-12 flex items-center gap-6 lg:gap-10 justify-center opacity-60">
          <Cpu
            size={28}
            className="text-indigo-400 drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          />
          <span className="text-xs lg:text-lg font-black uppercase text-slate-300 tracking-[0.5em] lg:tracking-[0.8em] italic">
            Cognitive Synthesis Mode
          </span>
        </div>
      </div>
      <div className="w-full space-y-16 lg:space-y-24 py-10 lg:py-16">
        {isLoading ? (
          <div className="flex flex-col items-center gap-8 lg:gap-12 py-20 lg:py-32">
            <Loader2
              size={80}
              className="animate-spin text-indigo-500 drop-shadow-[0_0_20px_rgba(79,70,229,0.5)] lg:w-[120px] lg:h-[120px]"
            />
            <div className="w-64 lg:w-96 h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden shadow-inner relative">
              <div className="absolute inset-y-0 left-0 bg-indigo-500 w-1/3 rounded-full animate-[loading_2s_infinite_ease-in-out] shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
            </div>
            <span className="text-xs lg:text-sm font-black uppercase text-indigo-400 tracking-[0.4em] lg:tracking-[0.8em] animate-pulse">
              Mapping Context...
            </span>
          </div>
        ) : deck && deck.length > 0 ? (
          deck.map((c, i) => (
            <div
              key={i}
              className="transform hover:scale-[1.02] lg:hover:scale-[1.05] transition-transform duration-700"
            >
              <Flashcard question={c.q} answer={c.a} />
            </div>
          ))
        ) : (
          <div className="text-slate-600 font-black uppercase text-xl lg:text-3xl opacity-40 italic tracking-[0.3em] lg:tracking-widest py-20">
            Synthesis Blocked: Insufficient Data
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-16 lg:mt-24 px-10 lg:px-24 py-5 lg:py-8 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs lg:text-sm font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] hover:bg-white hover:text-black hover:border-white transition-all shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-4 lg:gap-8 group"
      >
        <RefreshCcw
          size={24}
          className="group-hover:rotate-180 transition-transform duration-700 lg:w-[32px] lg:h-[32px]"
        />
        Terminate Protocol
      </button>
    </div>
  </motion.div>
);

export default Items;
