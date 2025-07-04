import { createFileRoute } from "@tanstack/react-router";
import Institutes from "../../Components/letters/letters";

export const Route = createFileRoute("/letters/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Institutes />;
}
