import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import AddBankAccountDialog from "./AddBankAccountDialog";
import EditBankAccountDialog from "./EditAdmissionDialog";
import TransactionHistoryDialog from "./TransactionHistoryDialog";

interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string;
  address: string;
  email: string;
  phone: string;
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
    BankAccount: BankAccount[];
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
  onProductAction: (action: string, product: BankAccount) => Promise<void>;
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
  onRowClick?: (product: BankAccount) => void;
}

// Update AddBankAccountDialog props
interface AddBankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Update EditBankAccountDialog props
interface EditBankAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id: string;
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
  const [data, setData] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const typeofschema = {
    name: "String",
    bank_name: "String",
    account_number: "String",
    ifsc_code: "String",
    branch: "String",
    address: "String",
    email: "String",
    phone: "String",
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
        `/api/bankaccounts${query ? `?search=${query}&` : "?"}page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Bank accounts API response:", response.data);
      
      if (response.data.data && response.data.data.BankAccount) {
        setData(response.data.data.BankAccount);
        
        // Debug log each item
        response.data.data.BankAccount.forEach((account, index) => {
          console.log(`Bank account ${index}:`, account);
        });
        
        const pagination = response.data.data.Pagination;
        setPaginationState({
          currentPage: Number(pagination.current_page),
          totalPages: Number(pagination.last_page),
          perPage: Number(pagination.per_page),
          total: Number(pagination.total),
        });
      } else {
        console.error("Invalid API response format:", response.data);
        setError(new Error("Invalid API response format"));
      }
      
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
        { label: "Bank", href: "" },
        { label: "/", href: "" },
        { label: "Bank Account" },
      ],
      searchPlaceholder: "Search Bank Account...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Bank Account",
        description: "Manage bank accounts and view their details.",
        headers: [
           { label: "Bank Name", key: "bank_name" },
          { label: "Account Number", key: "account_number" },
          { label: "IFSC Code", key: "ifsc_code" },
          { label: "Branch", key: "branch" },
         
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

  const handleProductAction = async (action: string, product: BankAccount) => {
    if (action === "edit") {
      setSelectedBankAccountId(product.id);
      setIsEditDialogOpen(true);
    } else if (action === "delete") {
      try {
        const response = await axios.delete(`/api/bankaccounts/${product.id}`, {
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

  // Add a new function to handle row click for transactions
  const handleRowClick = (bankAccount: BankAccount) => {
    console.log("Clicked on bank account:", bankAccount);
    setSelectedBankAccount(bankAccount);
    setIsTransactionDialogOpen(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  const renderTableData = () => {
    console.log("Data being rendered:", data);
    return data.map((item) => {
      console.log("Processing item:", item);
      return {
        id: item.id,
        bank_name: item.bank_name,
        account_number: item.account_number,
        ifsc_code: item.ifsc_code,
        branch: item.branch,
        // For backward compatibility with the existing code
        one: item.bank_name,
        two: item.account_number, 
        three: item.ifsc_code,
        four: item.branch,
        delete: item.id,
        rawData: item // Store the original object for row click handling
      };
    });
  };

  const dashboardProps: DashboardProps = {
    breadcrumbs: config.breadcrumbs,
    searchPlaceholder: config.searchPlaceholder,
    userAvatar: userAvatar,
    tableColumns: config.tableColumns,
    tableData: renderTableData(),
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
    onRowClick: handleRowClick, // Add row click handler
  };

  return (
    <>
      {config && (
        <Dashboard
          breadcrumbs={config.breadcrumbs}
          searchPlaceholder={config.searchPlaceholder}
          userAvatar={userAvatar}
          tableColumns={config.tableColumns}
          tableData={renderTableData()}
          onAddProduct={handleAddProduct}
          onExport={handleExport}
          onFilterChange={handleFilterChange}
          onProductAction={handleProductAction}
          onSearch={handleSearch}
          typeofschema={typeofschema}
          currentPage={paginationState.currentPage}
          totalPages={paginationState.totalPages}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
          setCurrentPage={(page) => handlePageChange(page)}
          handlePageChange={handlePageChange}
          fetchData={fetchData}
          searchQuery={searchQuery}
          onRowClick={handleRowClick} // Add row click handler
        />
      )}
      
      {isDialogOpen && (
        <AddBankAccountDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchData(searchQuery, paginationState.currentPage);
          }}
        />
      )}

      {isEditDialogOpen && selectedBankAccountId && (
        <EditBankAccountDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            fetchData(searchQuery, paginationState.currentPage);
          }}
          id={selectedBankAccountId}
        />
      )}

      <TransactionHistoryDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => setIsTransactionDialogOpen(false)}
        bankAccount={selectedBankAccount}
      />
    </>
  );
}
