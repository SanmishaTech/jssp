import { createFileRoute } from "@tanstack/react-router";
import Institutes from "../../Components/institutes/Registertable";

export const Route = createFileRoute("/institutes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Institutes />;
}
