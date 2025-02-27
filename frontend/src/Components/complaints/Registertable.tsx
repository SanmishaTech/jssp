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
// Import dialog components (assuming these exist in your UI library)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    medium_code: "String",
    medium_title: "String",
    organization: "String",
  };

  // State for managing the dialog with selected complaint details
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Separate fetchData function that can be reused
  const fetchData = async (query: string = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/complaints${query ? `?search=${query}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Complaint);

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
      searchPlaceholder: "Search Complaint...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Complaint",
        description: "Manage Complaint and view their details.",
        headers: [
          { label: "Institute Name", key: "one" },
          { label: "Complaint Date", key: "two" },
          { label: "Complainant Name", key: "three" },
          { label: "Nature Of Complaint", key: "four" },
          { label: "Action", key: "action" },
        ],
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
    navigate({ to: "/complaints/add" });
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    console.log(`Filter changed: ${filterValue}`);
    // Implement filtering logic here, possibly refetching data with filters applied
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

  // This handler is triggered when a row is clicked.
  const handleRowClick = (rowData) => {
    // Set the selected complaint to the entire rowData object
    setSelectedComplaint(rowData);
    setShowDialog(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format.
  // Now including a "description" field.
  const mappedTableData = data?.map((item) => {
    const services = item?.services || [];
    const paidAmount = item?.paymentMode?.paidAmount || 0;
    const totalServicePrice = services.reduce((acc, service) => {
      const servicePrice = service?.serviceId?.price || 0;
      return acc + servicePrice;
    }, 0);
    const balanceAmount =
      totalServicePrice - paidAmount > 0 ? totalServicePrice - paidAmount : 0;
    return {
      id: item?.id,
      one: item?.institute_name || "Unknown",
      two: item?.complaint_date || "NA",
      three: item?.complainant_name || "NA",
      four: item?.nature_of_complaint || "NA",
      description: item?.description || "No description available",
      delete: "/complaints/" + item?.id,
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
        // Pass the row click handler to your Dashboard component
        onRowClick={handleRowClick}
        typeofschema={typeofschema}
      />

      {/* Dialog that appears when a row is clicked */}
      {showDialog && selectedComplaint && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedComplaint.one}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="font-semibold">Description:</p>
              <p>{selectedComplaint.description}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
