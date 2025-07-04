import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import AddAdmissionDialog from "./AddAdmissionDialog";
import EditAdmissionDialog from "./EditAdmissionDialog";

interface Admission {
  id: string;
  total_fees: string;
  cash: string;
  upi: string;
  total_valuation?: string;
  university_upload?: string;
  received_prn?: string;
  created_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse {
  data: {
    Admission: Admission[];
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
  onProductAction: (action: string, product: Admission) => Promise<void>;
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

// Utility to format created_at
const formatDateTime = (datetime: string) => {
  const date = new Date(datetime);
  const dateStr = date.toLocaleDateString("en-GB").replace(/\//g, "-");
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} (${timeStr})`;
};

export default function Dashboardholiday() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [data, setData] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>("");
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
    fetchData();
  }, [token]);

  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `/api/admissions${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Admission);
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

  useEffect(() => {
    setConfig({
      breadcrumbs: [
        { label: "Home", href: "/dashboards" },
        { label: "/", href: "" },
        { label: "Admissions", href: "" },
        { label: "/", href: "" },
        { label: "Admission" },
      ],
      searchPlaceholder: "Search Admission...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Admission Information",
        description: "Manage Admission and view their details.",
        headers: [
          { label: "Total Admission", key: "one" },
          { label: "University Upload", key: "two" },
          { label: "Received PRN", key: "three" },
          { label: "Timestamp", key: "four" },
          { label: "Action", key: "action" },
        ],
        actions: [
          { label: "Edit", value: "edit" },
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

  const handleAddProduct = () => {
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    console.log("Export clicked");
  };

  const handleFilterChange = (filterValue: string) => {
    console.log(`Filter changed: ${filterValue}`);
  };

  const handleProductAction = async (action: string, product: Admission) => {
    if (action === "edit") {
      setSelectedAdmissionId(product.id);
      setIsEditDialogOpen(true);
    } else if (action === "delete") {
      try {
        const response = await axios.delete(`/api/admissions/${product.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          await fetchData(searchQuery, paginationState.currentPage);
        }
      } catch (err) {
        console.error("Error deleting admission:", err);
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    await fetchData(query, 1);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  const mappedTableData = data.map((item) => ({
    id: item.id,
    one: item.total_valuation || "Unknown",
    two: item.university_upload || "NA",
    three: item.received_prn || "NA",
    four: item.created_at ? formatDateTime(item.created_at) : "NA",
    delete: "/admissions/" + item.id,
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
      <AddAdmissionDialog
        isOpen={isDialogOpen}
        onOpen={setIsDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
      />
      <EditAdmissionDialog
        isOpen={isEditDialogOpen}
        onOpen={setIsEditDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
        admissionId={selectedAdmissionId}
      />
    </div>
  );
}
