import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboardreuse";
// import AddItem from "./add/TestCard";
import userAvatar from "@/images/Profile.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
export default function Dashboardholiday() {
  const user = localStorage.getItem("user");
  const User = JSON.parse(user);
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const typeofschema = {};
  useEffect(() => {
    // Fetch data from the API
    axios
      .get(`/api/all_courses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data.Courses);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      });

    // Define the dashboard configuration
    setConfig({
      // breadcrumbs: [
      //   { label: "Dashboard", href: "/dashboard" },
      //   { label: "members" },
      // ],
      searchPlaceholder: "Search Courses...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: "Courses",
        description: "Manage Courses  and view their details.",
        headers: [
          { label: "Medium code", key: "one" },
          // { label: "Institute Id", key: "two" },
          { label: "Medium Title", key: "three" },
          { label: "Organization", key: "four" },
          // { label: "Middle Name", key: "six" },
          // { label: "Last Name", key: "seven" },
          // { label: "Gender", key: "eight" },
          // { label: "Maritial Status", key: "nine" },
          // { label: "Blood Group", key: "ten" },
          // { label: "Data of Birth", key: "eleven" },
          // { label: "Corresponding Address", key: "twelve" },
          // { label: "Permanent Address", key: "thirteen" },
          // { label: "Personal Email", key: "fourteen" },
          // { label: "Mobile", key: "fifteen" },
          // { label: "Alternate Mobile", key: "sixteen" },
          // { label: "Landline", key: "seventeen" },
          { label: "Action", key: "action" },
        ],
        // tabs: [
        //   { label: "All", value: "all" },
        //   { label: "Active", value: "active" },
        //   { label: "Completed", value: "completed" },
        // ],
        // filters: [
        //   { label: "Active", value: "active", checked: true },
        //   { label: "Completed", value: "completed", checked: false },
        // ],
        actions: [
          { label: "Edit", value: "edit" },
          { label: "Delete", value: "delete" },
        ],
        pagination: {
          from: 1,
          to: 10,
          total: 32,
        },
      },
    });
  }, [User?._id]);
  const navigate = useNavigate();

  // Handlers for actions
  const handleAddProduct = () => {
    console.log("Add Registration clicked");
    console.log("AS");
    navigate({ to: "/courses/add" });
    // For example, navigate to an add registration page or open a modal
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    console.log(`Filter changed: ${filterValue}`);
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action, product) => {
    console.log(`Action: ${action} on registration:`, product);
    if (action === "edit") {
      // Navigate to edit page or open edit modal
    } else if (action === "delete") {
      // Implement delete functionality, possibly with confirmation
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format
  const mappedTableData = data?.map((item) => {
    const services = item?.services || [];
    const paidAmount = item?.paymentMode?.paidAmount || 0;

    // Calculate the total service price based on each service's populated details.
    const totalServicePrice = services.reduce((acc, service) => {
      const servicePrice = service?.serviceId?.price || 0; // Replace 'price' with the actual field name for service price
      return acc + servicePrice;
    }, 0);

    // Calculate balance amount based on total service price and paid amount.
    const balanceAmount =
      totalServicePrice - paidAmount > 0 ? totalServicePrice - paidAmount : 0;
    return {
      id: item?.id,
      one: item?.profile_name || "Unknown",
      // two: item?.institute_id || "NA",
      three: item?.email || "NA",
      four: item?.staff_number || "NA",
      five: item?.first_name || "NA",
      // six: item?.middle_name || "NA",
      // seven: item?.last_name || "NA",
      // eight: item?.gender || "NA",
      // nine: item?.maritial_status || "NA",
      // ten: item?.blood_group || "NA",
      // eleven: item?.data_of_birth || "NA",
      // twelve: item?.corresponding_address || "NA",
      // thirteen: item?.permanent_address || "NA",
      // fourteen: item?.personal_email || "NA",
      // fifteen: item?.mobile || "NA",
      // sixteen: item?.alternate_mobile || "NA",
      // seventeen: item?.landline || "NA",
      delete: "/courses/" + item?.id,
    };
  });

  return (
    <div className="p-4">
      <Dashboard
        breadcrumbs={config.breadcrumbs}
        searchPlaceholder={config.searchPlaceholder}
        userAvatar={userAvatar}
        tableColumns={config.tableColumns}
        tableData={mappedTableData}
        onAddProduct={handleAddProduct}
        onExport={handleExport}
        onFilterChange={handleFilterChange}
        onProductAction={handleProductAction}
        // AddItem={AddItem}
        typeofschema={typeofschema}
      />
    </div>
  );
}
