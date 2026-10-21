import { useMemo } from "react";
import { useCollection, useLiveServices } from "@/content";
import { categories as bundledCategories, services as bundledServices, toCategories, toServices, type CmsService, type CmsServiceCategory } from "./services";

/** Service categories as currently published in the CMS. */
export function useServiceCategories() {
  const rows = useCollection("serviceCategories") as unknown as CmsServiceCategory[];
  return useMemo(() => (rows.length ? toCategories(rows) : bundledCategories), [rows]);
}

/** The service catalogue as currently published in the CMS (the build-time copy until the live one loads). */
export function useServices() {
  const cats = useServiceCategories();
  const live = useLiveServices();
  return useMemo(() => (live ? toServices(live as CmsService[], cats) : bundledServices), [live, cats]);
}
