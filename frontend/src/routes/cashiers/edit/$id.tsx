import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/cashiers/Edittestcard";
export const Route = createFileRoute("/cashiers/edit/$id")({
  component: Edititem,
});
