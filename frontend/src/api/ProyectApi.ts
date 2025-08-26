import { isAxiosError } from "axios";
import api from "../config/axios";
import type { UserTokenVerify } from "../types";

export async function getUser() {
    try {
        const { data } = await api.get<UserTokenVerify>(`/user`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
           throw new Error(error.response.data.error);
        }
    }
} 

// === MARCAS ===
export async function getBrands() {
    try {
        const { data } = await api.get('/brands');
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

export async function createBrand(formData: { name: string }) {
    try {
        const { data } = await api.post('/brands', formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}