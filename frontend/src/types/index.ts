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

export type CreateProductForm = {
    name: string;
    price: number;
    stock: number;
    sku?: string;
    categoryId?: string | number; 
    categoryName?: string;
    image?: FileList;
}

export type Category = {
    id: number;
    name: string;
}
