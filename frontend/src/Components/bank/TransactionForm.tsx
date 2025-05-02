import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@heroui/react";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "sonner";

interface TransactionFormProps {
  peticashId: string | number;
  onTransactionComplete: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  peticashId,
  onTransactionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    note: "",
    type: "debit", // Default is debit (money out)
    date: new Date().toISOString().split("T")[0], // Set today's date as default
    payment_method: "cash",
    payer_name: "",
    reference_number: "",
    error: "",
  });

  const [banks, setBanks] = useState<{ id: number; bank_name: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | number | null>(peticashId ?? null);

  useEffect(() => {
    const fetchBanks = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/bankaccounts", { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status) setBanks(res.data.data.BankAccount);
        else toast.error(res.data.message || "Failed to load banks");
      } catch {
        toast.error("Error loading bank accounts");
      }
    };
    fetchBanks();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      payment_method: "cash",
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: value,
      payer_name: "",
      reference_number: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.type) {
      setFormData((prev) => ({
        ...prev,
        error: "Please select a transaction type",
      }));
      return;
    }

    // Amount validation - must be a positive number and not too large
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormData((prev) => ({
        ...prev,
        error: "Please enter a valid amount greater than zero",
      }));
      return;
    }
    
    // Check if amount is reasonable (not too large)
    if (parseFloat(formData.amount) > 100000) {
      setFormData((prev) => ({
        ...prev,
        error: "Amount seems too large. Please verify.",
      }));
      return;
    }

    // Note validation - mandatory and length check
    if (!formData.note.trim()) {
      setFormData((prev) => ({
        ...prev,
        error: "Please provide a note for this transaction",
      }));
      return;
    }
    
    // Check note length - not empty and not too long
    // Note must have at least 1 character (already checked by trim check above)
    
    if (formData.note.trim().length > 100) {
      setFormData((prev) => ({
        ...prev,
        error: "Note must be less than 100 characters",
      }));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.note.trim(),
        date: formData.date,
        payment_method: formData.payment_method,
        payer_name: formData.payer_name,
        reference_number: formData.reference_number,
        bank_account_id: selectedAccountId,
      };

      const token = localStorage.getItem("token");

      if (!token) {
        setFormData((prev) => ({
          ...prev,
          error: "You are not logged in. Please login to continue.",
        }));
        return;
      }

      // Changed API endpoint to match the route defined in api.php
      const response = await axios.post(
        `/api/banks/${selectedAccountId}/transaction`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // resolve 4xx statuses so global 401 interceptor won’t redirect
          validateStatus: (status) => status < 500,
        }
      );

      // Reset form only if the request was successful
      if (response.status === 200) {
        setFormData({
          amount: "",
          note: "",
          type: "debit",
          date: "",
          payment_method: "cash",
          payer_name: "",
          reference_number: "",
          error: "",
        });

        toast.success(
          `${formData.type === "credit" ? "Credit" : "Debit"} transaction recorded successfully`
        );
        onTransactionComplete();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { status: number; data: { message: string } };
      };
      if (err && err.response) {
        if (err.response.status === 401) {
          // Don't automatically sign out, just show the error
          setFormData((prev) => ({
            ...prev,
            error: "Session expired. Please refresh the page and login again.",
          }));

          // Keep the form data intact so user doesn't lose their input
          toast.error("Authentication error. Please login again.");
        } else if (err.response.status === 422) {
          // Validation errors
          setFormData((prev) => ({
            ...prev,
            error: err.response?.data?.message || "Validation failed",
          }));
        } else if (err.response.status === 400) {
          // Insufficient balance
          setFormData((prev) => ({
            ...prev,
            error:
              err.response?.data?.message ||
              "Insufficient balance for this debit",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            error:
              err.response?.data?.message || "Failed to record transaction",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          error: "Network error, please try again",
        }));
      }
      console.error("Transaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-white shadow-2xl rounded-xl border border-gray-200">
      <CardHeader className="pb-0 flex justify-center">
        <h3 className="text-lg font-semibold">Record New Transaction</h3>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className="gap-6 flex flex-col">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Bank Account</label>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full justify-between">
                  {banks.find(b => b.id === selectedAccountId)?.bank_name || "Select Bank Account"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="min-w-[15rem]">
                {banks.map(bank => (
                  <DropdownItem key={bank.id} onPress={() => setSelectedAccountId(prev => prev === bank.id ? null : bank.id)}>
                    {bank.bank_name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Transaction Type</label>
            <RadioGroup
              value={formData.type}
              onValueChange={handleTypeChange}
              className="flex flex-row items-center gap-9"
            >
              <label className="flex items-center gap-3 text-base text-red-500">
                <RadioGroupItem value="debit" className="h-4 w-4 border-red-500 text-red-500" />
                <span>Debit (Money Out)</span>
              </label>
              <label className="flex items-center gap-3 text-base text-green-500">
                <RadioGroupItem value="credit" className="h-4 w-4 border-green-500 text-green-500" />
                <span>Credit (Money In)</span>
              </label>
            </RadioGroup>
          </div>
          <div className="w-full">
            <label htmlFor="payment_method" className="block text-sm font-medium mb-1">Mode of Payment</label>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full justify-between">
                  {formData.payment_method === "cash" ? "Cash" : formData.payment_method.toUpperCase()}
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="min-w-[27rem]">
                <DropdownItem key="cash" onPress={() => handlePaymentMethodChange("cash")}>Cash</DropdownItem>
                <DropdownItem key="upi" onPress={() => handlePaymentMethodChange("upi")}>UPI</DropdownItem>
                <DropdownItem key="cheque" onPress={() => handlePaymentMethodChange("cheque")}>Cheque</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {formData.payment_method === "cash" ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <Input
                placeholder="Enter amount (₹)"
                type="number"
                min="0.01"
                max="100000"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                isRequired
                description="Enter a valid amount (max ₹100,000)"
              />
              <Input
                placeholder="Enter details about this transaction"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full"
                isRequired
                minLength={1}
                maxLength={100}
                description="Required: 1-100 characters"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full">
              <Input
                placeholder="Payer Full Name"
                name="payer_name"
                value={formData.payer_name}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                placeholder={
                  formData.payment_method === "upi"
                    ? "UPI Transaction Reference (UTR)"
                    : "Cheque Number"
                }
                name="reference_number"
                value={formData.reference_number}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                placeholder="Enter amount (₹)"
                type="number"
                min="0.01"
                max="100000"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                isRequired
                description="Enter a valid amount (max ₹100,000)"
              />
              <Input
                placeholder="Enter details about this transaction"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full"
                isRequired
                minLength={1}
                maxLength={100}
                description="Required: 1-100 characters"
              />
            </div>
          )}

          <div className="w-full">
            <Input
              placeholder="Transaction date"
              type="date"
              name="date"
              value={new Date().toISOString().split("T")[0]}
              className="w-full"
              readOnly
              disabled
            />
          </div>

          {formData.error && (
            <div className="w-full">
              <p className="text-danger">{formData.error}</p>
            </div>
          )}
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            type="submit"
            isLoading={loading}
            spinner={<Spinner size="sm" />}
            className="w-full"
          >
            {formData.type === "debit" ? "Record Expense" : "Add Funds"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TransactionForm;
