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
  fetchData,
}) {
  const onClose = () => {
    onOpen();
  };
  const token = localStorage.getItem("token");
   const queryClient = useQueryClient();
  const DeleteApi = async () => {
     await axios.delete(`/api/courses/${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // window.location.reload();
    onClose();
    fetchData();
  };

  useEffect(() => {
   }, [isOpen]);

  return (
    <>
      <Modal
        size="lg"
        backdrop={backdrop}
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        scrollBehavior="inside"
        classNames={{
          wrapper: "items-center justify-center p-4",
          base: "mx-auto my-auto max-h-[90dvh]",
          footer: "flex flex-col-reverse gap-2 sm:flex-row sm:gap-2",
        }}
      >
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
                <Button color="danger" variant="light" onPress={onClose} className="w-full sm:w-auto">
                  Close
                </Button>
                <Button color="primary" onPress={DeleteApi} className="w-full sm:w-auto">
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
