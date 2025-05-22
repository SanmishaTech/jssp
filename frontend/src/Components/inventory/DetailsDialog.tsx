import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";

interface DetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: any; // The inventory item to display
}

export default function DetailsDialog({ isOpen, onOpenChange, item }: DetailsDialogProps) {
  if (!item) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex-grow text-center relative left-[33px]">Inventory Details</h3>
            <p className="text-sm font-medium">{formatDate(item.six) || "N/A"}</p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Viewing complete information about this inventory item
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 text-center">
          <p className="text-sm font-medium text-xl underline  mb-1">{item.one || "N/A"}-{item.four || "N/A"}</p>

            <div className="p-3 bg-muted/20 rounded-md">
               <p className="text-sm font-medium  mb-1">Room: {item.two || "N/A"}</p>
               <p className="text-sm font-medium  mb-1">Quantity: {item.five || "N/A"}</p>
               <p className="text-sm font-medium  mb-1">Status: {item.three || "N/A"}</p>
               {item.three?.toLowerCase() === "scraped" && (
                 <p className="text-sm font-medium text-red-500 mb-1">Scraped Amount: {item.scraped_amount ? item.scraped_amount : "Not specified"}</p>
               )}
               <div className="mt-3 text-left">
                 <div className="border rounded-md p-3 bg-muted/10 shadow-sm">
                   <p className="text-sm font-semibold mb-1">Remarks:</p>
                   <p className="text-sm whitespace-pre-wrap">{item.seven || "No remarks provided"}</p>
                 </div>
               </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            color="primary" 
            onPress={() => {
              window.location.href = `/inventory/edit/${item.id}`;
            }}
          >
            Edit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
