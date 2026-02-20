import { createBrowserRouter } from "react-router";
import { 
  HomePage, 
  WorkspacePage, 
  TalentMarketPage
} from "./pages";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "workspace/:projectId?", Component: WorkspacePage },
      { path: "talent-market", Component: TalentMarketPage },
    ],
  },
]);