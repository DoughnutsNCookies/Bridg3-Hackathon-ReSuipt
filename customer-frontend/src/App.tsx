import { BrowserRouter, Routes, Route } from "react-router-dom";
import Google from "./pages/google";
import Login from "./pages/login";
import Home from "./pages/home";
import Test from "./pages/test";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/google" element={<Google />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}
