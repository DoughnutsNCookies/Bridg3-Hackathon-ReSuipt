import { useContext } from "react";
import { UserContext, UserContextType } from "../App";

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("Failed to get user context");

  return context;
};
