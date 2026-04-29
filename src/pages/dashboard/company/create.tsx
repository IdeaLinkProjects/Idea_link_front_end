import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateCompanyProfileView } from "@/components/profile/CreateCompanyProfileView";

export default function CreateCompanyPage() {
  return (
    <>
      <Head>
        <title>Create Company | IdealLink</title>
      </Head>
      <DashboardLayout>
        <CreateCompanyProfileView />
      </DashboardLayout>
    </>
  );
}
