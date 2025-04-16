import { ProductFormInputTypes } from "@/types/globals";

export default function ProductFormInput({
  name,
  value,
  setValue,
  items,
  addItem,
  removeItem,
  placeholder,
  disabled,
}: ProductFormInputTypes) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-gray-700 mb-2 block"
      >
        {name}
      </label>
      <input
        type="text"
        id={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border border-gray-300 rounded-md p-2 w-full mb-4"
      />
      <div className="flex gap-2">
        {items.map((item) => (
          <span key={item} className="bg-gray-200 px-2 py-1 rounded-md">
            {item}
            <button
              onClick={() => removeItem(item)}
              className="ml-2 text-red-500"
            >
              x
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={() => addItem(value)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
      >
        Add
      </button>
    </div>
  );
}
