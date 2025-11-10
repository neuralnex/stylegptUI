import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./layout/Home";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
