import "./App.scss";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import { useAuthStore } from "./store/auth.store";
import Home from "./pages/Home/Home";

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
