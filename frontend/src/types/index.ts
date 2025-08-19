import type { UseFormRegister, FieldErrors } from "react-hook-form";

export type User = {
  email: string ,
  name: string,
  lastname: string
}

export type UserSell = Pick<User, 'name' | 'lastname' | 'email'> & {
  id:number;
  role: string;
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
    isActive?: boolean;
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
  isActive: boolean;
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
  isActive?: boolean | 'all';
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

// ========================================
// TIPOS PARA COMPONENTES
// ========================================

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
  onActiveStatusFilter: (status: string) => void;
  onRefresh: () => void;
  categories: Category[];
  categoriesLoading: boolean;
  showActiveFilter?: boolean;
  currentFilters?: ProductFilters;
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

// ========================================
// TIPOS PARA AUTENTICACIÓN
// ========================================

export type UserToken = {
    id: number;
    role: string;
}

// En types/index.ts, asegúrate de tener:
export type AuthContextType = {
  auth: boolean;
  user: UserTokenVerify | null;
  token: string | null;
  loading: boolean;
  handleIniciarSesion: (token: string, userData?: UserTokenVerify) => Promise<void>;
  handleCerrarSesion: () => void;
  handleEstaLogeado: () => boolean;
  refreshUser?: () => Promise<void>; 
}
export type AuthProviderProps = {
  children: React.ReactNode;
}

export type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

// ========================================
// TIPOS PARA VENTAS
// ========================================

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

// ========================================
// TIPOS PARA ELIMINACIÓN
// ========================================

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

// ========================================
// TIPOS PARA HOOKS DE FORMULARIO
// ========================================

export interface UseProductFormProps {
    productId?: string;
    onSuccess?: () => void;
}

export interface UseProductDataReturn {
    categories: Category[];
    loadingCategories: boolean;
    loadingProduct: boolean;
    initialProduct: Product | null;
    isEditing: boolean;
}

export interface UseProductFormLogicProps {
    initialProduct: Product | null;
    isEditing: boolean;
    productId?: string;
    onSuccess?: () => void;
}

export interface UseProductFormLogicReturn {
    form: {
        register: UseFormRegister<CreateProductForm>;
        handleSubmit: any;
        errors: FieldErrors<CreateProductForm>;
        getValues: any;
        setValue: any;
        watch: any;
        reset: any;
    };
    showNewCategoryInput: boolean;
    handleSubmitProduct: (formData: CreateProductForm) => Promise<boolean>;
    resetForm: () => void;
}

export interface UseProductFormReturn {
    form: {
        register: UseFormRegister<CreateProductForm>;
        handleSubmit: any;
        errors: FieldErrors<CreateProductForm>;
        getValues: any;
        setValue: any;
        watch: any;
        reset: any;
    };
    categories: Category[];
    loadingCategories: boolean;
    loadingProduct: boolean;
    showNewCategoryInput: boolean;
    handleSubmitProduct: (formData: CreateProductForm) => Promise<boolean>;
    resetForm: () => void;
    isEditing: boolean;
    initialProduct: Product | null;
}

export interface ToggleProductStatusData {
  productId: number;
}

export interface ToggleProductStatusResponse {
  message: string;
  product: Product;
}

export interface UseToggleFlowProps {
  products: Product[] | undefined;
  onRefresh: () => void;
}

// ========================================
// TIPOS PARA FLUJOS DE TRABAJO
// ========================================

export interface UseSalesFlowProps {
    products: Product[] | undefined;
    onRefresh: () => void;
}

export interface UseSalesFlowReturn {
    handleSell: (productId: number) => Promise<void>;
    loading: boolean;
}

export interface UseDeleteFlowProps {
    products: Product[] | undefined;
    onRefresh: () => void;
}

export interface UseDeleteFlowReturn {
    handleDelete: (productId: number) => Promise<void>;
    loading: boolean;
}

// ========================================
// TIPOS PARA SERVICIOS
// ========================================

export interface ProductServiceResponse {
    message: string;
    product?: Product;
    [key: string]: any;
}

export interface ApiError {
    message: string;
    error?: string;
    errors?: Array<{ msg: string; [key: string]: any }>;
}

// ========================================
// TIPOS PARA COMPONENTES DE FORMULARIO
// ========================================

export interface ProductFormContainerProps {
    productId?: string;
    onSuccess?: () => void;
}

export interface FormResetOptions {
    keepDefaultValues?: boolean;
    keepValues?: boolean;
    keepErrors?: boolean;
}

// SaleFilters
export interface SaleFilters {
  search?: string;
  categoryId?: number;
  userId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  order?: string;
}

// Sale
export interface Sale {
  id: number;
  createdAt: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    sku?: string;
    image?: string;
    category?: {
      id: number;
      name: string;
    };
  };
  user: {
    id: number;
    name: string;
    lastname: string;
    email: string;
  };
}

export interface SaleFilters {
  search?: string;
  categoryId?: number;
  userId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  order?: string;
}
export interface SaleFiltersProps {
  onSearch: (value: string) => void;
  onCategoryFilter: (categoryId: string) => void;
  onUserFilter: (userId: string) => void;
  onDateFilter: (startDate: string, endDate: string) => void;
  onRefresh: () => void;
  categories: Category[];
  users: UserSell[];
  categoriesLoading: boolean;
  usersLoading: boolean;
  currentFilters: SaleFilters;
}