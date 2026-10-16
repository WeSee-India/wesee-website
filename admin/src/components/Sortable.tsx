import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Drag-to-reorder list. The grip handle works with a mouse, touch or keyboard
 * (focus it, press Space, move with the arrow keys, Space again to drop).
 */
export function SortableList<T>({ items, getId, onReorder, disabled, children }: { items: T[]; getId(item: T): string; onReorder(next: T[]): void; disabled?: boolean; children(item: T, handle: ReactNode, index: number): ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map(getId);
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    onReorder(arrayMove(items, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy} disabled={disabled}>
        {items.map((item, i) => (
          <Row key={ids[i]} id={ids[i]} disabled={disabled}>
            {(handle) => children(item, handle, i)}
          </Row>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function Row({ id, disabled, children }: { id: string; disabled?: boolean; children(handle: ReactNode): ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const handle = disabled ? null : (
    <button type="button" className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing" aria-label="Drag to reorder" {...attributes} {...listeners}>
      <GripVertical className="size-4" />
    </button>
  );
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: "relative", opacity: isDragging ? 0.85 : 1 }}>
      {children(handle)}
    </div>
  );
}
