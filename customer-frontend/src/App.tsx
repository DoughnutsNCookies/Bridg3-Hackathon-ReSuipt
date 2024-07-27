import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Google from "./pages/google";
import Login from "./pages/login";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/google" element={<Google />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
