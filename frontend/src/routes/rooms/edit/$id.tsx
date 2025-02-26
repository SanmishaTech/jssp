import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/rooms/Edittestcard";
export const Route = createFileRoute("/rooms/edit/$id")({
  component: Edititem,
});
