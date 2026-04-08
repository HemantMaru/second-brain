import React, { useState, useMemo, useRef, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authStart, authSuccess, authFailure } from "../auth.slices.js";
import { loginAPI, registerAPI } from "../services/auth.api.js"; // API functions assume kar raha hoon

// UI Imports (Jo tumne provide kiye the)
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  BrainCircuit,
  Loader2,
  Shield,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- 3D Background Component ---
function NeuralParticles() {
  const ref = useRef();
  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.05;
    ref.current.rotation.y = t;
    ref.current.rotation.x = t * 0.5;
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#2dd4bf"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

// --- Common Input Component ---
const Input = ({
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5 w-full group text-left">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-teal-400">
        {label}
      </label>
      <div className="relative">
        <div
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
            isFocused ? "text-teal-400" : "text-slate-500",
          )}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <input
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 backdrop-blur-md placeholder:text-slate-600",
            "focus:border-teal-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-teal-500/10",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function NeuroVaultAuth() {
  const [authMode, setAuthMode] = useState("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAction = async (e) => {
    e.preventDefault();

    dispatch(authStart());

    // ⚡ UI ko instantly responsive bana
    setTimeout(async () => {
      try {
        let response;

        if (authMode === "signin") {
          response = await loginAPI(formData.email, formData.password);
        } else {
          response = await registerAPI(formData);
        }

        dispatch(authSuccess({ user: response.user, token: response.token }));
        navigate("/saved");
      } catch (err) {
        dispatch(authFailure(err.message || "Authentication Failed"));
      }
    }, 0);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#02040a] flex items-center justify-center p-6 overflow-hidden font-sans">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <NeuralParticles />
          </Suspense>
        </Canvas>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 border border-white/10"
            >
              <BrainCircuit className="text-white" size={32} />
            </motion.div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              Neuro<span className="text-teal-400">Vault</span>
            </h1>
          </div>

          {/* Tab Switcher */}
          <div className="relative flex p-1 bg-black/40 rounded-2xl mb-8 border border-white/5">
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-xl transition-transform duration-300",
                authMode === "signup" ? "translate-x-full" : "translate-x-0",
              )}
            />
            <button
              onClick={() => setAuthMode("signin")}
              className={cn(
                "relative flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                authMode === "signin" ? "text-white" : "text-slate-500",
              )}
            >
              Identification
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={cn(
                "relative flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                authMode === "signup" ? "text-white" : "text-slate-500",
              )}
            >
              Neural Link
            </button>
          </div>

          <form onSubmit={handleAction} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {authMode === "signup" && (
                  <Input
                    name="name"
                    label="Biological Name"
                    type="text"
                    placeholder="Human 01"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                  />
                )}
                <Input
                  name="email"
                  label="Neural Identity"
                  type="email"
                  placeholder="core@neurovault.ai"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  label="Access Key"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                />
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="text-red-400 text-[10px] font-bold uppercase text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full relative group h-[52px] bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl font-bold text-white uppercase tracking-widest text-xs overflow-hidden transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Please wait...
                  </>
                ) : authMode === "signin" ? (
                  "Establish Session"
                ) : (
                  "Synchronize Identity"
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() =>
                setAuthMode(authMode === "signin" ? "signup" : "signin")
              }
              className="text-[10px] font-bold text-slate-500 hover:text-teal-400 transition-colors uppercase tracking-widest"
            >
              {authMode === "signin"
                ? "Initial Entry? Create Link"
                : "Existing Member? Authenticate"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-sm" />{" "}
            Node: Secure-Alpha
          </span>
          <Shield size={10} />
          <span>E2E Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
