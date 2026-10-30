
import { useEffect, useMemo, useState } from "react";
import {
  generateInstructions,
  type IngredientItem
} from "./recipeInstructionUtils";

type Ingredient = IngredientItem;

type Props = {
  ingredients: string;
  instructions: string;
  recipeId?: number;
};

function parseIngredients(text: string): Ingredient[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, id) => {
      const match = line.match(
        /^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s+(.+)$/
      );

      return {
        id,
        quantity: match ? match[1] : "",
        description: match ? match[2] : line
      };
    });
}

function formatIngredient(item: Ingredient): string {
  return [item.quantity, item.description]
    .map(value => value.trim())
    .filter(Boolean)
    .join(" ");
}

export default function CustomizeIngredients({
  ingredients,
  instructions,
  recipeId
}: Props) {
  const originalItems = useMemo(
    () => parseIngredients(ingredients),
    [ingredients]
  );

  const [items, setItems] = useState<Ingredient[]>(() =>
    parseIngredients(ingredients)
  );

  const [editing, setEditing] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [removingItem, setRemovingItem] =
    useState<Ingredient | null>(null);
  const [replacement, setReplacement] = useState("");
  const [customInstructions, setCustomInstructions] =
    useState<string | null>(null);

  const generatedInstructions = useMemo(
    () =>
      generateInstructions(
        instructions,
        originalItems,
        items
      ),
    [instructions, originalItems, items]
  );

  const displayedInstructions =
    customInstructions ?? generatedInstructions;

  const changes = useMemo(() => {
    const notes: string[] = [];

    for (const original of originalItems) {
      const current = items.find(
        item => item.id === original.id
      );

      if (!current) {
        notes.push(
          `Removed ${formatIngredient(original)} completely.`
        );
      } else if (
        formatIngredient(current) !==
        formatIngredient(original)
      ) {
        notes.push(
          `Changed ${formatIngredient(original)} to ` +
          `${formatIngredient(current)}.`
        );
      }
    }

    for (const item of items) {
      if (!originalItems.some(x => x.id === item.id)) {
        notes.push(
          `Added ${formatIngredient(item)}.`
        );
      }
    }

    return notes;
  }, [items, originalItems]);

  useEffect(() => {
    setItems(parseIngredients(ingredients));
    setEditing(false);
    setNewIngredient("");
    setRemovingItem(null);
    setReplacement("");
    setCustomInstructions(null);
  }, [ingredients, instructions, recipeId]);

  function update(
    id: number,
    field: "quantity" | "description",
    value: string
  ) {
    setItems(previous =>
      previous.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );

    setCustomInstructions(null);
  }

  function remove(id: number) {
    const selected = items.find(item => item.id === id);

    if (selected) {
      setRemovingItem(selected);
      setReplacement("");
    }
  }

  function closeDialog() {
    setRemovingItem(null);
    setReplacement("");
  }

  function confirmRemove() {
    if (!removingItem) return;

    setItems(previous =>
      previous.filter(
        item => item.id !== removingItem.id
      )
    );

    setCustomInstructions(null);
    closeDialog();
  }

  function confirmReplace() {
    if (!removingItem || !replacement.trim()) return;

    const parsed = parseIngredients(
      replacement.trim()
    )[0];

    setItems(previous =>
      previous.map(item =>
        item.id === removingItem.id
          ? {
              ...item,
              quantity:
                parsed.quantity || item.quantity,
              description: parsed.description
            }
          : item
      )
    );

    setCustomInstructions(null);
    closeDialog();
  }

  function addIngredient() {
    const value = newIngredient.trim();
    if (!value) return;

    const parsed = parseIngredients(value)[0];

    setItems(previous => [
      ...previous,
      {
        ...parsed,
        id: Math.max(
          -1,
          ...previous.map(item => item.id)
        ) + 1
      }
    ]);

    setNewIngredient("");
    setCustomInstructions(null);
  }

  function resetRecipe() {
    setItems(parseIngredients(ingredients));
    setCustomInstructions(null);
    setNewIngredient("");
    closeDialog();
  }

  return (
    <div className="custom-recipe">
      <div className="custom-ingredients-heading">
        <h3>Ingredients</h3>

        <button
          type="button"
          className="customize-toggle"
          onClick={() => setEditing(!editing)}
        >
          {editing
            ? "✓ Done"
            : "✎ Customize Recipe"}
        </button>
      </div>

      {editing && (
        <p className="customize-hint">
          Change quantities, replace ingredients,
          or remove them completely.
        </p>
      )}

      <div className="customize-list">
        {items.map(item => (
          <div
            className="customize-row"
            key={item.id}
          >
            {editing ? (
              <>
                <input
                  className="customize-quantity"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e =>
                    update(
                      item.id,
                      "quantity",
                      e.target.value
                    )
                  }
                />

                <input
                  className="customize-description"
                  value={item.description}
                  onChange={e =>
                    update(
                      item.id,
                      "description",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="customize-remove"
                  onClick={() => remove(item.id)}
                  title="Replace or remove ingredient"
                >
                  ×
                </button>
              </>
            ) : (
              <span>
                {formatIngredient(item)}
              </span>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="customize-actions">
          <div className="customize-add">
            <input
              placeholder="e.g. 1 cup kidney beans"
              value={newIngredient}
              onChange={e =>
                setNewIngredient(e.target.value)
              }
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIngredient();
                }
              }}
            />

            <button
              type="button"
              onClick={addIngredient}
              disabled={!newIngredient.trim()}
            >
              + Add
            </button>
          </div>

          <button
            type="button"
            className="customize-reset"
            onClick={resetRecipe}
          >
            ↺ Reset Original Recipe
          </button>
        </div>
      )}

      <div className="custom-instructions-section">
        <h3>Instructions</h3>

        {changes.length > 0 && (
          <div className="customization-notes">
            <strong>
              ✓ Your Recipe Adjustments
            </strong>

            <ul>
              {changes.map((note, index) => (
                <li key={index}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {editing ? (
          <>
            <p className="customize-hint">
              Instructions are updated automatically.
              Review and edit any steps that need
              different cooking times or methods.
            </p>

            <textarea
              className="custom-instructions-editor"
              rows={12}
              value={displayedInstructions}
              onChange={e =>
                setCustomInstructions(e.target.value)
              }
            />
          </>
        ) : (
          <div
            className="recipe-detail-text"
            style={{ whiteSpace: "pre-line" }}
          >
            {displayedInstructions}
          </div>
        )}
      </div>

      {removingItem && (
        <div
          className="ingredient-dialog-overlay"
          onClick={closeDialog}
        >
          <div
            className="ingredient-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Customize ingredient"
            onClick={e => e.stopPropagation()}
          >
            <h3>Customize Ingredient</h3>

            <p>
              What would you like to do with{" "}
              <strong>
                {formatIngredient(removingItem)}
              </strong>?
            </p>

            <label htmlFor="replacement-ingredient">
              Replacement ingredient
            </label>

            <input
              id="replacement-ingredient"
              type="text"
              placeholder="e.g. 1 cup kidney beans"
              value={replacement}
              onChange={e =>
                setReplacement(e.target.value)
              }
            />

            <button
              type="button"
              onClick={confirmReplace}
              disabled={!replacement.trim()}
            >
              Replace Ingredient
            </button>

            <button
              type="button"
              onClick={confirmRemove}
            >
              Remove Completely
            </button>

            <button
              type="button"
              onClick={closeDialog}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
