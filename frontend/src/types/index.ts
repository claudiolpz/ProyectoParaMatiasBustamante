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
