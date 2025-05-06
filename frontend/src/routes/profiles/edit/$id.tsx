import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/profiles/Edittestcard";
export const Route = createFileRoute("/profiles/edit/$id")({
  component: Edititem,
});
