export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  colors: string[];
  images: string[];
  categories: string[];
  sizes: string[];
  inStock: boolean;
  isFeatured: boolean;
};

export type ProductFormInputTypes = {
  name: string;
  value: string;
  setValue: (value: string) => void;
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  placeholder: string;
  disabled: boolean;
};
