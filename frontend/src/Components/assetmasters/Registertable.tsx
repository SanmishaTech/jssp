import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import AddAcademicYearDialog from "./AddAcademicYearDialog";
import EditAcademicYearDialog from "./EditAcademicYearDialog";
import ViewAssetMasterDialog from "./ViewAssetMasterDialog";

interface Subject {
  id: string;
  asset_type?: string;
  service_required?: number | boolean;
  asset_category_ids?: Array<{label: string; value: string}> | string;
  medium_title?: string;
  medium_code?: string;
  organization?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse {
  data: {
    Subject: Subject[];
    Pagination: PaginationData;
  };
}

interface DashboardConfig {
  breadcrumbs: Array<{ label: string; href?: string }>;
  searchPlaceholder: string;
  userAvatar: string;
  tableColumns: {
    title: string;
    description: string;
    headers: Array<{
      label: string;
      key: string;
      hiddenOn?: string;
      sortable?: boolean;
    }>;
    actions: Array<{ label: string; value: string }>;
    pagination: {
      currentPage: number;
      lastPage: number;
      perPage: number;
      total: number;
      from: number;
      to: number;
    };
  };
}

interface DashboardProps {
  breadcrumbs: Array<{ label: string; href?: string }>;
  searchPlaceholder: string;
  userAvatar: string;
  tableColumns: {
    title: string;
    description: string;
    headers: Array<{
      label: string;
      key: string;
      hiddenOn?: string;
      sortable?: boolean;
    }>;
    actions: Array<{ label: string; value: string }>;
    pagination: {
      currentPage: number;
      lastPage: number;
      perPage: number;
      total: number;
      from: number;
      to: number;
    };
  };
  tableData: Array<{
    id: string;
    one: string;
    two: string;
    three: string;
    four: string;
    delete: string;
  }>;
  onAddProduct: () => void;
  onExport: () => void;
  onFilterChange: (value: string) => void;
  onProductAction: (action: string, product: Subject) => Promise<void>;
  onSearch: (query: string) => void;
  typeofschema: Record<string, string>;
  currentPage: number;
  totalPages: number;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  setCurrentPage: (page: number) => void;
  handlePageChange: (page: number) => void;
  fetchData: (query?: string, page?: number) => Promise<void>;
  AddItem?: string;
  Edititem?: string;
  filterValue?: string;
  setSearch?: (value: string) => void;
  Searchitem?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
  searchQuery: string;
}

export default function Dashboardholiday() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const typeofschema = {
    medium_code: "String",
    medium_title: "String",
    organization: "String",
  };

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  });

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, [token]);

  // Separate fetchData function that can be reused
  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `/api/assetmasters${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.AssetMaster);

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
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setLoading(false);
    }
  };

  // Define the dashboard configuration
  useEffect(() => {
    setConfig({
      breadcrumbs: [
        { label: "Home", href: "/staffdashboard" },
        { label: "/", href: "" },
        { label: "Asset Information", href: "" },
        { label: "/", href: "" },
        { label: "Asset Master" },
      ],

      searchPlaceholder: "Search Asset Master...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Asset Master",
        description: "Manage Asset Master and view their details.",
        headers: [
          { label: "Asset Type", key: "one" },
          { label: "Service Required", key: "two" },
          { label: "Asset Category", key: "three" },
          { label: "Unit", key: "four" },
          { label: "Action", key: "action" },
        ],
        actions: [
          { label: "Edit", value: "edit" },
          { label: "View", value: "view" },
          { label: "Delete", value: "delete" },
        ],
        pagination: {
          currentPage: paginationState.currentPage,
          lastPage: paginationState.totalPages,
          perPage: paginationState.perPage,
          total: paginationState.total,
          from: (paginationState.currentPage - 1) * paginationState.perPage + 1,
          to: Math.min(
            paginationState.currentPage * paginationState.perPage,
            paginationState.total
          ),
        },
      },
    });
  }, [data, paginationState]);

  // Handlers for actions
  const handleAddProduct = () => {
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    console.log("Export clicked");
  };

  const handleFilterChange = (filterValue: string) => {
    console.log(`Filter changed: ${filterValue}`);
  };

  const handleProductAction = async (action: string, product: Subject) => {
    if (action === "edit") {
      setSelectedSubjectId(product.id);
      setIsEditDialogOpen(true);
    } else if (action === "view") {
      setSelectedSubjectId(product.id);
      setIsViewDialogOpen(true);
    } else if (action === "delete") {
      try {
        const response = await axios.delete(`/api/subjects/${product.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          // Refetch the data after successful deletion
          await fetchData(searchQuery, paginationState.currentPage);
        }
      } catch (err) {
        console.error("Error deleting subject:", err);
      }
    }
  };

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format
  const mappedTableData = data.map((item) => ({
    id: item.id,
    one: item.asset_type || "Unknown",
    two: (() => {
      // Convert to string for safer comparison
      const serviceReq = String(item.service_required);
      if (serviceReq === '1' || serviceReq === 'true') {
        return "Yes";
      } else if (serviceReq === '0' || serviceReq === 'false') {
        return "No";
      } else {
        return "Unknown";
      }
    })(),
    three: (() => {
      let categories = [];
      
      if (Array.isArray(item.asset_category_ids)) {
        categories = item.asset_category_ids.map(category => category.label || category.value);
      } else if (typeof item.asset_category_ids === 'string') {
        try {
          categories = JSON.parse(item.asset_category_ids || '[]')
            .map(category => category.label || category.value || category);
        } catch (e) {
          return "Unknown";
        }
      } else {
        return "Unknown";
      }
      
      // Show only first 3 categories with ellipsis if more exist
      if (categories.length > 3) {
        return categories.slice(0, 3).join(", ") + "...";
      } else {
        return categories.join(", ") || "Unknown";
      }
    })(),
    four: item.unit || "-",

    delete: "/assetmasters/" + item.id,
  }));

  const dashboardProps: DashboardProps = {
    breadcrumbs: config.breadcrumbs,
    searchPlaceholder: config.searchPlaceholder,
    userAvatar: userAvatar,
    tableColumns: config.tableColumns,
    tableData: mappedTableData,
    onAddProduct: handleAddProduct,
    onExport: handleExport,
    onFilterChange: handleFilterChange,
    onProductAction: handleProductAction,
    onSearch: handleSearch,
    typeofschema: typeofschema,
    currentPage: paginationState.currentPage,
    totalPages: paginationState.totalPages,
    handleNextPage: handleNextPage,
    handlePrevPage: handlePrevPage,
    setCurrentPage: handlePageChange,
    handlePageChange: handlePageChange,
    fetchData: fetchData,
    AddItem: undefined,
    Edititem: undefined,
    filterValue: undefined,
    setSearch: undefined,
    Searchitem: undefined,
    onKeyPress: undefined,
    searchQuery: searchQuery,
  };

  return (
    <div className="p-4">
      <Dashboard {...dashboardProps} />
      <AddAcademicYearDialog
        isOpen={isDialogOpen}
        onOpen={setIsDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
      />
      <EditAcademicYearDialog
        isOpen={isEditDialogOpen}
        onOpen={setIsEditDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
        academicYearId={selectedSubjectId}
      />
      <ViewAssetMasterDialog
        isOpen={isViewDialogOpen}
        onOpen={setIsViewDialogOpen}
        backdrop="blur"
        assetMasterId={selectedSubjectId}
      />
    </div>
  );
}
