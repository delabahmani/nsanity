"use client";
import AddProductContainer from "@/components/Admin/AddProductForm";

export default function AddProduct() {
  return (
    <div className="flex min-h-screen nav-pad flex-col">
      <div className="py-10 flex items-center justify-center">
        <h1 className="font-bold text-3xl">add product</h1>
      </div>

      <AddProductContainer />
    </div>
  );
}
