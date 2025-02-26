import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/courses/Edittestcard";
export const Route = createFileRoute("/courses/edit/$id")({
  component: Edititem,
});
