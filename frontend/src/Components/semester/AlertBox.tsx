import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// import { Button } from "@/components/ui/button";

export default function AlertDialogbox({
  url,
  backdrop = "blur",
  isOpen,
  onOpen,
}) {
  const onClose = () => {
    onOpen();
  };

  console.log("This is Delete url", url);
  const queryClient = useQueryClient();
  const DeleteApi = async () => {
    console.log("This is Delete url", `/api/${url}`);
    await axios.delete(`/api/patientmaster/delete/${url}`);
    // window.location.reload();
    onClose();
    queryClient.invalidateQueries({ queryKey: ["patientmaster"] });
  };

  useEffect(() => {
    console.log("Fetching idasdsadasdasd", isOpen);
  }, [isOpen]);

  return (
    <>
      <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Item
              </ModalHeader>
              <ModalBody>
                This action cannot be undone. This will permanently delete the
                selected item.
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={DeleteApi}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
