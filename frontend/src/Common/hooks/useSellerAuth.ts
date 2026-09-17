import { useAppDispatch, useAppSelector } from "./useAppRedux";
import { sellerLoggedOut } from "@/redux/sellerAuthSlice";

/** Mirrors useAuth but for the fully separate seller session (Phase 3). */
export function useSellerAuth() {
  const dispatch = useAppDispatch();
  const { token, seller } = useAppSelector((s) => s.sellerAuth);

  return {
    token,
    seller,
    isSellerAuthenticated: Boolean(token && seller),
    logout: () => dispatch(sellerLoggedOut())
  };
}
