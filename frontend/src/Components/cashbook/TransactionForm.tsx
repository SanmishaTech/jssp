import React, { useState } from "react";
import axios from "axios";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  Spinner,
} from "@heroui/react";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface TransactionFormProps {
  peticashId: string | number;
  currentBalance: string | number;
  onTransactionComplete: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  peticashId,
  currentBalance,
  onTransactionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    note: "",
    type: "debit", // Default is debit (money out)
    date: new Date().toISOString().split("T")[0], // Set today's date as default
    error: "",
  });

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

    // Check for local insufficient balance
    if (formData.type === "debit" && parseFloat(formData.amount) > Number(currentBalance)) {
      toast.error("Insufficient balance for this debit");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.note.trim(), // Changed 'note' to 'description' to match the API
        date: formData.date, // Today's date is already set by default
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
        `/api/peticash/${peticashId}/transaction`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form only if the request was successful
      if (response.status === 200) {
        setFormData({
          amount: "",
          note: "",
          type: "debit",
          date: "",
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
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-semibold">Record New Transaction</h3>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className="gap-6 flex flex-col">
          <div className="w-full">
            <RadioGroup
              orientation="horizontal"
              value={formData.type}
              onValueChange={handleTypeChange}
              className="gap-2"
            >
              <Radio
                value="debit"
                description="Money spent from cashbook"
                size="sm"
              >
                <div className="flex items-center gap-2">
                  <Minus size={16} className="text-danger" />
                  <span>Debit (Money Out)</span>
                </div>
              </Radio>
              <Radio
                value="credit"
                description="Money added to cashbook"
                size="sm"
              >
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-success" />
                  <span>Credit (Money In)</span>
                </div>
              </Radio>
            </RadioGroup>
          </div>

          <div className="w-full">
            <Input
              placeholder="Enter amount"
              type="number"
              min="0.01"
              max="100000"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 pl-1">₹</span>
                </div>
              }
              isRequired
              description="Enter a valid amount (max ₹100,000)"
            />
          </div>

          <div className="w-full">
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
