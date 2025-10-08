import Button from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex min-h-screen nav-pad flex-col">
      <div className="flex py-10 items-center justify-center">
        <h1 className="text-black font-bold text-3xl text-center">
          manage products
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 max-lg:grid-rows-3 gap-4 py-10 w-[50%] mx-auto">
        <Link href={"/admin/products/addProduct"}>
          <Button variant="primary" className="text-md md:text-xl h-14 w-full">
            add product
          </Button>
        </Link>
        <Link href={"/admin/products/editProduct"}>
          <Button variant="primary" className="text-md md:text-xl h-14 w-full">
            edit product
          </Button>
        </Link>
        <Link href={"/admin/products/deleteProduct"}>
          <Button variant="primary" className="text-md md:text-xl h-14 w-full">
            delete product
          </Button>
        </Link>
      </div>
    </div>
  );
}
