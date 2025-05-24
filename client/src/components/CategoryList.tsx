import React from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { CategoryItem } from "./CategoryItem";
import { Stack } from "@mui/material";
import { Category } from "../types";

interface Props {
  setEditedCategory: (cat: Category) => void;
}

export const CategoryList: React.FC<Props> = ({ setEditedCategory }) => {
  const { categories } = useCategoryContext();

  if (!categories || !categories.length) {
    return <p>Нет категорий</p>;
  }

  return (
    <Stack spacing={3} mt={3}>
      {categories.map((category) => (
        <CategoryItem
          key={category.id ?? Math.random()}
          category={category}
          setEditedCategory={setEditedCategory}
        />
      ))}
    </Stack>
  );
};
