import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Button,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useCategoryContext } from "../context/CategoryContext";
import { Category, SubCategory } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  initialCategory?: Category | null;
  onSave: () => void;
}

export const EditCategoryModal: React.FC<Props> = ({
  open,
  onClose,
  initialCategory,
  onSave,
}) => {
  const { films, addNewCategory, updateExistingCategory } =
    useCategoryContext();
  const [name, setName] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const isNew = !initialCategory?.id;

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setSubCategories(initialCategory.subCategories || []);
    } else {
      setName("");
      setSubCategories([]);
    }
  }, [initialCategory]);

  const handleSubNameChange = (index: number, value: string) => {
    const updated = [...subCategories];
    updated[index].name = value;
    setSubCategories(updated);
  };

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, { id: null, name: "", filmIds: [] }]);
  };

  const handleRemoveSubCategory = (index: number) => {
    const updated = [...subCategories];
    updated.splice(index, 1);
    setSubCategories(updated);
  };

  const handleFilmToggle = (subIndex: number, filmId: number) => {
    const updated = [...subCategories];
    const filmIds = updated[subIndex].filmIds || [];

    if (filmIds.includes(filmId)) {
      updated[subIndex].filmIds = filmIds.filter((id) => id !== filmId);
    } else {
      updated[subIndex].filmIds = [...filmIds, filmId];
    }

    setSubCategories(updated);
  };

  const handleSave = () => {
    const cleanedSubCategories = subCategories
      .filter((sub) => sub.name.trim())
      .map((sub) => ({
        ...sub,
        name: sub.name.trim(),
        filmIds: sub.filmIds || [],
      }));

    const updatedCategory: Category = {
      ...(initialCategory || { id: null }),
      name: name.trim(),
      subCategories: cleanedSubCategories,
    };

    if (initialCategory?.id) {
      updateExistingCategory(updatedCategory);
    } else {
      addNewCategory(updatedCategory);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isNew ? "Новая категория" : "Редактировать категорию"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <TextField
            label="Название категории"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          {subCategories.map((sub, subIndex) => (
            <Box key={subIndex} border={1} borderRadius={2} padding={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TextField
                  label={`Подкатегория ${subIndex + 1}`}
                  value={sub.name}
                  onChange={(e) =>
                    handleSubNameChange(subIndex, e.target.value)
                  }
                  fullWidth
                />
                <IconButton onClick={() => handleRemoveSubCategory(subIndex)}>
                  <Delete />
                </IconButton>
              </Stack>

              <Box mt={2}>
                <Typography variant="subtitle2">Фильмы</Typography>
                <Stack spacing={1}>
                  {films &&
                    films.length > 0 &&
                    films.map((film) => (
                      <Box key={film.id}>
                        <Button
                          variant={
                            sub.filmIds && sub.filmIds.includes(film.id)
                              ? "contained"
                              : "outlined"
                          }
                          size="small"
                          onClick={() => handleFilmToggle(subIndex, film.id)}
                        >
                          {film.name}
                        </Button>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </Box>
          ))}

          <Button
            startIcon={<Add />}
            onClick={handleAddSubCategory}
            variant="outlined"
          >
            Добавить подкатегорию
          </Button>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={onClose}>Отмена</Button>
            <Button variant="contained" onClick={handleSave}>
              Сохранить
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
