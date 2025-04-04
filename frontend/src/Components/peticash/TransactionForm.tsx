import React, { useState } from "react";
import axios from "axios";
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
  onTransactionComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    note: "",
    type: "debit", // Default is debit (money out)
    date: "",
    error: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormData((prev) => ({
        ...prev,
        error: "Please enter a valid amount",
      }));
      return;
    }
    
    if (formData.type === "debit" && !formData.note.trim()) {
      setFormData((prev) => ({
        ...prev,
        error: "Note is required for debit transactions",
      }));
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.note.trim(), // Changed 'note' to 'description' to match the API
        date: formData.date || new Date().toISOString().split('T')[0]
      };
      
      const token = localStorage.getItem("token");
      // Changed API endpoint to match the route defined in api.php
      await axios.post(`/api/peticash/${peticashId}/transaction`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset form
      setFormData({
        amount: "",
        note: "",
        type: "debit",
        date: "",
        error: "",
      });
      
      toast.success(`${formData.type === 'credit' ? 'Credit' : 'Debit'} transaction recorded successfully`);
      onTransactionComplete();
    } catch (error: unknown) {
      const err = error as { response?: { status: number, data: { message: string } } };
      if (err && err.response) {
        if (err.response.status === 401) {
          setFormData((prev) => ({
            ...prev,
            error: "Session expired. Please login again.",
          }));
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
            error: err.response?.data?.message || "Insufficient balance for this debit",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            error: err.response?.data?.message || "Failed to record transaction",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          error: "Network error, please try again",
        }));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-semibold">Record New Transaction</h3>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className="gap-4 flex flex-col">
          <div className="flex flex-col gap-1">
            <RadioGroup
              label="Transaction Type"
              orientation="horizontal"
              value={formData.type}
              onValueChange={handleTypeChange}
            >
              <Radio
                value="debit"
                description="Money spent from petty cash"
              >
                <div className="flex items-center gap-2">
                  <Minus size={18} className="text-danger" />
                  <span>Debit (Money Out)</span>
                </div>
              </Radio>
              <Radio
                value="credit"
                description="Money added to petty cash"
              >
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-success" />
                  <span>Credit (Money In)</span>
                </div>
              </Radio>
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1">
            <Input
               placeholder="Enter amount"
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              startContent={
                <div className="pointer-events-none flex items-center pr-2">
                  <span className="text-default-400">₹</span>
                </div>
              }
              className="pl-6"
              isRequired
            />
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              label="Additional Notes"
              placeholder="Any additional details about this transaction (optional)"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
               placeholder="Transaction date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="pl-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-danger">{formData.error}</p>
          </div>
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