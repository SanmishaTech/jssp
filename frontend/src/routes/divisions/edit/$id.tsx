import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/divisions/Edittestcard";
export const Route = createFileRoute("/divisions/edit/$id")({
  component: Edititem,
});
