import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/vendors/Edittestcard";
export const Route = createFileRoute("/vendors/edit/$id")({
  component: Edititem,
});
