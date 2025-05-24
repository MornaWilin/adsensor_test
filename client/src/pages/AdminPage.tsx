import { useEffect, useState } from "react";
import { useCategoryContext } from "../context/CategoryContext";
import { fetchData } from "../api/categories";
import { CategoryList } from "../components/CategoryList";
import { Button } from "@mui/material";
import { Category } from "../types";
import { EditCategoryModal } from "../components/EditCategoryModal";

export const AdminPage = () => {
  const { setCategories, setFilms, saveAllChanges } = useCategoryContext();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(undefined);
    setOpen(true);
  };

  const handleSaveAllChanges = () => {
    try {
      saveAllChanges();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { films, categories } = await fetchData();
        setFilms(films);
        setCategories(categories);
      } catch (err) {
        throw err;
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Категории фильмов</h1>
      <Button variant="contained" color="primary" onClick={handleAdd}>
        Добавить категорию
      </Button>
      <Button
        variant="outlined"
        color="success"
        sx={{ ml: 2 }}
        onClick={handleSaveAllChanges}
      >
        Сохранить на сервер
      </Button>
      <CategoryList setEditedCategory={handleEdit} />
      <EditCategoryModal
        open={open}
        onClose={() => setOpen(false)}
        initialCategory={editingCategory}
        onSave={() => null}
      />
    </div>
  );
};
