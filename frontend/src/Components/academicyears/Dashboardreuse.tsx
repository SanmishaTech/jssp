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
  ChevronDown,
  Ellipsis,
  Download,
  Filter,
  X,
} from "lucide-react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import AlertDialogbox from "./AlertBox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import MultiSelectorComponent from "./profile";

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
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router"; // import Edititem from "./Edititem";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  MessageSquare,
  Mail,
  Image,
  Files,
  FileQuestion,
  FileSymlink,
  Settings,
} from "lucide-react";

import {
  Dropdown,
  DropdownSection,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
  Avatar,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

export const description =
  "A reusable registrations dashboard with customizable header and table. Configure breadcrumbs, search, tabs, and table data through props.";

interface TableData {
  id: string;
  one: string;
  two: string;
  three: string;
  delete: string;
}

interface DashboardProps {
  breadcrumbs: Array<{ label: string; href?: string }>;
  searchPlaceholder: string;
  userAvatar: string;
  tableColumns: {
    title: string;
    description: string;
    headers: Array<{ label: string; key: string }>;
    actions: Array<{ label: string; value: string }>;
    pagination: {
      currentPage: number;
      lastPage: number;
      perPage: number;
      total: number;
      from: number;
      to: number;
    };
  };
  tableData: TableData[];
  onAddProduct: () => void;
  onExport: () => void;
  onFilterChange: (filterValue: string) => void;
  onProductAction: (action: string, product: any) => Promise<void>;
  onSearch: (query: string) => void;
  typeofschema: Record<string, string>;
  currentPage: number;
  totalPages: number;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  setCurrentPage: (page: number) => void;
  handlePageChange: (page: number) => void;
  fetchData: (query?: string, page?: number) => Promise<void>;
}

export default function Dashboard({
  breadcrumbs = [],
  searchPlaceholder = "Search...",
  fetchData,
  userAvatar = "/placeholder-user.jpg",
  tableColumns = {},
  tableData = [],
  onAddProduct = () => {},
  onExport = () => {},
  onFilterChange = () => {},
  onProductAction = () => {},
  onSearch = () => {},
  typeofschema = {},
  currentPage = 1,
  totalPages = 1,
  handleNextPage = () => {},
  handlePrevPage = () => {},
  setCurrentPage = () => {},
  handlePageChange = () => {},
}: DashboardProps) {
  const navigate = useNavigate();
  const [toggleedit, setToggleedit] = useState(false);
  const [editid, setEditid] = useState<string>();
  const [toggledelete, setToggledelete] = useState<boolean>(false);
  const [searchTerm, setsearchTerm] = useState("");
  const [handleopen, setHandleopen] = useState(false);
  const [toggleopen, setToggleopen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  // State to manage expanded rows (array of id)
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Handler to toggle row expansion with debug logs
  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      if (prev.includes(rowId)) {
         return prev.filter((id) => id !== rowId);
      } else {
         return [...prev, rowId];
      }
    });
  };

  const handleEdit = async (id: string, url: string) => {
     setToggleedit(true);
    setEditid(id);
  };

  const handleDelete = (id: string) => {
   };

  const handleSearchClick = () => {
    onSearch(localSearchTerm);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleSearchClick();
    }
  };

  return (
    <div className="@container/academicyears min-w-0 w-full flex-col bg-background/30">
      <div className="flex flex-col gap-4 px-4 py-4 @[700px]/academicyears:gap-6 @[700px]/academicyears:px-6 @[700px]/academicyears:py-6">
        {/* Header */}
        <header className="flex min-w-0 flex-col gap-3">
          <Breadcrumb className="min-w-0 overflow-x-auto">
            <BreadcrumbList className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {breadcrumbs?.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          to={breadcrumb.href}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {breadcrumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-muted-foreground">
                        {breadcrumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid min-w-0 flex-1 items-start gap-4 @[700px]/academicyears:gap-6">
          <Tabs defaultValue="all" className="min-w-0 w-full">
            <div className="mb-4 flex min-w-0 flex-col gap-4 @[900px]/academicyears:mb-6 @[900px]/academicyears:flex-row @[900px]/academicyears:items-start @[900px]/academicyears:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight @[700px]/academicyears:text-2xl">
                  {tableColumns.title || "subjects Dashboard"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground @[700px]/academicyears:text-base">
                  {tableColumns.description ||
                    "Manage Subjects data efficiently"}
                </p>
              </div>

              <div className="flex min-w-0 w-full flex-col gap-2 @[640px]/academicyears:flex-row @[640px]/academicyears:flex-wrap @[640px]/academicyears:items-center @[900px]/academicyears:w-auto @[900px]/academicyears:justify-end">
                <div className="relative min-w-0 w-full flex-1 @[640px]/academicyears:min-w-[14rem] @[900px]/academicyears:w-auto @[900px]/academicyears:max-w-[18rem]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="w-full min-w-0 rounded-md border-muted bg-background pl-10 focus-visible:ring-primary"
                    value={localSearchTerm}
                    onChange={handleSearchInput}
                    onKeyDown={handleKeyDown}
                  />
                  {localSearchTerm && (
                    <button
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setLocalSearchTerm("");
                        onSearch("");
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <Button
                  color="primary"
                  variant="solid"
                  className="h-10 w-full shrink-0 @[640px]/academicyears:w-auto"
                  onPress={handleSearchClick}
                >
                  Search
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  startContent={<PlusCircle size={16} />}
                  onPress={onAddProduct}
                  className="h-10 w-full shrink-0 @[640px]/academicyears:w-auto"
                >
                  Add New Academic Year
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="mt-0">
              {/* <Edititem
                isOpen={isOpen}
                onClose={onClose}
                onOpen={onOpen}
                onOpenChange={onOpenChange}
                editid={editid}
                typeofschema={typeofschema}
              /> */}

              <AlertDialogbox
                backdrop="blur"
                url={editid}
                isOpen={toggleopen}
                fetchData={fetchData}
                onOpen={setToggleopen}
              />

              {/* <Additem
                typeofschema={typeofschema}
                add={tableData?.add}
                onAddProduct={onAddProduct}
                setHandleopen={setHandleopen}
                handleopen={handleopen}
              /> */}

              {!tableData || tableData.length <= 0 ? (
                <EmptyState
                  className="min-h-[320px] min-w-0 w-full items-center justify-center rounded-lg border border-border bg-accent/20 shadow-sm @[700px]/academicyears:min-h-[500px]"
                  title="No subjects Available"
                  description="You can add a new subjects to get started."
                  icons={[FileText, FileSymlink, Files]}
                  typeofschema={typeofschema}
                />
              ) : (
                <Card className="min-w-0 overflow-hidden border border-border bg-card shadow-sm">
                  <CardContent className="min-w-0 overflow-x-auto p-0">
                    <Table className="min-w-[640px]">
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          {tableColumns?.headers?.map((header, index) => (
                            <TableHead
                              key={index}
                              className={cn(
                                "whitespace-nowrap py-3 text-xs font-medium text-muted-foreground",
                                header.hiddenOn
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {header.label}
                                {header.sortable && (
                                  <ChevronDown
                                    size={14}
                                    className="text-muted-foreground/70"
                                  />
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData?.map((row) => (
                          <React.Fragment key={row.id}>
                            <TableRow>
                              {tableColumns?.headers?.map((header, index) => (
                                <TableCell
                                  key={index}
                                  className={cn(
                                    "max-w-[220px] truncate",
                                    header.hiddenOn ? header.hiddenOn : ""
                                  )}
                                >
                                  {header.key === "one" ? (
                                    row.one
                                  ) : header.key === "action" ? (
                                    <Dropdown backdrop="blur" showArrow>
                                      <DropdownTrigger>
                                        <button
                                          className="rounded-full p-1 transition-opacity hover:bg-muted"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Ellipsis className="h-5 w-5 text-muted-foreground" />
                                        </button>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                        aria-label="Actions"
                                        variant="faded"
                                        className="min-w-[14rem] max-w-[18rem]"
                                        itemClasses={{
                                          base: "gap-3",
                                          title: "whitespace-normal",
                                          description: "whitespace-normal break-words text-wrap",
                                        }}
                                      >
                                        <DropdownSection title="Actions">
                                          <DropdownItem
                                            key="edit"
                                            description="Edit subjects details"
                                            onPress={() =>
                                              onProductAction("edit", row)
                                            }
                                            startContent={
                                              <Pencil className={iconClasses} />
                                            }
                                          >
                                            Edit
                                          </DropdownItem>
                                        </DropdownSection>
                                        {/* <DropdownSection title="Danger zone">
                                          <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            description="This action cannot be undone"
                                            onPress={() => {
                                              setEditid(row.id);
                                              setToggleopen(true);
                                            }}
                                            startContent={
                                              <Trash
                                                className={cn(
                                                  iconClasses,
                                                  "text-danger"
                                                )}
                                              />
                                            }
                                          >
                                            Delete
                                          </DropdownItem>
                                        </DropdownSection> */}
                                      </DropdownMenu>
                                    </Dropdown>
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

                  <CardFooter className="flex flex-col gap-3 border-t p-4 @[480px]/academicyears:flex-row @[480px]/academicyears:items-center @[480px]/academicyears:justify-between">
                    <div className="text-xs text-muted-foreground">
                      {tableData && (
                        <>
                          Showing page <strong>{currentPage}</strong> of{" "}
                          <strong>{totalPages}</strong>
                        </>
                      )}
                    </div>

                    <div className="flex w-full items-center gap-2 @[480px]/academicyears:w-auto">
                      <Button
                        onPress={() => handlePrevPage()}
                        size="sm"
                        variant="flat"
                        isDisabled={currentPage <= 1}
                        className="flex-1 @[480px]/academicyears:flex-none"
                      >
                        Previous
                      </Button>
                      <Button
                        onPress={() => handleNextPage()}
                        size="sm"
                        variant="flat"
                        isDisabled={currentPage >= totalPages}
                        className="flex-1 @[480px]/academicyears:flex-none"
                      >
                        Next
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            {/* Add more TabsContent as needed */}
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Icon components
export const EditDocumentIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M15.48 3H7.52C4.07 3 2 5.06 2 8.52v7.95C2 19.94 4.07 22 7.52 22h7.95c3.46 0 5.52-2.06 5.52-5.52V8.52C21 5.06 18.93 3 15.48 3Z"
      fill="currentColor"
      opacity={0.4}
    />
    <path
      d="M21.02 2.98c-1.79-1.8-3.54-1.84-5.38 0L14.51 4.1c-.1.1-.13.24-.09.37.7 2.45 2.66 4.41 5.11 5.11.03.01.08.01.11.01.1 0 .2-.04.27-.11l1.11-1.12c.91-.91 1.36-1.78 1.36-2.67 0-.9-.45-1.79-1.36-2.71ZM17.86 10.42c-.27-.13-.53-.26-.77-.41-.2-.12-.4-.25-.59-.39-.16-.1-.34-.25-.52-.4-.02-.01-.08-.06-.16-.14-.31-.25-.64-.59-.95-.96-.02-.02-.08-.08-.13-.17-.1-.11-.25-.3-.38-.51-.11-.14-.24-.34-.36-.55-.15-.25-.28-.5-.4-.76-.13-.28-.23-.54-.32-.79L7.9 10.72c-.35.35-.69 1.01-.76 1.5l-.43 2.98c-.09.63.08 1.22.47 1.61.33.33.78.5 1.28.5.11 0 .22-.01.33-.02l2.97-.42c.49-.07 1.15-.4 1.5-.76l5.38-5.38c-.25-.08-.5-.19-.78-.31Z"
      fill="currentColor"
    />
  </svg>
);

export const DeleteDocumentIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
      fill="currentColor"
    />
    <path
      d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
      fill="currentColor"
      opacity={0.399}
    />
    <path
      clipRule="evenodd"
      d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
