import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import md5 from "crypto-js/md5";

const generateAuthHeader = () => {
  const password = "Valantis";
  const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const hash = md5(`${password}_${timestamp}`).toString();
  return hash;
};

const uniqueItemsById = (items) => {
  const uniqueItems = new Map();
  items.forEach((item) => {
    if (!uniqueItems.has(item.id)) {
      uniqueItems.set(item.id, item);
    }
  });
  return Array.from(uniqueItems.values());
};

const initialState = {
  brands: [],
  totalItems: [],
  products: [],
  filteredItems: [],
  status: "idle",
  error: null,
  page: 1,
  totalPage: 1,
};

export const fetchBrands = createAsyncThunk(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const authHeader = generateAuthHeader("Valantis");
      const response = await axios.post(
        "https://api.valantis.store:41000/",
        {
          action: "get_fields",
          params: { field: "brand" },
        },
        { headers: { "X-Auth": authHeader } }
      );
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Unknown error");
    }
  }
);

export const fetchTotalItems = createAsyncThunk(
  "products/fetchTotalItemCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://api.valantis.store:41000/",
        { action: "get_ids" },
        { headers: { "X-Auth": generateAuthHeader("Valantis") } }
      );
      return [...new Set(response.data.result)];
    } catch (error) {
      console.error("Error fetching total item count:", error);
      return rejectWithValue(error.response?.data || "Unknown error");
    }
  }
);

export const fetchItemsDetails = createAsyncThunk(
  "products/fetchItemsDetails",
  async (page = 1, { getState, rejectWithValue }) => {
    try {
      const itemsPerPage = 50;
      const { totalItems } = getState().products;
      const totalPages = Math.ceil(totalItems.length / itemsPerPage);
      const currentPage = page < 1 ? totalPages : page;
      const finalPage = currentPage > totalPages ? 1 : currentPage;
      const start = (finalPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const productIds = totalItems.slice(start, end);

      const response = await axios.post(
        "https://api.valantis.store:41000/",
        {
          action: "get_items",
          params: { ids: productIds },
        },
        { headers: { "X-Auth": generateAuthHeader("Valantis") } }
      );
      console.log(uniqueItemsById(response.data.result));
      return uniqueItemsById(response.data.result);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Unknown error");
    }
  }
);

export const fetchFilteredProducts = createAsyncThunk(
  "products/fetchFilteredProducts",
  async (filterParams, { rejectWithValue }) => {
    const maxRetries = 3;
    let tries = 0;
    console.log(filterParams);
    const attemptFetch = async () => {
      try {
        const authHeader = generateAuthHeader("Valantis");
        const response = await axios.post(
          "https://api.valantis.store:41000/",
          {
            action: "filter",
            params: { ...filterParams },
          },
          { headers: { "X-Auth": authHeader } }
        );
        return [...new Set(response.data.result)];
      } catch (error) {
        if (tries < maxRetries) {
          tries += 1;
          console.log(`Повторная попытка ${tries}:`, error.message);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return await attemptFetch();
        } else {
          console.error(
            "Превышено максимальное количество попыток:",
            error.message
          );
          return rejectWithValue(error.response?.data || "Unknown error");
        }
      }
    };

    return await attemptFetch();
  }
);

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload.filter((brand) => brand != null);
      })
      .addCase(fetchTotalItems.fulfilled, (state, action) => {
        state.totalItems = action.payload;
        state.totalPage = action.payload.length;
      })
      .addCase(fetchItemsDetails.pending, (state) => {
        state.status = "loadingDetails";
      })
      .addCase(fetchItemsDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchItemsDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
        state.totalItems = action.payload;
        state.totalPage = action.payload.length;
        state.page = 1;
      });
  },
});

export default productsSlice.reducer;
