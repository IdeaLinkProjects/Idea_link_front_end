import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleSelectionPage } from "@/components/role-selection/RoleSelectionPage";

export default function SelectRolePage() {
  return (
    <RequireAuth>
      <RoleSelectionPage />
    </RequireAuth>
  );
}

