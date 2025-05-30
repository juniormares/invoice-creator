import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("invoice.add", "routes/invoice.add.tsx"),
] satisfies RouteConfig;
