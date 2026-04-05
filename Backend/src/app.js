// import express from "express";
// import saveRoutes from "./routes/save.routes.js";
// import cors from "cors";
// const app = express();
// app.use(express.json());
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "*"],
//     credentials: true,
//   }),
// );

// app.use("/api/item", saveRoutes);
// export default app;

import express from "express";
import saveRoutes from "./routes/save.routes.js";
import router from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser"; // 👈 Ye line missing hai
const app = express();
app.use(
  cors({
    // "*" ke saath credentials: true kabhi-kabhi issue deta hai
    // Isliye specific origins dalna hamesha better hai
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://frontend-pz3b1ci56-hemantkumawat399-5351s-projects.vercel.app",
        "null",
      ]; // Extension 'null' ya specific ID bhejti hai
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("chrome-extension://")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("public/uploads"));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pro touch: form data handle karne ke liye
app.get("/", (req, res) => {
  res.send("Server working");
});

app.get("/test", (req, res) => {
  res.send("Test route working");
});

app.use(cookieParser());

// Routes
app.use("/api/auth", router);
// Routes
app.use("/api/item", saveRoutes);

// Health Check (Optional but good practice)
app.get("/", (req, res) => res.send("NeuroVault API is humming... ðŸš€"));

export default app;
