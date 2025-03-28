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
    institute_name: "String",
    contact_name: "String",
    contact_mobile: "String",
    street_address: "String",
    city: "String",
    state: "String",
    country: "String",
    pincode: "String",
    area: "String",
    profile_name: "String",
    email: "String",
    password: "String",
    mobile: "String",
  };

  // Add these state variables at the top of your component
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Separate fetchData function that can be reused
  // Update the fetchData function to accept page parameter
  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/institutes${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Institutes);

      // Update pagination state
      const pagination = response.data.data.Pagination;
      setCurrentPage(pagination.current_page);
      setTotalPages(pagination.last_page);

      setConfig((prev) => ({
        ...prev,
        tableColumns: {
          ...prev?.tableColumns,
          pagination: {
            currentPage: pagination.current_page,
            lastPage: pagination.last_page,
            perPage: pagination.per_page,
            total: pagination.total,
            from: (pagination.current_page - 1) * pagination.per_page + 1,
            to: Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total
            ),
          },
        },
      }));

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
      // breadcrumbs: [
      //   { label: "Dashboard", href: "/dashboard" },
      //   { label: "Institutes" },
      // ],
      searchPlaceholder: "Search Institutes...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Institutes",
        description: "Manage Institutes and view their details.",
        headers: [
          { label: "Institute Name", key: "one" },
          { label: "Registration Number", key: "two" },
          { label: "Affiliated University", key: "three" },
          { label: "Email", key: "four" },

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
          currentPage: 1,
          lastPage: 1,
          perPage: 5,
          total: 0,
          from: 1,
          to: 5,
        },
      },
    });
  }, []);
  const navigate = useNavigate();

  // Handlers for actions
  const handleAddProduct = () => {
    console.log("Add Registration clicked");
    console.log("AS");
    navigate({ to: "/institutes/add" });
    // For example, navigate to an add registration page or open a modal
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    console.log(`Filter changed: ${filterValue}`);
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action, product) => {
    console.log(`Action: ${action} on registration:`, product);
    if (action === "edit") {
      // Navigate to edit page or open edit modal
    } else if (action === "delete") {
      // Implement delete functionality, possibly with confirmation
    }
  };

  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    await fetchData(query);
  };

  // Add pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(searchQuery, nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchData(searchQuery, prevPage);
    }
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

    return {
      id: item?.id,
      one: item?.institute_name || "Unknown",
      two: item?.registration_number || "NA",
      three: item?.affiliated_university || "NA",
      four: item?.user?.email || "NA",

      delete: "/institutes/" + item?.id,
      action: "actions", // Placeholder for action buttons
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
        // AddItem={AddItem}
        typeofschema={typeofschema}
        currentPage={currentPage}
        totalPages={totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
