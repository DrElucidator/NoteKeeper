import { CategoryResponse, SaveCategoryRequest } from './categories.api-models';
import { Category, SaveCategoryFormValue } from './category.models';

export function toCategory(response: CategoryResponse): Category {
  return {
    id: response.id,
    title: response.titulo,
  };
}

export function toSaveCategoryRequest(value: SaveCategoryFormValue): SaveCategoryRequest {
  return {
    titulo: value.title.trim(),
  };
}
