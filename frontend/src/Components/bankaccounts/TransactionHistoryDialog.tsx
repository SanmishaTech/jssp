import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import BankTransactionHistory from "./BankTransactionHistory";
import axios from "axios";
import { toast } from "sonner";

interface TransactionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: {
    id: string;
    name: string;
    bank_name: string;
  } | null;
}

export default function TransactionHistoryDialog({
  isOpen,
  onClose,
  bankAccount,
}: TransactionHistoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!bankAccount) return null;
  
  console.log("Opening transaction history for bank account:", bankAccount);

  const createTestTransaction = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // First, get a bank ID to associate with this transaction
      const banksResponse = await axios.get('/api/all_banks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!banksResponse.data.status || !banksResponse.data.data.banks || banksResponse.data.data.banks.length === 0) {
        toast.error("No banks found to create a test transaction");
        return;
      }
      
      const bank = banksResponse.data.data.banks[0];
      
      // Create a test transaction
      const response = await axios.post(`/api/banks/${bank.id}/transaction`, {
        amount: 100,
        description: `Test transaction for bank account ${bankAccount.bank_name}`,
        type: 'credit',
        payment_method: 'cash',
        bank_account_id: bankAccount.id
      }, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (response.data.status) {
        toast.success("Test transaction created successfully!");
        // Trigger a refresh of the transaction history
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to create test transaction: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Error creating test transaction:", error);
      toast.error(error.response?.data?.message || "Failed to create test transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-[900px] mx-auto"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h2>Bank Account Transactions</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-800">
                  {bankAccount.bank_name}
                </span>
              </div>
            </ModalHeader>
            <ModalBody>
              <BankTransactionHistory 
                key={refreshKey}
                bankAccountId={bankAccount.id} 
                bankAccountName={bankAccount.name || bankAccount.bank_name} 
              />
              <div className="text-xs text-black mt-2">
                Note: If no transactions are shown, this bank account has not been used in any transactions yet.
                You can add transactions to this bank account from the Bank transactions page.
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end">
               
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 