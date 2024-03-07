import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTotalItems,
  fetchItemsDetails,
} from "../../features/product/productSlice";
import Pagination from "../pagination/Pagination";
import "./productList.css";

function ProductList() {
  const dispatch = useDispatch();
  const productsStatus = useSelector((state) => state.products.status);
  const products = useSelector((state) => state.products.products);
  const error = useSelector((state) => state.products.error);

  useEffect(() => {
    dispatch(fetchTotalItems()).then((data) => {
      if (data) {
        dispatch(fetchItemsDetails());
      }
    });
  }, [dispatch]);

  let content;

  if (productsStatus === "loading") {
    content = <div>Загрузка продуктов...</div>;
  } else if (productsStatus === "succeeded") {
    content = products?.map((product, index) => (
      <div className="product" key={index}>
        <div className="product-container">
          id товара:
          <span className="product-id">{product?.id}</span>
        </div>
        <div className="product-container">
          Наименование товара:
          <span className="product-name">{product?.product}</span>
        </div>

        <span className="product-brend">{product?.brand}</span>
        <div className="product-container">
          Цена:
          <span className="product-price">{product?.price}</span>
        </div>
      </div>
    ));
  } else if (productsStatus === "failed") {
    console.error(error);
  }

  return (
    <div className="container">
      <div className="product-list">{content}</div>
      <Pagination />
    </div>
  );
}

export default ProductList;
