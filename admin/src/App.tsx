import type { ReactNode } from "react";
import { Route, Switch } from "wouter";
import { Layout } from "@/components/Layout";
import { EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import type { Permission } from "@/lib/types";
import Activity from "@/pages/Activity";
import CollectionEdit from "@/pages/CollectionEdit";
import CollectionList from "@/pages/CollectionList";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Media from "@/pages/Media";
import PageEdit from "@/pages/PageEdit";
import PagesList from "@/pages/PagesList";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";

/** Hides screens the role can't use. The API enforces the same rules regardless. */
function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <EmptyState title="You don't have access to this page">Ask an owner if you need it.</EmptyState>;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Starting" />;
  if (!user) return <Login />;

  return (
    <Layout>
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
    </Layout>
  );
}
