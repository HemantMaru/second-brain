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
import cookieParser from "cookie-parser"; //  Ye line missing hai
const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
