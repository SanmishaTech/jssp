import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/admissions/Edittestcard";
export const Route = createFileRoute("/admissions/edit/$id")({
  component: Edititem,
});
