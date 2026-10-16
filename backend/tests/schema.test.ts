import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { collections } from "../src/content/collections.js";
import type { FieldDef } from "../src/content/fields.js";
import { sectionTypeByType, systemPages } from "../src/content/pages.js";

/** Prisma column type each field type must be stored in. */
const expected: Record<FieldDef["type"], { type: string; list?: boolean }> = {
  text: { type: "String" },
  markdown: { type: "String" },
  url: { type: "String" },
  image: { type: "String" },
  select: { type: "String" },
  date: { type: "DateTime" },
  number: { type: "Int" },
  boolean: { type: "Boolean" },
  multiselect: { type: "String", list: true },
  stringList: { type: "String", list: true },
  list: { type: "Json" },
  object: { type: "Json" },
  reference: { type: "String" },
};

describe("collection definitions match the database schema", () => {
  for (const def of collections) {
    it(def.key, () => {
      const model = Prisma.dmmf.datamodel.models.find((m) => m.name.toLowerCase() === def.model.toLowerCase());
      expect(model, `Prisma model for ${def.model}`).toBeDefined();
      for (const field of def.fields) {
        const column = model!.fields.find((f) => f.name === field.name);
        expect(column, `${def.model}.${field.name}`).toBeDefined();
        const want = field.type === "reference" && field.valueField === "number" ? { type: "Int" } : expected[field.type];
        expect(column!.type, `${def.model}.${field.name} type`).toBe(want.type);
        expect(column!.isList, `${def.model}.${field.name} list`).toBe(!!want.list);
        if (field.required && !want.list && want.type !== "Json") expect(column!.isRequired, `${def.model}.${field.name} required`).toBe(true);
      }
    });
  }

  it("every system page section has a known type", () => {
    for (const page of systemPages) for (const s of page.sections) expect(sectionTypeByType.has(s.type), s.type).toBe(true);
  });
});
