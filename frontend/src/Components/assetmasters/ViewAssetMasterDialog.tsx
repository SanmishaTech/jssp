import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import axios from "axios";
import { toast } from "sonner";

interface ViewAssetMasterDialogProps {
  isOpen: boolean;
  onOpen: (value: boolean) => void;
  backdrop?: "blur" | "transparent" | "opaque";
  assetMasterId: string | null;
}

interface AssetMaster {
  id: string;
  asset_type: string;
  service_required: boolean | string | number;
  asset_category_ids: Array<{
    value: string;
    label: string;
  }>;
  unit: string;
  created_at?: string;
  updated_at?: string;
}

export default function ViewAssetMasterDialog({
  isOpen,
  onOpen,
  backdrop = "blur",
  assetMasterId,
}: ViewAssetMasterDialogProps) {
  const [assetMaster, setAssetMaster] = useState<AssetMaster | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const token = localStorage.getItem("token");
  
  const onClose = () => {
    onOpen(false);
    setAssetMaster(null);
  };

  useEffect(() => {
    if (isOpen && assetMasterId) {
      setLoading(true);
      
      axios.get(`/api/assetmasters/${assetMasterId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.data && response.data.data.AssetMaster) {
          const assetMasterData = response.data.data.AssetMaster;
          
          // Format asset_category_ids to ensure it's in the right format
          let categoryIds = assetMasterData.asset_category_ids;
          if (typeof categoryIds === 'string') {
            try {
              categoryIds = JSON.parse(categoryIds);
            } catch (e) {
              categoryIds = [];
            }
          }
          
          // Ensure categories are in the correct format
          if (Array.isArray(categoryIds)) {
            assetMasterData.asset_category_ids = categoryIds.map(item => {
              if (typeof item === 'object' && item !== null) {
                return {
                  value: item.value || item.id?.toString() || '',
                  label: item.label || item.category_name || ''
                };
              } else if (typeof item === 'string' || typeof item === 'number') {
                return {
                  value: item.toString(),
                  label: item.toString()
                };
              }
              return { value: '', label: '' };
            }).filter(item => item.value !== '');
          } else {
            assetMasterData.asset_category_ids = [];
          }
          
          setAssetMaster(assetMasterData);
        } else {
          toast.error("Invalid data format received from server");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching asset master:", error);
        toast.error("Failed to load asset master details");
        setLoading(false);
        onClose();
      });
    }
  }, [isOpen, assetMasterId, token]);

  // Helper to format the display of service required
  const formatServiceRequired = (value: any) => {
    // Convert to string for safer comparison
    const serviceReq = String(value);
    if (serviceReq === '1' || serviceReq === 'true') {
      return "Yes";
    } else if (serviceReq === '0' || serviceReq === 'false') {
      return "No";
    } else {
      return "Unknown";
    }
  };

  // Helper to format date strings
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal size="2xl" backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-between items-center">
              <div>Asset Master Details</div>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assetMaster ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Asset Number</p>
                      <p className="font-semibold">{assetMaster.asset_identity_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Asset Type</p>
                      <p className="font-semibold">{assetMaster.asset_type || "N/A"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Service Required</p>
                      <p className="font-semibold">{formatServiceRequired(assetMaster.service_required)}</p>
                    </div>
                    <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Unit</p>
                    <p className="font-semibold">{assetMaster.unit || "N/A"}</p>
                  </div>
                  </div>
                  

                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Asset Categories</p>
                    {assetMaster.asset_category_ids && assetMaster.asset_category_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {assetMaster.asset_category_ids.map((category, index) => (
                          <div key={index} className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-sm">
                            {category.label}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-semibold">No categories assigned</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p className="text-sm">{formatDate(assetMaster.created_at)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{formatDate(assetMaster.updated_at)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">No data available</div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
