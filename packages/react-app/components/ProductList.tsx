// Import dependencies
import { useState, useEffect } from "react";
import { useContractCall } from "@/hooks/contract/useContractRead";
import Product from "./Product";
import ErrorAlert from "@/components/alerts/ErrorAlert";
import LoadingAlert from "@/components/alerts/LoadingAlert";
import SuccessAlert from "@/components/alerts/SuccessAlert";
import { useProductsLength } from '@/hooks/contract/useProductsLength';
import { useAccount, useBalance } from "wagmi";
import erc20Instance from "../abi/erc20.json";

const ProductList = () => {
  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Contracts and states
  const { data } = useContractCall("getProductsLength", [], true);
  const productLength = data ? Number(data.toString()) : 0;
  const { productsLength, isLoading: productsLengthLoading } = useProductsLength();
  const { address } = useAccount();
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState("");
  const [displayBalance, setDisplayBalance] = useState(false);
  const [sortOption, setSortOption] = useState('default'); // Sorting option

  const clear = () => {
    setError("");
    setSuccess("");
    setLoading("");
  };

  // Sorting products by ID
  const getSortedProductIds = () => {
    if (!productLength) return [];

    let ids = Array.from({ length: productLength }, (_, i) => i);

    if (sortOption === 'newest') {
      ids.reverse(); // Newest first
    }
    return ids;
  };

  // ⚡ Handle hydration - don't render until mounted
  if (!mounted) {
    return null; 
  }

  return (
    <div>
      {/* Alerts */}
      {error && <ErrorAlert message={error} clear={clear} />}
      {success && <SuccessAlert message={success} />}
      {loading && <LoadingAlert message={loading} />}

      {/* Page content */}
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">

        {/* User cUSD Balance */}
        {displayBalance && (
          <span className="inline-block text-dark ml-4 px-6 py-2.5 font-medium text-md leading-tight rounded-2xl shadow-none">
            Balance: {Number(cusdBalance?.formatted || 0).toFixed(2)} cUSD
          </span>
        )}

        <h2 className="sr-only">Products</h2>

        {/* Sort Dropdown */}
        <div className="mb-4 text-center border border-gray-400 rounded p-4">
          <div className="mb-2">
            <label htmlFor="sort" className="mr-2 font-semibold">Sort by:</label>
            <select
              id="sort"
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="default">Newest First</option>
              <option value="newest">Oldest First</option>
            </select>
          </div>

          {/* Product counter */}
          <p className="text-lg text-gray-600">
            {productsLengthLoading ? (
              <span>Loading products...</span>
            ) : (
              <span>Total products: {productsLength}</span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {getSortedProductIds().map((id) => (
            <Product
              key={id}
              id={id}
              setSuccess={setSuccess}
              setError={setError}
              setLoading={setLoading}
              loading={loading}
              clear={clear}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
