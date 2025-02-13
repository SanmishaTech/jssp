import { createFileRoute } from "@tanstack/react-router";
import Registertable from "../../Components/cource/Registertable";

export const Route = createFileRoute("/cources/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Registertable />;
}
