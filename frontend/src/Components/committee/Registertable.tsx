import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
// import AddItem from "./add/TestCard";
import userAvatar from "@/images/Profile.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
export default function Dashboardholiday() {
  const user = localStorage.getItem("user");
  const User = JSON.parse(user);
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const typeofschema = {
    course_id: "String",
    semester: "String",
    standard: "String",
  };

  // Add pagination state
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  });

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Separate fetchData function that can be reused
  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/committee${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Commitees);

      // Update pagination state
      const pagination = response.data.data.Pagination;
      setPaginationState({
        currentPage: Number(pagination.current_page),
        totalPages: Number(pagination.last_page),
        perPage: Number(pagination.per_page),
        total: Number(pagination.total),
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setLoading(false);
    }
  };

  // Define the dashboard configuration
  useEffect(() => {
    setConfig({
      breadcrumbs: [
        { label: "Home", href: "/dashboards" },
        { label: "/", href: "" },
        { label: "Commitees" },
      ],
      searchPlaceholder: "Search by Commitees...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Commitees",
        description: "Manage Commitees and view their details.",
        headers: [
          { label: "Committee Name", key: "one" },
          { label: "Institute", key: "two" },

          { label: "Action", key: "action" },
        ],
        // tabs: [
        //   { label: "All", value: "all" },
        //   { label: "Active", value: "active" },
        //   { label: "Completed", value: "completed" },
        // ],
        // filters: [
        //   { label: "Active", value: "active", checked: true },
        //   { label: "Completed", value: "completed", checked: false },
        // ],
        actions: [
          { label: "Edit", value: "edit" },
          { label: "Delete", value: "delete" },
        ],
        pagination: {
          from: 1,
          to: 10,
          total: 32,
        },
      },
    });
  }, []);
  const navigate = useNavigate();

  // Handlers for actions
  const handleAddProduct = () => {
    
    navigate({ to: "/committee/add" });
    // For example, navigate to an add registration page or open a modal
  };

  const handleExport = () => {
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action, product) => {
    if (action === "edit") {
      // Navigate to edit page or open edit modal
    } else if (action === "delete") {
      // Implement delete functionality, possibly with confirmation
    }
  };

  // Add pagination handlers
  const handleNextPage = () => {
    if (paginationState.currentPage < paginationState.totalPages) {
      handlePageChange(paginationState.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (paginationState.currentPage > 1) {
      handlePageChange(paginationState.currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationState.totalPages) {
      setPaginationState((prev) => ({ ...prev, currentPage: page }));
      fetchData(searchQuery, page);
    }
  };

  // Update search handler to reset pagination
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    await fetchData(query, 1);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format
  const mappedTableData = data?.map((item) => {
    const services = item?.services || [];
    const paidAmount = item?.paymentMode?.paidAmount || 0;

    // Calculate the total service price based on each service's populated details.
    const totalServicePrice = services.reduce((acc, service) => {
      const servicePrice = service?.serviceId?.price || 0; // Replace 'price' with the actual field name for service price
      return acc + servicePrice;
    }, 0);

    // Calculate balance amount based on total service price and paid amount.
    const balanceAmount =
      totalServicePrice - paidAmount > 0 ? totalServicePrice - paidAmount : 0;
    return {
      id: item?.id,
      one: item?.commitee_name || "Unknown",
      two: item?.institute_name || "NA",

      delete: "/committee/" + item?.id,
    };
  });

  return (
    <div className="p-4">
      <Dashboard
        breadcrumbs={config.breadcrumbs}
        searchPlaceholder={config.searchPlaceholder}
        userAvatar={userAvatar}
        tableColumns={config.tableColumns}
        tableData={mappedTableData}
        onAddProduct={handleAddProduct}
        onExport={handleExport}
        onFilterChange={handleFilterChange}
        onProductAction={handleProductAction}
        onSearch={handleSearch}
        fetchData={fetchData}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={(page) => handlePageChange(page)}
        handlePageChange={handlePageChange}
        // AddItem={AddItem}
        typeofschema={typeofschema}
      />
    </div>
  );
}
