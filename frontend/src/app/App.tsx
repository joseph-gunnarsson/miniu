import { createContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import ManageURLs from "../components/ManageURLs";
import Login from "../components/Login";
import Signup from "../components/Signup";
import AddURL from "../components/AddURL";
import ErrorPage from "../components/ErrorPage";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/user/logout/", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
          setIsAuthenticated(false);
          navigate("/login");
      } else {
        const data = await response.json();
        console.error("Logout Error:", data.message || "An unknown error occurred");
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-token/", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
  
        if (response.ok) {
          setIsAuthenticated(true);
          if(location.pathname == "/login")
            navigate("/home");
        } else {
          console.error("Error Message:", data.message || "An unknown error occurred");
          setIsAuthenticated(false);
          navigate("/login");
        }
      } catch (error) {
        console.error("Network Error:", error);
        setIsAuthenticated(false);
        navigate("/login");
      }
    };
    verifyToken();
  }, []);
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <div className="w-full h-[100%] min-h-[100vh] bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center p-1 flex-col gap-1">
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/manage-urls" element={<ManageURLs />} />
          <Route path="/add-url" element={<AddURL />} />
          <Route path="/unauthorized" element={<ErrorPage />} />
          <Route path="/unknown" element={<ErrorPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

