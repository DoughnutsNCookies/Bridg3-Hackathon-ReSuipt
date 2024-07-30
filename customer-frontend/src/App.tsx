import { BrowserRouter, Routes, Route } from "react-router-dom";
import Google from "./pages/google";
import Login from "./pages/login";
import Home from "./pages/home";
import Test from "./pages/test";
import React, { ReactNode, useState } from "react";

export interface User {
  walletAddress: string;
}

export interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const UserContext = React.createContext<UserContextType | undefined>(
  undefined
);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ walletAddress: "" });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/google" element={<Google />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
