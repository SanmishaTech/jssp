import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import AddRoomDialog from "./AddRoomDialog";
import EditRoomDialog from "./EditRoomDialog";

interface Exam {
  id: string;
  exam_title: string;
  from_date: string;
  to_date: string;
  description?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse {
  data: {
    Exams: Exam[];
    Pagination: PaginationData;
  };
}

interface TableData {
  id: string;
  one: string;
  two: string;
  three?: string;
  four?: string;
  delete: string;
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



export default function ExamManagement() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [data, setData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 7,
    total: 0,
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async (query: string = "", page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `/api/exams${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data.data.Exams);

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
        { label: "Exams" },
      ],
      searchPlaceholder: "Search by Exam Title...",
      userAvatar: userAvatar,
      tableColumns: {
        title: "Exams",
        description: "Manage exams and view their details.",
        headers: [
          { label: "Exam Title", key: "one" },
          { label: "From Date", key: "two" },
          { label: "To Date", key: "three" },
          { label: "Description", key: "four" },
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
    setIsAddDialogOpen(true);
  };

  const handleProductAction = async (action: string, product: Exam) => {
    if (action === "edit") {
      setSelectedExamId(product.id);
      setIsEditDialogOpen(true);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this exam?")) {
        try {
          const response = await axios.delete(`/api/exams/${product.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            await fetchData(searchQuery, paginationState.currentPage);
          }
        } catch (err) {
          console.error("Error deleting exam:", err);
        }
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
  if (error) return <div className="p-4 text-red-500">Error loading exams.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  const mappedTableData = data.map((item) => ({
    id: item.id,
    one: item.exam_title,
    two: item.from_date,
    three: item.to_date,
    four: item.description && item.description.length > 10 
    ? item.description.slice(0, 10) + "..." 
    : item.description || "N/A",
    delete: `/api/exams/${item.id}`,
  }));

  const dashboardProps: any = {
    breadcrumbs: config.breadcrumbs,
    searchPlaceholder: config.searchPlaceholder,
    userAvatar: userAvatar,
    tableColumns: config.tableColumns,
    tableData: mappedTableData,
    onAddProduct: handleAddProduct,
    onExport: () => {},
    onFilterChange: () => {},
    onProductAction: handleProductAction,
    onSearch: handleSearch,
    typeofschema: {},
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
      <AddRoomDialog
        isOpen={isAddDialogOpen}
        onOpen={setIsAddDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
      />
      <EditRoomDialog
        isOpen={isEditDialogOpen}
        onOpen={setIsEditDialogOpen}
        backdrop="blur"
        fetchData={() => fetchData(searchQuery, paginationState.currentPage)}
        roomId={selectedExamId}
      />
    </div>
  );
}
