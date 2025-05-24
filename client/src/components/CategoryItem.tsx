import React from "react";
import { Category, SubCategory } from "../types";
import { useCategoryContext } from "../context/CategoryContext";
import { Delete } from "@mui/icons-material";
import {
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
} from "@mui/material";

interface Props {
  category: Category;
  setEditedCategory: (cat: Category) => void;
}

export const CategoryItem: React.FC<Props> = ({
  category,
  setEditedCategory,
}) => {
  const { films, deleteCategory } = useCategoryContext();

  const getFilmNames = (filmIds: number[]) =>
    filmIds && filmIds.length > 0
      ? (filmIds
          .map((id) => films.find((f) => f.id === id)?.name)
          .filter(Boolean) as string[])
      : [""];

  return (
    <Paper elevation={2} sx={{ padding: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{category.name}</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setEditedCategory(category)}
        >
          Редактировать
        </Button>
        <IconButton onClick={() => deleteCategory(category)}>
          <Delete />
        </IconButton>
      </Box>

      {category.subCategories &&
        category.subCategories.map((sub: SubCategory) => (
          <Box key={sub.id ?? Math.random()} mt={2}>
            <Typography variant="subtitle1">{sub.name}</Typography>
            <List dense>
              {getFilmNames(sub.filmIds).map((filmName) => (
                <ListItem key={filmName}>
                  <ListItemText primary={filmName} />
                </ListItem>
              ))}
              {sub.filmIds && sub.filmIds.length === 0 && (
                <ListItem>
                  <ListItemText primary="Нет фильмов" />
                </ListItem>
              )}
            </List>
            <Divider sx={{ mt: 1, mb: 1 }} />
          </Box>
        ))}
    </Paper>
  );
};
