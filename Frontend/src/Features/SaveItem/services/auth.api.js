import axios from "axios";

// 1. Axios Instance Setup
// withCredentials: true zaroori hai taaki browser cookies (JWT) ko backend pe bhej sake
const API = axios.create({
  baseURL: "http://localhost:3000/api/auth", // Tera backend auth URL
  withCredentials: true,
});

/**
 * @description User Registration (Signup)
 * @param {Object} userData - { name, email, password }
 */
export const registerAPI = async (userData) => {
  try {
    const response = await API.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * @description User Login (Signin)
 * @param {string} email
 * @param {string} password
 */
export const loginAPI = async (email, password) => {
  try {
    const response = await API.post("/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * @description User Logout (Clears Cookie)
 */
export const logoutAPI = async () => {
  try {
    const response = await API.post("/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * @description Get Current Logged-in User Info (Protected)
 * Use this on App load to check if user is already logged in
 */
export const getMeAPI = async () => {
  try {
    const response = await API.get("/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default API;
