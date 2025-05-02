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
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import { Calendar, ChevronDown, Filter } from "lucide-react";
import { formattedDate } from "../../utils";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

interface TransactionHistoryProps {
  peticashId: number | string;
}

interface Transaction {
  id: number;
  peticash_id: number;
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

export default function TransactionHistory({
  peticashId,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [bankAccountFilter, setBankAccountFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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
      let url = `/api/banks/${peticashId}/transactions?page=${page}`;

      if (typeFilter !== "all") {
        url += `&type=${typeFilter}`;
      }

      if (dateFilter) {
        url += `&date=${dateFilter}`;
      }

      if (bankAccountFilter) {
        url += `&bank_account_name=${encodeURIComponent(bankAccountFilter)}`;
      }

      const token = localStorage.getItem("token");
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.status) {
        setTransactions(data.data.transactions);
        setTotalPages(data.data.pagination.last_page);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Error fetching transaction history");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (peticashId) {
      fetchTransactions();
    }
  }, [peticashId, page, typeFilter, dateFilter, bankAccountFilter]);

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

  const handleBankAccountFilterChange = (value: string) => {
    setBankAccountFilter(value);
    setPage(1); // Reset page when filter changes
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setDateFilter("");
    setBankAccountFilter("");
    setPage(1);
  };

  const handleRowClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setIsModalOpen(true);
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

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex justify-between items-center py-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                className="flex items-center gap-1 mt-1 h-9.5"
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

          <div className="flex items-center">
            <Input
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              placeholder="Filter by date"
              className="max-w-[180px]"
              startContent={<Calendar size={16} />}
            />
          </div>

          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Filter by bank name"
              value={bankAccountFilter}
              onChange={(e) => handleBankAccountFilterChange(e.target.value)}
              className="max-w-[180px]"
            />
          </div>

          {(typeFilter !== "all" || dateFilter || bankAccountFilter) && (
            <Button
              className="mt-1 h-9.5 bg-blue-600 text-white hover:bg-blue-600"
              variant="flat"
              size="sm"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner label="Loading transactions..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">{error}</div>
        ) : sortedTransactions.length > 0 ? (
          <>
            <Table aria-label="Transaction History Table" className="bg-white rounded-lg shadow-lg shadow-gray-200">
              <TableHeader>
                <TableColumn onClick={() => handleSort('description')} className="cursor-pointer">DESCRIPTION{sortConfig.key==='description'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
                <TableColumn onClick={() => handleSort('type')} className="cursor-pointer">TYPE{sortConfig.key==='type'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
                <TableColumn onClick={() => handleSort('amount')} className="cursor-pointer">AMOUNT{sortConfig.key==='amount'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
                <TableColumn onClick={() => handleSort('balance_after')} className="cursor-pointer">BALANCE{sortConfig.key==='balance_after'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
                <TableColumn onClick={() => handleSort('created_at')} className="cursor-pointer">DATE{sortConfig.key==='created_at'?(sortConfig.direction==='asc'?' ▲':' ▼'):''}</TableColumn>
                <TableColumn>BANK NAME</TableColumn>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} onClick={() => handleRowClick(transaction)} className={cn('cursor-pointer', transaction.type === 'credit' ? 'hover:bg-green-100' : 'hover:bg-red-100')}>
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
                    <TableCell>{transaction.bank_account_name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <div className="p-8 text-center text-muted-foreground">
            No transactions found. You can add a transaction to get started.
          </div>
        )}
      </CardBody>
      {selectedTransaction && (
        <Modal size="lg" backdrop="blur" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent className={cn(
            selectedTransaction.type === 'credit'
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg text-white'
              : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg text-white',
            'rounded-lg p-4'
          )}>
            {(onClose) => (
              <>
                <ModalHeader className="w-full flex justify-end items-center">
                  <span className="text-sm ">{formattedDate(selectedTransaction.created_at)}</span>
                </ModalHeader>
                <ModalBody className="text-center">
                  <h4 className="text-lg font-semibold mb-4 underline">Transaction Details</h4>
                  <div className="flex flex-col gap-2">
                    <p className="uppercase">
                      {selectedTransaction.type} - {(selectedTransaction.payment_method === 'upi' ? 'UPI' : (selectedTransaction.payment_method ?? 'cash').toUpperCase())}
                    </p>
                    <p><strong>Description:</strong> {selectedTransaction.description}</p>
                    {selectedTransaction.payment_method !== "cash" && (
                      <>
                        <p><strong>Payer:</strong> {selectedTransaction.payer_name}</p>
                        <p><strong>Reference:</strong> {selectedTransaction.reference_number}</p>
                      </>
                    )}
                    <p><strong>Amount:</strong> ₹{selectedTransaction.amount}</p>
                    <p><strong>Balance After:</strong> ₹{selectedTransaction.balance_after}</p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onClose}>Okay</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
}
