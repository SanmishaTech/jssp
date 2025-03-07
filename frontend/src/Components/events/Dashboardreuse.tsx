import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  File,
  PlusCircle,
  Search,
  Pencil,
  Trash,
  MoreHorizontal,
  ListFilter,
  X,
} from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { EmptyStateDefault } from "../emptyState/emptystate";
import AlertDialogbox from "./AlertBox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import Edititem from "./Edittestcard";
import { toast } from "sonner";

export const description =
  "A reusable registrations dashboard with customizable header and table. Configure breadcrumbs, search, tabs, and table data through props.";

export interface DashboardProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  searchPlaceholder?: string;
  userAvatar?: string;
  tableColumns?: {
    title?: string;
    description?: string;
    headers?: Array<{ label: string; key: string; hiddenOn?: string }>;
    tabs?: Array<{ label: string; value: string }>;
    actions?: Array<{ label: string; value: string }>;
    pagination?: {
      from: number;
      to: number;
      total: number;
    };
  };
  typeofschema?: any;
  tableData?: any[];
  onAddProduct?: () => void;
  onExport?: () => void;
  onFilterChange?: (value: string) => void;
  onProductAction?: (action: string, product: any) => void;
  onSearch?: (query: string) => void;
}

export function Dashboard({
  breadcrumbs = [],
  searchPlaceholder = "Search...",
  userAvatar = "/placeholder-user.jpg",
  tableColumns = {},
  typeofschema,
  tableData = [],
  onAddProduct = () => {},
  onExport = () => {},
  onFilterChange = () => {},
  onProductAction = () => {},
  onSearch = () => {},
}: DashboardProps) {
  const navigate = useNavigate();
  const [toggleedit, setToggleedit] = useState(false);
  const [editid, setEditid] = useState({ id: null, url: "" });
  const [toggledelete, setToggledelete] = useState();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [institutes, setInstitutes] = useState(tableData);
  
  // Add new state for the event detail dialog
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventImages, setEventImages] = useState<any[]>([]);

  // Handler for search input change - just updates the input value
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handler for search button click
  const handleSearchClick = () => {
    onSearch(searchInput);
  };

  // Handler for clear search
  const handleClearSearch = () => {
    setSearchInput("");
    onSearch("");
  };

  // Update institutes when tableData prop changes
  useEffect(() => {
    setInstitutes(tableData);
  }, [tableData]);

  // Handler to fetch search results
  const handleSearchResults = async (query: string) => {
    try {
      const { data: res } = await axios.get("/api/events", {
        params: { search: query },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      // Assuming your API returns the list under res.Institutes
      setInstitutes(res.Institutes);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Handler to toggle row expansion with debug logs
  const toggleRow = (rowId: any) => {
    setExpandedRows((prev) => {
      if (prev.includes(rowId)) {
        console.log(`Collapsing row with _id: ${rowId}`);
        return prev.filter((id) => id !== rowId);
      } else {
        console.log(`Expanding row with _id: ${rowId}`);
        return [...prev, rowId];
      }
    });
  };

  const handleEdit = async (id: any, url: string) => {
    console.log("Edit clicked");
    setToggleedit(true);
    setEditid({
      id: id,
      url: url,
    });
    // Implement edit functionality here
  };

  const handleDelete = (id: any) => {
    console.log("Delete clicked");
    // Implement delete functionality here
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out Successfully");
    navigate({ to: "/" });
  };

  // New function to handle row click and open dialog
  const handleRowClick = async (event: any) => {
    try {
      // Fetch detailed event information including images
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/events/${event.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const eventData = response.data.data.Event;
      setSelectedEvent(eventData);
      setEventImages(eventData.images || []);
      setEventDialogOpen(true);
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:px-6">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {breadcrumbs?.map((breadcrumb, index) => (
                <BreadcrumbItem key={index}>
                  {breadcrumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <img
                  src={userAvatar}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Logout
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be logged out from your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </header>

        {/* Main Content */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList className="bg-accent/60">
                {tableColumns?.tabs?.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative w-full flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearchClick();
                          }
                        }}
                        className="w-full rounded-lg bg-background pl-8"
                      />
                      {searchInput && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={handleClearSearch}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSearchClick}
                      className="h-9"
                    >
                      Search
                    </Button>
                  </div>
                </div>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tableColumns?.filters?.map((filter, index) => (
                      <DropdownMenuCheckboxItem
                        key={index}
                        checked={filter.checked}
                        onCheckedChange={() => onFilterChange(filter.value)}
                      >
                        {filter.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu> */}

                <Button size="sm" className="h-8 gap-1" onClick={onAddProduct}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Event
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card className="bg-accent/40">
                <CardHeader>
                  <CardTitle>{tableColumns.title}</CardTitle>
                  <CardDescription>{tableColumns.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tableColumns?.headers?.map((header, index) => (
                          <TableHead
                            key={index}
                            className={header.hiddenOn ? header.hiddenOn : ""}
                          >
                            {header.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {institutes?.map((row) => (
                        <React.Fragment key={row.id}>
                          <TableRow 
                            onClick={(e) => {
                              // Don't open dialog if clicking on dropdown menu
                              if (e.target.closest('[data-dropdown-trigger]')) {
                                return;
                              }
                              handleRowClick(row);
                            }}
                            className="cursor-pointer hover:bg-accent"
                          >
                            {tableColumns?.headers?.map((header, index) => (
                              <TableCell
                                key={index}
                                className={
                                  header.hiddenOn ? header.hiddenOn : ""
                                }
                              >
                                {header.key === "one" ? (
                                  row.one
                                ) : header.key === "action" ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        data-dropdown-trigger
                                      >
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="center"
                                      className="w-full flex-col items-center flex justify-center"
                                    >
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <Button
                                        onClick={() =>
                                          navigate({
                                            to: `/events/edit/${row?.id}`,
                                          })
                                        }
                                        className="w-full"
                                        variant="ghost"
                                      >
                                        Edit
                                      </Button>
                                      <DropdownMenuSeparator />
                                      <AlertDialogbox url={row?.delete} />
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : header.key === "two" ? (
                                  row.two
                                ) : header.key === "three" ? (
                                  row.three
                                ) : header.key === "four" ? (
                                  row.four
                                ) : header.key === "five" ? (
                                  row.five
                                ) : header.key === "six" ? (
                                  `₹${row.six}`
                                ) : (
                                  row[header.key]
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>{tableColumns.pagination.from}</strong>-
                    <strong>{tableColumns.pagination.to}</strong> of{" "}
                    <strong>{tableColumns.pagination.total}</strong>{" "}
                    registrations
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Event details dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View detailed information about this event
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event details section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Venue</h4>
                  <p>{selectedEvent.venue}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Date & Time</h4>
                  <p>{selectedEvent.date} - {selectedEvent.time}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Synopsis</h4>
                <p className="text-sm">{selectedEvent.synopsis}</p>
              </div>
              
              {/* Image gallery section */}
              {eventImages && eventImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Event Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {eventImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <a 
                          href={`${import.meta.env.VITE_API_URL || ''}/storage/${image.image_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL || ''}/storage/${image.image_path}`}
                            alt={`Event image ${index + 1}`}
                            className="h-40 w-full object-cover rounded-md hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              console.error("Image failed to load:", image.image_path);
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                              View Full Size
                            </span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
