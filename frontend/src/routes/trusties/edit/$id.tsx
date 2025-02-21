import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/Trusties/Edittestcard";
export const Route = createFileRoute("/trusties/edit/$id")({
  component: Edititem,
});
