import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  File,
  PlusCircle,
  Search,
  Pencil,
  Trash,
  MoreHorizontal,
  ListFilter,
} from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { EmptyStateDefault } from "../emptyState/emptystate";
import AlertDialogbox from "./AlertBox";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
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

export default function Dashboard({
  breadcrumbs = [],
  searchPlaceholder = "Search...",
  userAvatar = "/placeholder-user.jpg",
  tableColumns = {},
  // AddItem,
  typeofschema,
  tableData = [],
  onAddProduct = () => {},
  onExport = () => {},
  onFilterChange = () => {},
  onProductAction = () => {},
}) {
  const navigate = useNavigate();
  const [toggleedit, setToggleedit] = useState(false);
  const [editid, setEditid] = useState();
  const [toggledelete, setToggledelete] = useState();
  // State to manage expanded rows (array of _id)
  const [expandedRows, setExpandedRows] = useState([]);
  const [open, setOpen] = useState(false);

  // Handler to toggle row expansion with debug logs
  const toggleRow = (rowId) => {
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

  const handleEdit = async (id, url) => {
    console.log("Edit clicked");
    setToggleedit(true);
    setEditid({
      id: id,
      url: url,
    });
    // Implement edit functionality here
  };

  const handleDelete = (id) => {
    console.log("Delete clicked");
    // Implement delete functionality here
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out Successfully");
    navigate({ to: "/" });
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

          <DropdownMenu className="justify-items:end">
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
          </DropdownMenu>
        </header>

        {/* {toggleedit && (
          <Edititem
            editid={editid}
            toogleedit={setToggleedit}
            typeofschema={typeofschema}
          />
        )} */}
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
                <div className="relative ml-auto flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  />
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
                    Add Staff
                  </span>
                </Button>
                {/* <AddItem typeofschema={typeofschema} /> */}
              </div>
            </div>
            <TabsContent value="all">
              {console.log(tableData)}

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
                          <>
                            <TableHead
                              key={index}
                              className={header.hiddenOn ? header.hiddenOn : ""}
                            >
                              {header.label}
                            </TableHead>
                          </>
                        ))}
                        {/* <TableHead>Services</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData?.map((row) => (
                        <React.Fragment key={row.id}>
                          <TableRow>
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
                                      {/* <Edititem
                                        editid={row?.edit}
                                        toogleedit={setToggleedit}
                                        typeofschema={typeofschema}
                                        setToggleedit={setToggleedit}
                                        toggleedit={toggleedit}
                                        editfetch={row?.editfetch}
                                      /> */}
                                      {console.log("row", row)}
                                      <Button
                                        onClick={() =>
                                          navigate({
                                            to: `/members/edit/${row?.id}`,
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
                                ) : header.key === "seven" ? (
                                  row.seven
                                ) : header.key === "eight" ? (
                                  row.eight
                                ) : header.key === "nine" ? (
                                  row.nine
                                ) : header.key === "ten" ? (
                                  row.ten
                                ) : header.key === "eleven" ? (
                                  row.eleven
                                ) : header.key === "twelve" ? (
                                  row.twelve
                                ) : header.key === "thirteen" ? (
                                  row.thirteen
                                ) : header.key === "fourteen" ? (
                                  row.fourteen
                                ) : header.key === "fifteen" ? (
                                  row.fifteen
                                ) : header.key === "sixteen" ? (
                                  row.sixteen
                                ) : header.key === "seventeen" ? (
                                  row.seventeen
                                ) : (
                                  row[header.key]
                                )}
                              </TableCell>
                            ))}

                            {/* <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(row._id)}
                                aria-expanded={expandedRows.includes(row._id)}
                                aria-controls={`services-${row._id}`}
                              >
                                {expandedRows.includes(row._id)
                                  ? "Hide"
                                  : "Show"}{" "}
                                Services
                              </Button>
                            </TableCell> */}
                          </TableRow>
                          {expandedRows.includes(row.id) && (
                            <></>
                            // <TableRow>
                            //   <TableCell
                            //     colSpan={tableColumns.headers.length + 1}
                            //   >
                            //     <div className="p-4 bg-muted rounded-md">
                            //       <h4 className="text-sm font-semibold mb-2">
                            //         Services
                            //       </h4>
                            //       {/* Nested Services Table */}
                            //       <Table className="mb-4">
                            //         <TableHeader>
                            //           <TableRow>
                            //             <TableHead>Service Name</TableHead>
                            //             <TableHead>Description</TableHead>
                            //             <TableHead>Price ($)</TableHead>
                            //             <TableHead>Urgent</TableHead>
                            //           </TableRow>
                            //         </TableHeader>
                            //         <TableBody>
                            //           {row?.services?.map((service) => (
                            //             <TableRow key={service._id}>
                            //               <TableCell>{service.name}</TableCell>
                            //               <TableCell>
                            //                 {service.description}
                            //               </TableCell>
                            //               <TableCell>
                            //                 &#x20b9;{service.price}
                            //               </TableCell>
                            //               <TableCell>
                            //                 {service.urgent}
                            //               </TableCell>
                            //             </TableRow>
                            //           ))}
                            //         </TableBody>
                            //         <TableFooter>
                            //           <TableRow>
                            //             <TableCell colSpan={2}>
                            //               <strong>Total</strong>
                            //             </TableCell>
                            //             <TableCell>
                            //               &#x20b9;{" "}
                            //               {row?.services
                            //                 ?.reduce(
                            //                   (total, service) =>
                            //                     total + service.price,
                            //                   0
                            //                 )
                            //                 .toFixed(2)}
                            //             </TableCell>
                            //           </TableRow>
                            //         </TableFooter>
                            //       </Table>
                            //     </div>
                            //   </TableCell>
                            // </TableRow>
                          )}
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
            {/* Add more TabsContent as needed */}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
