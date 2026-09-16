import { useAppDispatch, useAppSelector } from "./useAppRedux";
import { loggedOut } from "@/redux/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, admin } = useAppSelector((s) => s.auth);

  return {
    token,
    user,
    admin,
    isAuthenticated: Boolean(token && user),
    isAdminAuthenticated: Boolean(token && admin),
    logout: () => dispatch(loggedOut())
  };
}
