import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Route, Switch } from "wouter";
import { Layout } from "@/components/Layout";
import { EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import type { Permission } from "@/lib/types";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";

// The dashboard (the first screen after sign-in) ships with the app; every other screen is its own chunk.
// The rest are fetched in the background after sign-in (see preloadScreens): React holds back a
// screen that suspends for ~300ms before revealing it, so screens should never suspend on navigation.
const screens = {
  Activity: () => import("@/pages/Activity"),
  CollectionEdit: () => import("@/pages/CollectionEdit"),
  CollectionList: () => import("@/pages/CollectionList"),
  Media: () => import("@/pages/Media"),
  PageEdit: () => import("@/pages/PageEdit"),
  PagesList: () => import("@/pages/PagesList"),
  Profile: () => import("@/pages/Profile"),
  Settings: () => import("@/pages/Settings"),
  Users: () => import("@/pages/Users"),
};
const Activity = lazy(screens.Activity);
const CollectionEdit = lazy(screens.CollectionEdit);
const CollectionList = lazy(screens.CollectionList);
const Media = lazy(screens.Media);
const PageEdit = lazy(screens.PageEdit);
const PagesList = lazy(screens.PagesList);
const Profile = lazy(screens.Profile);
const Settings = lazy(screens.Settings);
const Users = lazy(screens.Users);

function preloadScreens() {
  const load = () => Object.values(screens).forEach((load) => void load().catch(() => undefined));
  if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 2000 });
  else setTimeout(load, 200);
}

/** Hides screens the role can't use. The API enforces the same rules regardless. */
function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <EmptyState title="You don't have access to this page">Ask an owner if you need it.</EmptyState>;
}

export default function App() {
  const { user, loading } = useAuth();
  const signedIn = !!user;
  useEffect(() => {
    if (signedIn) preloadScreens();
  }, [signedIn]);
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Starting" />
      </div>
    );
  if (!user) return <Login />;

  return (
    <Layout>
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/pages" component={PagesList} />
          <Route path="/pages/:id">{(p) => <PageEdit id={p.id} />}</Route>
          <Route path="/content/:key">{(p) => <CollectionList key={p.key} collectionKey={p.key} />}</Route>
          <Route path="/content/:key/:id">{(p) => <CollectionEdit key={`${p.key}/${p.id}`} collectionKey={p.key} id={p.id} />}</Route>
          <Route path="/media" component={Media} />
          <Route path="/settings">{() => <Settings />}</Route>
          <Route path="/settings/:key">{(p) => <Settings settingKey={p.key} />}</Route>
          <Route path="/users">
            <Guard permission="users.manage">
              <Users />
            </Guard>
          </Route>
          <Route path="/activity">
            <Guard permission="audit.view">
              <Activity />
            </Guard>
          </Route>
          <Route path="/profile" component={Profile} />
          <Route>
            <EmptyState title="Page not found">That admin page doesn't exist.</EmptyState>
          </Route>
        </Switch>
      </Suspense>
    </Layout>
  );
}
