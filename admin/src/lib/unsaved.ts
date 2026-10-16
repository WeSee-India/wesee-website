import { useEffect } from "react";

/**
 * Unsaved-changes guard. Editors register while they have unsaved edits;
 * in-app links and the browser's close/reload ask before throwing work away.
 */
let dirty = false;

export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    dirty = isDirty;
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      dirty = false;
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isDirty]);
}

/** Call before navigating away inside the app. Returns false if the user wants to stay. */
export function confirmLeave() {
  if (!dirty) return true;
  const ok = window.confirm("You have unsaved changes. Leave without saving?");
  if (ok) dirty = false;
  return ok;
}
