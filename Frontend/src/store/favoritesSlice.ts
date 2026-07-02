import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  movieIds: string[];
}

const getInitialState = (): FavoritesState => {
  try {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      return { movieIds: JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Could not load favorites from localStorage", e);
  }
  return { movieIds: [] };
};

const initialState: FavoritesState = getInitialState();

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const movieId = action.payload;
      if (state.movieIds.includes(movieId)) {
        state.movieIds = state.movieIds.filter(id => id !== movieId);
      } else {
        state.movieIds.push(movieId);
      }
      try {
        localStorage.setItem('favorites', JSON.stringify(state.movieIds));
      } catch (e) {
        console.error("Could not save favorites to localStorage", e);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
