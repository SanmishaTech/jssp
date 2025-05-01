import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Textarea,
  Spinner,
} from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";
// We'll create a simple toast placeholder until we install react-hot-toast
const toast = {
  error: (message: string) => console.error(message),
  success: (message: string) => console.log(message)
};

interface BankData {
  id?: number;
  institute_id?: number;
  total_amount: string;
  note: string;
  note_amount: string;
  total_spend?: string;
}

export default function BankForm() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BankData>({
    total_amount: "",
    note: "",
    note_amount: "",
  });

  // Fetch bank data if editing
  useEffect(() => {
    if (id) {
      const fetchBankData = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/banks/${id}`);
          
          if (data.status && data.data.bank) {
            setFormData({
              total_amount: data.data.bank.total_amount || "",
              note: data.data.bank.note || "",
              note_amount: data.data.bank.note_amount || "",
            });
          } else {
            toast.error("Failed to fetch bank data");
          }
        } catch (err) {
          console.error("Error fetching bank data:", err);
          toast.error("An error occurred while fetching data");
        } finally {
          setLoading(false);
        }
      };

      fetchBankData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      toast.error("Please enter a valid amount for total fund");
      return;
    }
    
    setSubmitting(true);
    try {
      let response;
      
      if (id) {
        // Update existing bank
        response = await axios.put(`/api/banks/${id}`, formData);
      } else {
        // Create new bank
        response = await axios.post("/api/banks", formData);
      }
      
      if (response.data.status) {
        toast.success(id ? "Bank updated successfully" : "Bank created successfully");
        
        // Navigate to the bank dashboard
        navigate({ to: "/bank" });
      } else {
        toast.error(response.data.message || "Failed to save bank");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner label="Loading bank data..." />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-xl font-semibold">
          {id ? "Edit Bank" : "Create Bank"}
        </h3>
        <Button
          variant="flat"
          startContent={<ArrowLeft size={16} />}
          onPress={() => navigate({ to: "/bank" })}
        >
          Back
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className="gap-6 flex flex-col">
          <div className="flex flex-col gap-1">
            <Input
               placeholder="Enter the total fund amount"
              type="number"
              min="0.01"
              step="0.01"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400">₹</span>
                </div>
              }
              isRequired
            />
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              label="Note"
              placeholder="Add a note about this bank (optional)"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
               placeholder="Amount associated with the note (optional)"
              type="number"
              min="0"
              step="0.01"
              name="note_amount"
              value={formData.note_amount}
              onChange={handleInputChange}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400">₹</span>
                </div>
              }
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            type="submit"
            isLoading={submitting}
            spinner={<Spinner size="sm" />}
            className="w-full"
            startContent={<Save size={16} />}
          >
            {id ? "Update Bank" : "Create Bank"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 