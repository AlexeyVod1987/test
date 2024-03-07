import ProductList from "./components/productList/ProductList";
import FilterForm from "./components/filterForm/FilterForm";

function App() {
  return (
    <div className="main-block"> 
      <FilterForm/>
      <ProductList/>
    </div>
  );
}

export default App;
