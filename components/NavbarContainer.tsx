import { getServerSession } from "next-auth";
import Navbar from "./Navbar";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function NavbarContainer() {
  const session = await getServerSession(authOptions);

  return <Navbar session={session} />;
}
