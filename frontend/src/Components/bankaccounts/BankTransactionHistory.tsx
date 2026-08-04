import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Spinner,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
} from "@heroui/react";
import { Calendar, ChevronDown, Filter } from "lucide-react";
import { formattedDate } from "../../utils";

interface BankTransactionHistoryProps {
  bankAccountId: number | string;
  bankAccountName: string;
}

interface Transaction {
  id: number;
  bank_id: number;
  amount: string;
  description: string;
  type: "credit" | "debit";
  balance_after: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  payment_method?: string;
  payer_name?: string;
  reference_number?: string;
  bank_account_name?: string;
}

export default function BankTransactionHistory({
  bankAccountId,
  bankAccountName,
}: BankTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  const sortedTransactions = useMemo(() => {
    const txns = [...transactions];
    txns.sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key];
      let bVal: any = (b as any)[sortConfig.key];
      if (sortConfig.key === 'amount' || sortConfig.key === 'balance_after') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      if (sortConfig.key === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return txns;
  }, [transactions, sortConfig]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/api/banks/transactions/account/${bankAccountId}?page=${page}`;

      if (typeFilter !== "all") {
        url += `&type=${typeFilter}`;
      }

      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      const token = localStorage.getItem("token");
      console.log("Fetching transactions from URL:", url);
      
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", data);

      if (data.status) {
        setTransactions(data.data.transactions || []);
        setTotalPages(data.data.pagination.last_page || 1);
        
        if (data.data.transactions.length === 0) {
          setError("No transactions found for this bank account. Try adding a transaction first.");
        } else {
          setError(null);
        }
      } else {
        setError("Failed to fetch transactions: " + (data.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Transaction fetch error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      
      if (error.response && error.response.status === 401) {
        setError("Session expired. Please login again.");
      } else if (error.response && error.response.data && error.response.data.message) {
        setError("Error: " + error.response.data.message);
      } else {
        setError("Error fetching transaction history. Please check if this bank account has any transactions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bankAccountId) {
      fetchTransactions();
    }
  }, [bankAccountId, page, typeFilter, dateFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setPage(1); // Reset to first page when filter changes
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setDateFilter("");
    setPage(1);
  };

  const renderTransactionType = (type: string) => {
    return (
      <Chip
        className={cn(
          "capitalize",
          type === "credit"
            ? "bg-success/20 text-success"
            : "bg-danger/20 text-danger"
        )}
        size="sm"
      >
        {type}
      </Chip>
    );
  };

  // Calculate transaction totals
  const calculateTotals = () => {
    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'credit') {
        totalCredit += amount;
      } else {
        totalDebit += amount;
      }
    });

    return {
      totalCredit,
      totalDebit,
      netAmount: totalCredit - totalDebit
    };
  };

  const { totalCredit, totalDebit, netAmount } = calculateTotals();

  return (
    <div className="@container/banktx min-w-0 w-full">
      <div className="mb-4 flex min-w-0 flex-col gap-3 py-4 @[640px]/banktx:flex-row @[640px]/banktx:items-center @[640px]/banktx:justify-between">
        <h3 className="text-lg font-semibold shrink-0">Transaction History for {bankAccountName}</h3>
        <div className="flex min-w-0 flex-col gap-2 @[640px]/banktx:flex-row @[640px]/banktx:flex-wrap @[640px]/banktx:items-center">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                className="flex h-9.5 w-full items-center gap-1 @[640px]/banktx:mt-1 @[640px]/banktx:w-auto"
                endContent={<ChevronDown size={16} />}
              >
                <Filter size={16} />
                {typeFilter === "all"
                  ? "All Types"
                  : typeFilter === "credit"
                    ? "Credits"
                    : "Debits"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Transaction Type Filter">
              <DropdownItem
                key="all"
                onClick={() => handleTypeFilterChange("all")}
              >
                All Types
              </DropdownItem>
              <DropdownItem
                key="credit"
                onClick={() => handleTypeFilterChange("credit")}
              >
                Credits Only
              </DropdownItem>
              <DropdownItem
                key="debit"
                onClick={() => handleTypeFilterChange("debit")}
              >
                Debits Only
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <div className="flex min-w-0 w-full items-center @[640px]/banktx:w-auto">
            <Input
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              placeholder="Filter by date"
              className="min-w-0 w-full max-w-full @[640px]/banktx:max-w-[180px]"
              startContent={<Calendar size={16} />}
            />
          </div>

          {(typeFilter !== "all" || dateFilter) && (
            <Button
              className="h-9.5 w-full bg-blue-600 text-white hover:bg-blue-600 @[640px]/banktx:mt-1 @[640px]/banktx:w-auto"
              variant="flat"
              size="sm"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Transaction Summary Card */}
      {transactions.length > 0 && (
        <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 @[480px]/banktx:grid-cols-2">
          <div className="bg-success/10 p-4 rounded-md shadow-sm">
            <h4 className="text-sm font-medium text-success mb-1">Total Credits</h4>
            <p className="text-xl font-bold text-success">₹{totalCredit.toFixed(2)}</p>
          </div>
          <div className="bg-danger/10 p-4 rounded-md shadow-sm">
            <h4 className="text-sm font-medium text-danger mb-1">Total Debits</h4>
            <p className="text-xl font-bold text-danger">₹{totalDebit.toFixed(2)}</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner label="Loading transactions..." />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-danger">{error}</div>
      ) : sortedTransactions.length > 0 ? (
        <>
          <div className="min-w-0 overflow-x-auto">
          <Table aria-label="Transaction History Table" className="min-w-[640px] bg-white rounded-lg shadow-lg shadow-gray-200">
            <TableHeader>
              <TableColumn onClick={() => handleSort('description')} className="cursor-pointer">DESCRIPTION{sortConfig.key==='description'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
              <TableColumn onClick={() => handleSort('type')} className="cursor-pointer">TYPE{sortConfig.key==='type'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
              <TableColumn onClick={() => handleSort('amount')} className="cursor-pointer">AMOUNT{sortConfig.key==='amount'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
              <TableColumn onClick={() => handleSort('balance_after')} className="cursor-pointer">BALANCE{sortConfig.key==='balance_after'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
              <TableColumn onClick={() => handleSort('created_at')} className="cursor-pointer">DATE{sortConfig.key==='created_at'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
              <TableColumn>PAYMENT METHOD</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className={cn(transaction.type === 'credit' ? 'hover:bg-green-100' : 'hover:bg-red-100')}>
                  <TableCell title={transaction.description}>
                    {transaction.description.length > 20 
                      ? `${transaction.description.substring(0, 20)}...` 
                      : transaction.description}
                  </TableCell>
                  <TableCell>
                    {renderTransactionType(transaction.type)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        transaction.type === "credit"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {transaction.type === "credit" ? "+" : "-"}₹
                      {transaction.amount}
                    </span>
                  </TableCell>
                  <TableCell>₹{transaction.balance_after}</TableCell>
                  <TableCell>
                    {formattedDate(transaction.created_at)}
                  </TableCell>
                  <TableCell>{transaction.payment_method ? (transaction.payment_method === 'upi' ? 'UPI' : transaction.payment_method.toUpperCase()) : 'CASH'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="flex justify-center p-4">
            <Pagination
              total={totalPages}
              page={page}
              onChange={handlePageChange}
              showControls
            />
          </div>
        </>
      ) : (
        <div className="p-8 text-center flex flex-col gap-4 items-center">
          <div className="text-5xl text-gray-300 mb-2">📊</div>
          <h3 className="text-xl font-medium text-gray-800">No Transactions Found</h3>
          <p className="text-muted-foreground max-w-md">
            This bank account hasn't been used in any transactions yet. 
            You can use the "Create Test Transaction" button below to add a sample transaction.
          </p>
        </div>
      )}
    </div>
  );
} 