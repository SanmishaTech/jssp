import { createFileRoute } from "@tanstack/react-router";
import Cources from "../../../Components/cource/TestCard";

export const Route = createFileRoute("/cources/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Cources />;
}
