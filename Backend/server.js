import { configDotenv } from "dotenv";
configDotenv();
import app from "./src/app.js";
import { database } from "./src/config/database.js";
database();

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
