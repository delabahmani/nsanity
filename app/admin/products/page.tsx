"use client";
import Button from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ManageProducts() {
  const { data: session, status } = useSession();

  if (!session) return null;

  return (
    <div className="flex min-h-screen nav-pad flex-col">
      <div className="flex py-10 items-center justify-center">
        <h1 className="text-black font-bold text-3xl text-center">
          manage products
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 max-lg:grid-rows-3 gap-4 py-10 w-[50%] mx-auto">
        <Button variant="primary" className="text-md md:text-xl h-14">
          <Link href={"/admin/products/addProduct"}>add product</Link>
        </Button>
        <Button variant="primary" className="text-md md:text-xl h-14">
          <Link href={"/admin/products/editProduct"}>edit product</Link>
        </Button>
        <Button variant="primary" className="text-md md:text-xl h-14">
          <Link href={"/admin/products/deleteProduct"}>delete product</Link>
        </Button>
      </div>
    </div>
  );
}
