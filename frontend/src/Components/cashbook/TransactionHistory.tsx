import React, { useState, useEffect } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/react";
import { Calendar, ChevronDown, Filter, X } from "lucide-react";
import { formattedDate } from "../../utils";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/api/peticash/${peticashId}/transactions?page=${page}`;

      if (typeFilter !== "all") {
        url += `&type=${typeFilter}`;
      }

      if (dateFilter) {
        url += `&date=${dateFilter}`;
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
  }, [peticashId, page, typeFilter, dateFilter]);

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

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
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

          {(typeFilter !== "all" || dateFilter) && (
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
        ) : transactions.length > 0 ? (
          <>
            <Table aria-label="Transaction History Table">
              <TableHeader>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>BALANCE</TableColumn>
                <TableColumn>DATE</TableColumn>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    className="hover:bg-default-100 cursor-pointer"
                    onClick={() => handleRowClick(transaction)}
                  >
                    <TableCell title={transaction.description}>
                      {transaction.description.length > 40 
                        ? `${transaction.description.substring(0, 40)}...` 
                        : transaction.description}
                    </TableCell>
                    <TableCell>
                      {renderTransactionType(transaction.type)}
                    </TableCell>
                    <TableCell>
                      <span className={transaction.type === "credit" ? "text-success" : "text-danger"}>
                        {transaction.type === "credit" ? "+" : "-"}₹
                        {transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell>₹{transaction.balance_after}</TableCell>
                    <TableCell>
                      {formattedDate(transaction.created_at)}
                    </TableCell>
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
      
      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal size="lg" backdrop="blur" isOpen={isModalOpen} onClose={closeModal}>
          <ModalContent className={cn(
            selectedTransaction.type === 'credit'
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg text-white'
              : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg text-white',
            'rounded-lg p-4'
          )}>
            <>
              <ModalHeader className="w-full flex justify-end items-center">
                <span className="text-sm">{formattedDate(selectedTransaction.created_at)}</span>
              </ModalHeader>
              <ModalBody className="text-center">
                <h4 className="text-lg font-semibold mb-4 underline">Transaction Details</h4>
                <div className="flex flex-col gap-3 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-medium">#{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-lg">
                       ₹{parseFloat(selectedTransaction.amount).toFixed(2)}
                    </span>
                  </div>
                 
                  <div className="pt-2 border-t border-white/20 mt-2">
                    <p className="text-center font-medium">Description</p>
                    <p className="text-center">{selectedTransaction.description}</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button 
                  onPress={closeModal}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
}
