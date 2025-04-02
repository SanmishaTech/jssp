import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/students/Edittestcard";
export const Route = createFileRoute("/students/edit/$id")({
  component: Edititem,
});
