import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserList } from "./UserList";
import { UserDetail } from "./UserDetail";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function Users() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Check if we're on a user detail page
  const isUserDetailPage = path.includes("/users/new") || !!path.match(/\/users\/[^/]+$/);
  
  // Effect to open/close sheet based on URL
  useEffect(() => {
    setIsSheetOpen(isUserDetailPage);
  }, [isUserDetailPage]);
  
  // Handle sheet close
  const handleSheetClose = () => {
    // Navigate back to the users list
    navigate("/users");
  };

  return (
    <div className="space-y-6">
      <UserList />
      
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) handleSheetClose();
      }}>
        <SheetContent side="right" className="w-full sm:w-[540px] md:w-[640px] bg-black/40 backdrop-blur-md border-white/10 text-white overflow-y-auto">
          {isUserDetailPage && <UserDetail />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
