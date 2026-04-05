// AuthContext.jsx or ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Default loading true rakho

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false); // API call khatam hone ke baad hi loading false karein
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Ya koi badhiya Spinner
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
