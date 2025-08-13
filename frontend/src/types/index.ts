import type { UseFormRegister, FieldErrors } from "react-hook-form";

export type User = {
  email: string ,
  name: string,
  lastname: string
}
export type UserTokenVerify = {
  email: string ,
  name: string,
  lastname: string,
  role: string,
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
    price: number | undefined; 
    stock: number | undefined; 
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

export interface ProductFilters {
  search: string;
  categoryId?: number;
  orderBy: 'name' | 'price' | 'stock' | 'category';
  order: 'asc' | 'desc';
}

export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductFiltersWithPage extends ProductFilters {
  page: number;
}

export type PaginationProps = {
  pagination: { current: number; total: number; totalPages: number; pageSize: number };
  onPageChange: (page: number) => void;
}

export type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}


export type ProductFiltersProps = {
  onSearch: (value: string) => void;
  onCategoryFilter: (categoryId: string) => void;
  onRefresh: () => void;
  categories: Category[];
  categoriesLoading: boolean;
}

export type ProductFormFieldsProps = {
    register: UseFormRegister<CreateProductForm>;
    errors: FieldErrors<CreateProductForm>;
}

export type CategorySelectorProps = {
    register: UseFormRegister<CreateProductForm>;
    errors: FieldErrors<CreateProductForm>;
    categories: Category[];
    loadingCategories: boolean;
    showNewCategoryInput: boolean;
};

export type ErrorMessageProps = {
    children: React.ReactNode;
}

export type UserToken = {
    id: number;
    role: string;
}

export type AuthContextType = {
  auth: boolean;
  user: UserTokenVerify | null;
  token: string | null;
  loading: boolean;
  handleIniciarSesion: (token: string, userData?: UserTokenVerify) => Promise<void>;
  handleCerrarSesion: () => void;
  handleEstaLogeado: () => boolean;
}
export type AuthProviderProps = {
  children: React.ReactNode;
}

// Tipos adicionales para componentes de autorización
export type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export type SellProductData = {
  productId: number;
  quantity: number;
}

export type SellProductResponse = {
  message: string;
  product: {
    id: number;
    name: string;
    stock: number;
  };
  sale: {
    quantity: number;
    previousStock: number;
    newStock: number;
  };
}

// Agregar estos tipos si no están:
export interface DeleteProductData {
  productId: number;
}

export interface DeleteProductResponse {
  message: string;
  product: {
    id: number;
    name: string;
  };
}