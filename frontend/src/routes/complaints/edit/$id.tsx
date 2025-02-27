import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/complaints/Edittestcard";
export const Route = createFileRoute("/complaints/edit/$id")({
  component: Edititem,
});
