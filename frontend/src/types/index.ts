export type User = {
  email: string ,
  name: string,
  lastname: string
}

export type RegisterForm = Pick<User, 'name' | 'lastname' | 'email'> & {
    password: string;
    password_confirmation: string;
}

export type LoginForm = Pick<User, 'email'> & {
    password: string;
}

export interface CreateProductForm {
    name: string;
    price: number | undefined; // Permitir undefined
    stock: number | undefined; // Permitir undefined
    sku?: string;
    categoryId?: string;
    categoryName?: string;
    image?: FileList;
}

export type Category = {
    id: number;
    name: string;
}

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  image: string | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export type ProductsResponse = {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    categoryId: number | null;
    orderBy: string;
    order: string;
    search: string | null;
  };
}

export type PaginationProps = {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
