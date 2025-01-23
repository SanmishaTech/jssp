// components/AddItem.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import axios from "axios";

interface AddItemProps {
  onAdd: (item: {
    id: string;
    name: string;
    unit: string;
    fieldType: string;
  }) => void;
}

const AddItem: React.FC<AddItemProps> = ({
  onAdd,
  typeofschema,
  editid,
  setToggleedit,
  toggleedit,
  editfetch,
}) => {
  const user = localStorage.getItem("user");
  const User = JSON.parse(user);
  const [SelectedValue, setSelectedValue] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [handleopen, setHandleopen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [description, setdescription] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetcheditdetails = async () => {
      const response = await axios.get(`/api/${editfetch}`).then((res) => {
        console.log(res.data);
      });
      setFormData(response.data);
    };
    fetcheditdetails();
  }, []);
  const handleAdd = async () => {
    // const service = services.find((s) => s.name === SelectedValue);
    await axios.put(`/api/${editid}`, formData).then(() => {
      window.location.reload();
    });
    setName("");
    setDate(null);
    // Reset form fields
    setHandleopen(false);
  };

  function capitalizeText(text) {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // dynamically set key-value pairs
    }));
  };
  const addFields = (typeofschema) => {
    const allFieldstorender = [];
    Object.entries(typeofschema).map(([key, value]) => {
      console.log(key, value);

      if (value === "String") {
        allFieldstorender.push(
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              {capitalizeText(key)}
            </Label>
            <Input
              id="name"
              name={key}
              onChange={handleChange}
              placeholder="Enter name"
              value={formData[key]}
              className="col-span-3"
            />
          </div>
        );
      }
    });
    return [...allFieldstorender];
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-start">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription>
            Enter the details of the Components you want to edit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-red-500">{error}</p>}
          {addFields(typeofschema)}
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Namea
            </Label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              value={name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Unit
            </Label>
            <Input
              id="name"
              onChange={(e) => setdescription(e.target.value)}
              placeholder="Enter description"
              value={description}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div> */}
        </div>

        <DialogFooter>
          <Button onClick={handleAdd} type="button">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItem;
