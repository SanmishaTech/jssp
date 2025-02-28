import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/committee/Edittestcard";
export const Route = createFileRoute("/committee/edit/$id")({
  component: Edititem,
});
