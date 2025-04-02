import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/subjects/Edittestcard";
export const Route = createFileRoute("/subjects/edit/$id")({
  component: Edititem,
});
