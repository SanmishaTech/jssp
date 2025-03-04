import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/meetings/Edittestcard";
export const Route = createFileRoute("/meetings/edit/$id")({
  component: Edititem,
});
