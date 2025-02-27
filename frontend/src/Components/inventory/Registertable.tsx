import { useEffect, useState } from "react";
import axios from "axios";
import { Dashboard } from "./Dashboardreuse";
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
    asset: "String",
    institute_id: "String",
    purchase_date: "String",
    remarks: "String",
  };
  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Separate fetchData function that can be reused
  const fetchData = async (query: string = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/inventory${query ? `?search=${query}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Inventory);

      // Update pagination in config
      setConfig((prev) => ({
        ...prev,
        tableColumns: {
          ...prev?.tableColumns,
          pagination: {
            from: response.data.data.Pagination.from || 1,
            to: response.data.data.Pagination.to || 10,
            total: response.data.data.Pagination.total || 0,
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
      searchPlaceholder: "Search Inventory...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Inventory",
        description: "Manage Inventory and view their details.",
        headers: [
          { label: "Institute Name", key: "one" },
          { label: "Asset", key: "two" },
          { label: "Purchase Date", key: "three" },
          { label: "Remark", key: "four" },

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
    // console.log("Add Registration clicked");
    // console.log("AS");
    navigate({ to: "/inventory/add" });
    // For example, navigate to an add registration page or open a modal
  };

  const handleExport = () => {
    // console.log("Export clicked");
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    // console.log(`Filter changed: ${filterValue}`);
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action, product) => {
    // console.log(`Action: ${action} on registration:`, product);
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
      one: item?.institute_name || "Unknown",
      two: item?.asset || "NA",
      three: item?.purchase_date || "NA",
      four: item?.remarks || "NA",

      delete: "/inventory/" + item?.id,
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
      />
    </div>
  );
}
