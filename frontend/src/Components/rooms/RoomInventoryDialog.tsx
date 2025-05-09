import { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button,
  Tabs,
  Tab,
  Pagination,
} from "@heroui/react";
import { X } from "lucide-react";

interface InventoryItem {
  id: string;
  asset: string;
  quantity: string;
  purchase_date: string;
  purchase_price: string;
  status: string;
  remarks: string;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type TabKey = "active" | "discarded" | "scraped";

interface RoomInventoryDialogProps {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  roomId: string;
  roomName: string;
  backdrop?: "opaque" | "transparent" | "blur";
}

export default function RoomInventoryDialog({
  isOpen,
  onOpen,
  roomId,
  roomName,
  backdrop = "opaque",
}: RoomInventoryDialogProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && roomId) {
      fetchInventoryItems();
    }
  }, [isOpen, roomId, selectedTab, currentPage]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add status filter based on selected tab
      let statusFilter = "";
      if (selectedTab === "active") {
        statusFilter = "&status=active";
      } else if (selectedTab === "discarded") {
        statusFilter = "&status=discarded";
      } else if (selectedTab === "scraped") {
        statusFilter = "&status=scraped";
      }
      
      const apiUrl = `/api/inventory?room=${roomId}${statusFilter}&page=${currentPage}`;
      console.log(`Fetching inventory data from: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const items = response.data.data.Inventory || [];
      const paginationData = response.data.data.Pagination || null;
      console.log(`Received ${items.length} inventory items for ${selectedTab} tab`);
      console.log('Pagination data:', paginationData);
      setInventoryItems(items);
      setPagination(paginationData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError("Failed to load inventory items");
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpen} backdrop={backdrop}>
      <ModalContent className="sm:max-w-[600px]">
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventory for {roomName}</h2>
            <Button isIconOnly size="sm" variant="light" onPress={() => onOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            List of all inventory items assigned to this room
          </p>
        </ModalHeader>
        <ModalBody>
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => {
              console.log(`Changing tab from ${selectedTab} to ${key}`);
              setSelectedTab(key as TabKey);
            }}
            className="mb-4"
            color="default"
            variant="bordered"
          >
            <Tab key="active" title="Active Stock" />
            <Tab key="discarded" title="Discarded" />
            <Tab key="scraped" title="Scraped" />
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-8">Loading inventory items...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : inventoryItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No {selectedTab} inventory items found for this room.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-auto">
              <Table aria-label="Inventory items">
                <TableHeader>
                  <TableColumn className="text-xs font-medium">Asset</TableColumn>
                  <TableColumn className="text-xs font-medium">Quantity</TableColumn>
                  <TableColumn className="text-xs font-medium">Status</TableColumn>
                  <TableColumn className="text-xs font-medium">Purchase Date</TableColumn>
                  <TableColumn className="text-xs font-medium">Price</TableColumn>
                  <TableColumn className="text-xs font-medium">Remarks</TableColumn>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.asset}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.purchase_date}</TableCell>
                      <TableCell>₹{item.purchase_price}</TableCell>
                      <TableCell>{item.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                showControls
                total={pagination.last_page}
                initialPage={currentPage}
                page={currentPage}
                onChange={(page) => {
                  console.log(`Changing page to ${page}`);
                  setCurrentPage(page);
                }}
                classNames={{
                  cursor: "bg-primary text-white",
                }}
              />
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
