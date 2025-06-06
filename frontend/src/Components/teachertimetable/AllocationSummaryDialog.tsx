import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DialogCloseButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white" variant="outline">Allocation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Allocation Details</DialogTitle>
          <DialogDescription>
            View the subject hours allocation details below.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          Allocation Details  
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
