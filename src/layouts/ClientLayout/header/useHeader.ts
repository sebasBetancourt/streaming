import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { listCategories } from "@/shared/api/categories";
import { useAsync } from "@/shared/hooks/useAsync";

export function useHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: categories = [] } = useAsync(() => listCategories({ limit: 40 }), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, searchRef, showSearch, setShowSearch, navigate, user, logout, categories };
}
