import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/inventory/Edittestcard";
export const Route = createFileRoute("/inventory/edit/$id")({
  component: Edititem,
});
