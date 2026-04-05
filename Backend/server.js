import { configDotenv } from "dotenv";
configDotenv();
import app from "./src/app.js";
import { database } from "./src/config/database.js";
database();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
