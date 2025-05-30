import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NavBar } from "~/components/ui/navBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "invoice Creator" },
    { name: "description", content: "Welcome to invoice Creator!"},
  ];
}

export default function Home() {
  return (
    <NavBar></NavBar>
  )
}
