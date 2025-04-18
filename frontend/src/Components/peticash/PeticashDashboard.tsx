import React, { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import {
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
} from "lucide-react";
import TransactionHistory from "./TransactionHistory";
import TransactionForm from "./TransactionForm";

interface PeticashData {
  id: number;
  institute_id: number;
  total_amount: string;
  note: string;
  note_amount: string;
  total_spend: string;
  created_at: string;
  updated_at: string;
}

export default function PeticashDashboard() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const [peticash, setPeticash] = useState<PeticashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPeticashData = async () => {
    setLoading(true);
    try {
      // If no ID is provided, fetch the first peticash record
      const url = id ? `/api/peticash/${id}` : "/api/all_peticash";

      const token = localStorage.getItem("token");

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.status) {
        if (id) {
          setPeticash(data.data.Peticash);
        } else if (data.data.Peticash && data.data.Peticash.length > 0) {
          // If no ID was provided, use the first peticash record
          setPeticash(data.data.Peticash[0]);
        } else {
          setError("No petty cash accounts found. Please create one first.");
        }
      } else {
        setError(data.message || "Failed to fetch petty cash data");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Error loading petty cash data");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeticashData();
  }, [id]);

  const handleTransactionComplete = () => {
    // Refresh the data after a transaction is recorded
    fetchPeticashData();
    // Switch to history tab to see the transaction
    setActiveTab("history");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner label="Loading petty cash data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-danger">{error}</p>
        <Button
          color="primary"
          as="a"
          href="/peticash/add"
          startContent={<PlusCircle size={16} />}
        >
          Create Petty Cash Account
        </Button>
      </div>
    );
  }

  if (!peticash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-muted-foreground">No petty cash account found</p>
        <Button
          color="primary"
          as="a"
          href="/peticash/add"
          startContent={<PlusCircle size={16} />}
        >
          Create Petty Cash Account
        </Button>
      </div>
    );
  }

  // Calculate available balance
  const availableBalance =
    parseFloat(peticash.total_amount) - parseFloat(peticash.total_spend || "0");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Fund Card */}
        <Card className="bg-card shadow-sm">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Fund
              </p>
              <h3 className="text-2xl font-bold">₹{peticash.total_amount}</h3>
            </div>
          </CardBody>
        </Card>

        {/* Spent Amount Card */}
        <Card className="bg-card shadow-sm">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-danger/10">
              <ArrowDownCircle className="h-6 w-6 text-danger" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Spent
              </p>
              <h3 className="text-2xl font-bold">
                ₹{peticash.total_spend || "0"}
              </h3>
            </div>
          </CardBody>
        </Card>

        {/* Credit Balance Card */}
        <Card className="bg-card shadow-sm">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-success/10">
              <ArrowUpCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Credited Balance
              </p>
              <h3 className="text-2xl font-bold">
                ₹{peticash.total_amount}
              </h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Note Section */}
      {peticash.note && (
        <Card className="bg-card shadow-sm">
          <CardHeader className="pb-2">
            <h3 className="text-base font-medium">Latest Note</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-sm text-muted-foreground">{peticash.note}</p>
            {peticash.note_amount && (
              <Chip color="warning" variant="flat" className="mt-2">
                ₹{peticash.note_amount}
              </Chip>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        aria-label="Petty Cash Tabs"
        className="w-full flex flex-col items-center"
        classNames={{
          tabList: "justify-center w-full max-w-md mb-[-50px]",
          tab: "px-3 py-1 text-xs",
          tabContent: "w-full"
        }}
        size="sm"
      >
        <Tab key="overview" title="Add Transaction">
          <div className="mt-2">
            <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-3">
              <div>
                <span>Created: </span>
                <span className="font-medium">
                  {new Date(peticash.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>Last Updated: </span>
                <span className="font-medium">
                  {new Date(peticash.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <TransactionForm
                peticashId={peticash.id}
                currentBalance={availableBalance}
                onTransactionComplete={handleTransactionComplete}
              />
            </div>
          </div>
        </Tab>
        <Tab key="history" title="Transaction History">
          <div className="mt-2">
            <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-3">
              <div>
                <span>Created: </span>
                <span className="font-medium">
                  {new Date(peticash.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>Last Updated: </span>
                <span className="font-medium">
                  {new Date(peticash.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <TransactionHistory peticashId={peticash.id} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
