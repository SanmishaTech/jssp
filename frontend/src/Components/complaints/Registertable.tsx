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

  // Add pagination state
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  });

  // Function to format date to dd-mm-yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "NA";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original string if invalid date
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  // State for managing the dialog with selected complaint details
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]); // Only re-run when token changes

  // Separate fetchData function that can be reused
  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/complaints${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const complaints = response.data.data.Complaint;
      setData(complaints);

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
        { label: "Home", href: "/staffdashboard" },
        { label: "/", href: "" },
        { label: "Complaint" },
      ],
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

  // Update handleSearch to reset pagination
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    await fetchData(query, 1);
  };

  // This handler is triggered when a row is clicked.
  const handleRowClick = (rowData) => {
    console.log("Row clicked:", rowData);
    // Store the original data structure
    setSelectedComplaint({
      institute_name: rowData.one,
      complaint_date: rowData.two,
      complainant_name: rowData.three,
      nature_of_complaint: rowData.four,
      description: rowData.description,
    });
    setShowDialog(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format.
  const mappedTableData = data?.map((item) => {
    console.log("Mapping item:", item);
    return {
      id: item?.id,
      one: item?.institute_name || "Unknown",
      two: formatDate(item?.complaint_date) || "NA",
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
        onRowClick={handleRowClick}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={(page) => handlePageChange(page)}
        handlePageChange={handlePageChange}
        typeofschema={typeofschema}
        fetchData={fetchData}
      />

      {/* Dialog that appears when a row is clicked */}
      {showDialog && selectedComplaint && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-600">Institute Name:</p>
                  <p className="text-lg">{selectedComplaint.institute_name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Complaint Date:</p>
                  <p className="text-lg">{selectedComplaint.complaint_date}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">
                    Complainant Name:
                  </p>
                  <p className="text-lg">
                    {selectedComplaint.complainant_name}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">
                    Nature of Complaint:
                  </p>
                  <p className="text-lg">
                    {selectedComplaint.nature_of_complaint}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-gray-600">Description:</p>
                <p className="text-lg whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>
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
