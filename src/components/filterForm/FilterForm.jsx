import { useState, useEffect } from "react";
import "./filterForm.css";
import { fetchFilteredProducts, fetchItemsDetails } from "../../features/product/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../features/product/productSlice";

function FilterForm() {
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");

  const dispatch = useDispatch();
  const brands = useSelector((state) => state.products.brands);

const handleSubmit = (event) => {
  event.preventDefault();
  const filterParams = {};
  if (product) filterParams.product = product;
  if (price && !isNaN(Number(price))) filterParams.price = Number(price);
  if (brand) filterParams.brand = brand;
  dispatch(fetchFilteredProducts(filterParams)).then(() => {
      dispatch(fetchItemsDetails());
  });
};


  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="filter-name"
        type="text"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        placeholder="Название товара"
      />

      <input
        className="filter-price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="цена"
      />
      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="filter-brand"
      >
        <option value="">Выберите бренд</option>
        {brands.map((brand, index) => (
          <option key={index} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <button type="submit" className="filter-button">
        Фильтровать
      </button>
    </form>
  );
}

export default FilterForm;
