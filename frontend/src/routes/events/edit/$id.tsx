import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/events/Edittestcard";
export const Route = createFileRoute("/events/edit/$id")({
  component: Edititem,
});
