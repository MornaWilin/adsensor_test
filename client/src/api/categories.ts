import axios from "axios";
import { Category, Data, Film, LocalChanges } from "../types";

const API_URL = "http://localhost:3000/"; 

export const fetchFilms = async (): Promise<Film[]> => {
    const response = await axios.get(API_URL + "films");
    return response.data;
  };
  
  export const fetchCategories = async (): Promise<Category[]> => {
    const response = await axios.get(API_URL + "categories");
    return response.data;
  };

export async function fetchData(): Promise<Data> {
    const response = await axios.get(API_URL + "data");
    return {films: response.data.films, categories: response.data.categories};
  }

  export const saveCategories = async (payload: {
    newCategories: {
      name: string;
      subCategories: { name: string; filmIds: number[] }[];
    }[];
    updatedCategories: {
      id: number | null;
      name: string;
      updatedSubCategories: { id: number | null; name: string; filmIds: number[] }[];
      deletedSubCategories: { id: number | null }[];
    }[];
    deletedCategories: number[];
  }): Promise<void> => {
    console.log("Sending payload to server : ", payload)
    await axios.post(API_URL + "categories/update", payload);
};

export async function updateCategories(changes: LocalChanges): Promise<void> {
  const res = await fetch(`${API_URL}/categories/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error("Failed to update categories");
}
 