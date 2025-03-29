import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/trustees${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Trustees);

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

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    setConfig({
      searchPlaceholder: "Search Trustees...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Trustees",
        description: "Manage Trustees and view their details.",
        headers: [
          { label: "Trustees Name", key: "one" },
          { label: "Designation", key: "two" },
          { label: "Email", key: "three" },
          { label: "Contact Number", key: "four" },
          { label: "Address", key: "five" },
          { label: "Action", key: "action" },
        ],
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

  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    await fetchData(query, 1);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(event.currentTarget.value);
    }
  };

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

  const navigate = useNavigate();

  // Handlers for actions
  const handleAddProduct = () => {
    console.log("Add Registration clicked");
    console.log("AS");
    navigate({ to: "/trusties/add" });
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
      one: item?.trustee_name || "Unknown",
      two: item?.designation || "NA",
      three: item?.user.email || "NA",
      four: item?.contact_mobile || "NA",
      five: item?.address || "NA",
      delete: "/trustees/" + item?.id,
      action: "actions",
    };
  });

  return (
    <div className="p-4">
      <Dashboard
        breadcrumbs={config?.breadcrumbs}
        searchPlaceholder={config?.searchPlaceholder}
        userAvatar={userAvatar}
        tableColumns={config?.tableColumns}
        tableData={mappedTableData}
        onAddProduct={handleAddProduct}
        onExport={handleExport}
        onFilterChange={handleFilterChange}
        onProductAction={handleProductAction}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress} // Add this prop
        searchQuery={searchQuery} // Add this prop
        typeofschema={typeofschema}
        currentPage={currentPage}
        totalPages={totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        fetchData={fetchData}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
