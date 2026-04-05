import mongoose from "mongoose";
export const database = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("connect to db");
};
