import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';


interface BookState {
  likedBooks: Book[];
  dislikedBooks: Book[];
}

interface Book {
  id: number;
  title: string;
  image: string;
}

const initialState: BookState = {
  likedBooks: [],
  dislikedBooks: [],
};

// Creating a slice for managing book-related state
const bookSlice = createSlice({
  name: 'book', // Name of the slice
  initialState, // Initial state of the slice
  reducers: {
    // Reducer for liking a book
    likeBook: (state, action: PayloadAction<Book>) => { // how the state changes on dispatch
      state.likedBooks.push(action.payload); // Adding the liked book to the 'likedBooks' array in the state
    },
    // Reducer for disliking a book
    dislikeBook: (state, action: PayloadAction<Book>) => {
      state.dislikedBooks.push(action.payload); // Adding the disliked book to the 'dislikedBooks' array in the state
    },
  },
});


export const { likeBook, dislikeBook } = bookSlice.actions;

const store = configureStore({
  reducer: {
    book: bookSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
