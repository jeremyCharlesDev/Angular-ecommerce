import { Category } from './category';
export interface Product {
  idProduct: number;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  Category: number;
  createdAd: string;
  oldImage: string;
}
