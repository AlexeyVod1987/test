import { configureStore } from "@reduxjs/toolkit";
import productsSlice from '../features/product/productSlice'

export const store = configureStore({
  reducer: {
    products: productsSlice
  },
});
