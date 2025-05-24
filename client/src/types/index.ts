export interface Film {
    id: number;
    name: string;
  }
  
  export interface SubCategory {
    id: number | null;
    name: string;
    filmIds: number[];
  }
  
  export interface Category {
    id: number | null;
    name: string;
    subCategories: SubCategory[];
    deletedSubCategories?: SubCategory[];
    _tempId?: number;
  }

  export interface Data {
    films: Film[],
    categories: Category[]
  }
  
  export interface LocalChanges {
    newCategories: Category[];
    updatedCategories: {
      id: number;
      name: string;
      updatedSubCategories: SubCategory[];
      deletedSubCategories: number[];
    }[];
    deletedCategories: number[];
  }
  