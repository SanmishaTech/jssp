import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/members/Edittestcard";
export const Route = createFileRoute("/members/edit/$id")({
  component: Edititem,
});
