import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemsDetails } from "../../features/product/productSlice";
import "./pagination.css";

function Pagination() {
  const dispatch = useDispatch();
  const totalItems = useSelector((state) => state.products.totalItems);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(totalItems.length / itemsPerPage);

  const handlePrevious = () => {
    const newPage = currentPage > 1 ? currentPage - 1 : totalPages;
    setCurrentPage(newPage);
    dispatch(fetchItemsDetails(newPage));
  };
  
  const handleNext = () => {
    const newPage = currentPage < totalPages ? currentPage + 1 : 1;
    setCurrentPage(newPage);
    dispatch(fetchItemsDetails(newPage));
  };

  return (
    <div className="pagination">
      <button onClick={handlePrevious} className="changePage">
        Предыдущая
      </button>
      <span>
        Страница {currentPage} из {totalPages}
      </span>
      <button onClick={handleNext} className="changePage">
        Следующая
      </button>
    </div>
  );
}
export default Pagination;
