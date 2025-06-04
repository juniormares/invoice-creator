import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("invoice", "routes/invoice/view.tsx"),
    route("invoice/add", "routes/invoice/add.tsx"),
    route("customer", "routes/customer/view.tsx"),
    route("customer/add", "routes/customer/add.tsx"),
    route("product", "routes/product/view.tsx"),
    route("product/add", "routes/product/add.tsx"),
] satisfies RouteConfig;
