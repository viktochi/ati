import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { getIsAdmin } from "@/lib/admin";

const App = dynamic(() => import("./app"), { ssr: true });

const AdminPage = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }
  return <App />;
};

export default AdminPage;
