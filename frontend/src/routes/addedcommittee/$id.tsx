import { createFileRoute } from "@tanstack/react-router";
import Committee from "../../Components/committee/committee";

export const Route = createFileRoute("/addedcommittee/$id")({
  component: Committee,
});


