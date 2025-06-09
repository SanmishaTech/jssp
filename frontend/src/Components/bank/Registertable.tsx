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
import { format } from "date-fns";

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
    total_valuation: "String",
    university_upload: "String",
    received_prn: "String",
  };

  // Add these new state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Update the fetchData function to correctly handle the pagination response
  const fetchData = async (
    query: string = "",
    page: number = 1,
    date: string = ""
  ) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/subjects?page=${page}&limit=${itemsPerPage}${query ? `&search=${query}` : ""}${date ? `&date=${date}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update data from response
      setData(response.data.data.Subject);

      // Update pagination info from the actual response structure
      const pagination = response.data.data.Pagination;
      setTotalPages(pagination.last_page);

      // Update config with correct pagination values
      setConfig((prev) => ({
        ...prev,
        tableColumns: {
          ...prev?.tableColumns,
          pagination: {
            from: (pagination.current_page - 1) * pagination.per_page + 1,
            to: Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total
            ),
            total: pagination.total,
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
      breadcrumbs: [
        { label: "Home", href: "/dashboards" },
        { label: "/", href: "" },
        { label: "Subject" },
      ],
      searchPlaceholder: "Search Subject...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Subject",
        description: "Manage Subject and view their details.",
        headers: [
          { label: "Subject", key: "one" },

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
    console.log("Add Registration clicked");
    console.log("AS");
    navigate({ to: "/subjects/add" });
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

  // Update the handleNextPage function to use the correct page number
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(searchQuery, nextPage, selectedDate);
    }
  };

  // Update the handlePrevPage function to use the correct page number
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchData(searchQuery, prevPage, selectedDate);
    }
  };

  // Update the search handler to reset pagination
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    await fetchData(query, 1, selectedDate);
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchData(searchQuery, 1, date); // Trigger fetch with the selected date
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
      one: item?.subject_name || "Unknown",
      delete: "/subjects/" + item?.id,
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
        // Add these new props
        currentPage={currentPage}
        totalPages={totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={setCurrentPage}
        setSearch={setSearchQuery}
        fetchData={fetchData}
        Searchitem={searchQuery}
        onDateChange={handleDateChange} // Pass the date change handler
        selectedDate={selectedDate} // Pass the selected date
      />
    </div>
  );
}
