import { RequireAuth } from "@/components/auth/RequireAuth";
import { KycPage } from "@/components/kyc/KycPage";

export default function KycVerificationPage() {
  return (
    <RequireAuth>
      <KycPage />
    </RequireAuth>
  );
}
