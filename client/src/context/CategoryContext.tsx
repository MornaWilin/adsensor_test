import React, { createContext, useContext, useState } from "react";
import { Category, Film, SubCategory } from "../types";
import { fetchData, saveCategories } from "../api/categories";

interface CategoryContextType {
  films: Film[];
  categories: Category[];
  addNewCategory: (cat: Category) => void;
  updateExistingCategory: (cat: Category) => void;
  deleteCategory: (id: Category) => void;
  deleteSubCategory: (
    categoryId: number | null,
    subCategoryId: number | null
  ) => void;
  saveAllChanges: () => Promise<void>;
  setCategories: (cat: Category[]) => void;
  setFilms: (film: Film[]) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [films, setFilms] = useState<Film[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newCategories, setNewCategories] = useState<Category[]>([]);
  const [updatedCategories, setUpdatedCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<number[]>([]);

  const loadData = async () => {
    const { films: filmsData, categories: categoriesData } = await fetchData();
    setFilms(filmsData);
    setCategories(categoriesData);
  };

  const addNewCategory = (cat: Category) => {
    const newCat = {
      ...structuredClone(cat),
      id: null,
      _tempId: cat._tempId ?? Math.random(),
    };

    setCategories((prev) => {
      const exists = (prev || []).find(
        (c) =>
          (c.id !== null && c.id === cat.id) ||
          (c._tempId && cat._tempId && c._tempId === cat._tempId)
      );

      if (exists) {
        return prev.map((c) =>
          (c.id !== null && c.id === cat.id) ||
          (c._tempId && cat._tempId && c._tempId === cat._tempId)
            ? newCat
            : c
        );
      }

      return prev ? [...prev, newCat] : [newCat];
    });

    setNewCategories((prev) => {
      const exists = prev.find(
        (c) => c._tempId && cat._tempId && c._tempId === cat._tempId
      );

      if (exists) {
        return prev.map((c) =>
          c._tempId && cat._tempId && c._tempId === cat._tempId ? newCat : c
        );
      }

      return [...prev, newCat];
    });
  };

  const getDeletedSubcategories = (oldCat: Category, newCat: Category) => {
    const oldSubIds =
      oldCat.subCategories &&
      oldCat.subCategories.filter((s) => s.id !== null).map((s) => s.id);
    const newSubIds =
      newCat.subCategories &&
      newCat.subCategories.filter((s) => s.id !== null).map((s) => s.id);

    const deleted =
      oldSubIds && oldSubIds.filter((id) => !newSubIds.includes(id));
    return deleted ? deleted.map((id) => ({ id })) : [];
  };

  const updateExistingCategory = (cat: Category) => {
    setCategories((prev) =>
      prev.map((c) =>
        (c.id !== null && c.id === cat.id) ||
        (c.id === null && c._tempId && cat._tempId && c._tempId === cat._tempId)
          ? cat
          : c
      )
    );

    if (cat.id === null) {
      setNewCategories((prev) =>
        prev.map((c) =>
          c._tempId && cat._tempId && c._tempId === cat._tempId ? cat : c
        )
      );
    } else {
      setUpdatedCategories((prev: any) => {
        const exists = prev.find((c: any) => c.id === cat.id);
        if (exists) {
          return prev.map((c: any) =>
            c.id === cat.id
              ? {
                  ...cat,
                  deletedSubCategories: getDeletedSubcategories(c, cat),
                }
              : c
          );
        }

        const oldCat = categories.find((c) => c.id === cat.id);
        if (!oldCat) return prev;

        return [
          ...prev,
          {
            ...cat,
            deletedSubCategories: getDeletedSubcategories(oldCat, cat),
          },
        ];
      });
    }
  };

  const deleteCategory = (category: Category) => {
    if (!category.id) {
      setCategories((prev) =>
        prev.filter((c) => c._tempId !== category._tempId)
      );
      setNewCategories((prev) =>
        prev.filter((c) => c._tempId !== category._tempId)
      );
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setUpdatedCategories((prev) => prev.filter((c) => c.id !== category.id));

    setDeletedCategories((prev) =>
      category.id ? [...prev, category.id] : [...prev]
    );
  };

  const deleteSubCategory = (
    categoryId: number | null,
    subCategoryId: number | null
  ) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const subToDelete = cat.subCategories.find(
          (sub) => sub.id === subCategoryId
        );
        if (!subToDelete) return cat;

        const updatedSubCategories = cat.subCategories.filter(
          (sub) => sub.id !== subCategoryId
        );
        const newDeleted = subCategoryId
          ? [...(cat.deletedSubCategories || []), subToDelete]
          : cat.deletedSubCategories || [];

        return {
          ...cat,
          subCategories: updatedSubCategories,
          deletedSubCategories: newDeleted,
        };
      })
    );

    if (categoryId) {
      setUpdatedCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;

          const subToDelete = cat.subCategories.find(
            (sub) => sub.id === subCategoryId
          );
          if (!subToDelete) return cat;

          const updatedSubCategories = cat.subCategories.filter(
            (sub) => sub.id !== subCategoryId
          );
          const newDeleted = subCategoryId
            ? [...(cat.deletedSubCategories || []), subToDelete]
            : cat.deletedSubCategories || [];

          return {
            ...cat,
            subCategories: updatedSubCategories,
            deletedSubCategories: newDeleted,
          };
        })
      );
    }
  };
  //update server with new data
  const saveAllChanges = async () => {
    const payload = {
      newCategories: newCategories.map(({ id, ...cat }) => ({
        name: cat.name,
        subCategories: dedupeSubCategories(cat.subCategories).map((sub) => ({
          name: sub.name,
          filmIds: sub.filmIds,
        })),
      })),
      updatedCategories: dedupeCategories(updatedCategories).map((cat) => ({
        id: cat.id,
        name: cat.name,
        updatedSubCategories: dedupeSubCategories(cat.subCategories).map(
          (sub) => ({
            id: sub.id,
            name: sub.name,
            filmIds: sub.filmIds,
          })
        ),
        deletedSubCategories: dedupeSubCategories(
          cat.deletedSubCategories || []
        ),
      })),
      deletedCategories: deletedCategories,
    };

    await saveCategories(payload);

    invalidateAll();

    loadData();
  };

  //empty state vars
  const invalidateAll = () => {
    setUpdatedCategories([]);
    setNewCategories([]);
    setDeletedCategories([]);
  };

  //dedupe helpers
  const dedupeSubCategories = (subs: SubCategory[]) => {
    const seen = new Set();
    return subs.filter((s) => {
      const key = s.id ?? s.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const dedupeCategories = (subs: Category[]) => {
    const seen = new Set();
    return subs.filter((s) => {
      const key = s.id ?? s.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  return (
    <CategoryContext.Provider
      value={{
        films,
        categories,
        addNewCategory,
        updateExistingCategory,
        deleteCategory,
        deleteSubCategory,
        saveAllChanges,
        setCategories,
        setFilms,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider"
    );
  }
  return context;
};
