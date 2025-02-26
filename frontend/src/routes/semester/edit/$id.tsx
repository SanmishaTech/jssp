import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/semester/Edittestcard";
export const Route = createFileRoute("/semester/edit/$id")({
  component: Edititem,
});
