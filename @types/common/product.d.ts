export interface IProductImage {
  path: string;
}

// useful for client side
export interface IProduct {
  name: string;
  sku: string;
  _id: string;
  slug: string;
  price: number;
  content: string;
  brand?: number;
  discount?: number;
  images?: Array<IProductImage>;
}