import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./layout/Home";
import Chat from "./pages/Chat";
import FashionChat from "./pages/FashionChat";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import Wardrobe from "./pages/Wardrobe";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/fashion-chat" element={<FashionChat />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
