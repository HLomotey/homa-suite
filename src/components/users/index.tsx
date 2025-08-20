import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserList } from "./UserList";
import { UserDetail } from "./UserDetail";
import { UserPermissions } from "./UserPermissions";
import { OrphanedUserCleanup } from "./OrphanedUserCleanup";
import { UserSyncTool } from "./UserSyncTool";
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
  const isUserDetailPage =
    path.includes("/users/new") || !!path.match(/\/users\/[^/]+$/);

  // Check if we're on a user permissions page
  const isUserPermissionsPage = !!path.match(/\/users\/[^/]+\/permissions$/);

  // Check if we're on the cleanup page
  const isCleanupPage = path.includes("/users/cleanup");

  // Check if we're on the sync page
  const isSyncPage = path.includes("/users/sync");

  // Effect to open/close sheet based on URL
  useEffect(() => {
    setIsSheetOpen(isUserDetailPage || isUserPermissionsPage || isCleanupPage || isSyncPage);
  }, [isUserDetailPage, isUserPermissionsPage, isCleanupPage, isSyncPage]);

  // Handle sheet close
  const handleSheetClose = () => {
    // Navigate back to the users list
    navigate("/users");
  };

  return (
    <div className="space-y-6">
      <UserList />

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) handleSheetClose();
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[700px] md:w-[700px] bg-black/40 backdrop-blur-md border-white/10 text-white overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-white">
              {isUserDetailPage &&
                (path.includes("/users/new") ? "Create User" : "Edit User")}
              {isUserPermissionsPage && "User Permissions"}
              {isCleanupPage && "Orphaned User Cleanup"}
              {isSyncPage && "User Sync Tool"}
            </SheetTitle>
            <SheetDescription className="text-white/60">
              {isUserDetailPage &&
                (path.includes("/users/new")
                  ? "Create a new user account"
                  : "Edit user details and profile")}
              {isUserPermissionsPage && "Manage user roles and permissions"}
              {isCleanupPage && "Clean up users that exist in auth but not in profiles"}
              {isSyncPage && "Sync auth users to profiles table"}
            </SheetDescription>
          </SheetHeader>
          {isUserDetailPage && <UserDetail />}
          {isUserPermissionsPage && <UserPermissions />}
          {isCleanupPage && <OrphanedUserCleanup />}
          {isSyncPage && <UserSyncTool />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
