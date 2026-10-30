
export type IngredientItem = {
  id: number;
  quantity: string;
  description: string;
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanName(description: string): string {
  return description
    .toLowerCase()
    .split(",")[0]
    .replace(/\([^)]*\)/g, "")
    .replace(/\b\d+(?:\.\d+)?(?:\/\d+)?\b/g, "")
    .replace(
      /\b(cups?|tbsp|tsp|tablespoons?|teaspoons?|grams?|kg|g|ml|litres?|pieces?|large|small|medium)\b/g,
      ""
    )
    .replace(
      /\b(fresh|dried|dry|canned|cooked|boiled|soaked|drained|chopped|finely|sliced|minced|grated|cooled|optional|to taste)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function ingredientAliases(description: string): string[] {
  const name = cleanName(description);
  if (!name) return [];

  const aliases = new Set<string>([name]);
  const words = name.split(" ");

  // garlic cloves -> garlic
  if (
    words.length > 1 &&
    /^(cloves?|pieces?)$/.test(words[words.length - 1])
  ) {
    aliases.add(words.slice(0, -1).join(" "));
  }

  // green beans -> beans
  if (
    words.length > 1 &&
    /^(green|red|black|white)$/.test(words[0])
  ) {
    aliases.add(words.slice(1).join(" "));
  }

  // spring onions -> spring onion
  if (name.endsWith("s") && !name.endsWith("ss")) {
    aliases.add(name.slice(0, -1));
  }

  return [...aliases]
    .filter(value => value.length > 2)
    .sort((a, b) => b.length - a.length);
}

function replaceReference(
  text: string,
  oldDescription: string,
  newDescription: string
): string {
  const newName = cleanName(newDescription);
  if (!newName) return text;

  let result = text;

  for (const alias of ingredientAliases(oldDescription)) {
    const pattern = new RegExp(
      `\\b${escapeRegex(alias)}\\b`,
      "gi"
    );

    result = result.replace(pattern, newName);
  }

  return result;
}

function cleanSentence(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/,\s+(and|or)\b/gi, " $1")
    .replace(/,\s*(and|or)\s+/gi, " $1 ")
    .replace(/\b(and|or|of|with)\s*\./gi, ".")
    .replace(/\s+\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function omitReference(
  text: string,
  description: string
): string {
  let result = text;

  for (const alias of ingredientAliases(description)) {
    const term = `\\b${escapeRegex(alias)}\\b`;

    // Remove preparation-part references.
    result = result.replace(
      new RegExp(
        `(?:the\\s+)?(?:white|green)\\s+parts\\s+of\\s+${term}`,
        "gi"
      ),
      ""
    );

    result = result.replace(
      new RegExp(
        `${term}\\s+(?:greens|tops|leaves)\\b`,
        "gi"
      ),
      ""
    );

    // Remove from ingredient lists.
    result = result.replace(
      new RegExp(`${term}\\s*,\\s*`, "gi"),
      ""
    );

    result = result.replace(
      new RegExp(`\\s+and\\s+${term}`, "gi"),
      ""
    );

    result = result.replace(
      new RegExp(`${term}\\s+and\\s+`, "gi"),
      ""
    );

    result = result.replace(
      new RegExp(term, "gi"),
      ""
    );
  }

  return cleanSentence(result);
}

function dependsOnRemovedIngredient(
  sentence: string,
  description: string
): boolean {
  const aliases = ingredientAliases(description);

  const mentioned = aliases.some(alias =>
    new RegExp(
      `\\b${escapeRegex(alias)}\\b`,
      "i"
    ).test(sentence)
  );

  if (!mentioned) return false;

  // Preparation steps specifically dependent on
  // the removed ingredient.
  return /\b(soak|pressure.cook|boil|mash|mashing|peel|marinate|knead|garnish)\b/i
    .test(sentence);
}

function removeFromStep(
  step: string,
  removedDescriptions: string[]
): string {
  let content = step.replace(
    /^Step\s*\d+\s*:\s*/i,
    ""
  );

  // Process sentences individually.
  let sentences: string[] =
  content.match(/[^.!?]+[.!?]*/g) ?? [];

  for (const description of removedDescriptions) {
    sentences = sentences
      .filter(sentence =>
        !dependsOnRemovedIngredient(
          sentence,
          description
        )
      )
      .map(sentence =>
        omitReference(sentence, description)
      );
  }

  content = sentences
    .map(sentence => cleanSentence(sentence))
    .filter(Boolean)
    .join(" ")
    .trim();

  // Remove actions that have no ingredient left.
  content = content
    .replace(
      /\b(Add|Mix|Sprinkle|Garnish|Top with)\s*\./gi,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();

  if (
    !content ||
    /^(add|mix|sprinkle|garnish|top with)\.?$/i.test(
      content
    )
  ) {
    return "";
  }

  return content.charAt(0).toUpperCase() +
    content.slice(1);
}

export function generateInstructions(
  originalInstructions: string,
  originalIngredients: IngredientItem[],
  customizedIngredients: IngredientItem[]
): string {
  const removed = originalIngredients.filter(
    original =>
      !customizedIngredients.some(
        item => item.id === original.id
      )
  );

  const changed = originalIngredients
    .map(original => ({
      original,
      current: customizedIngredients.find(
        item => item.id === original.id
      )
    }))
    .filter(
      pair =>
        pair.current &&
        cleanName(pair.original.description) !==
          cleanName(pair.current.description)
    );

  const updatedSteps: string[] = [];

  for (const line of originalInstructions.split(/\r?\n/)) {
    let step = line.trim();
    if (!step) continue;

    for (const pair of changed) {
      if (pair.current) {
        step = replaceReference(
          step,
          pair.original.description,
          pair.current.description
        );
      }
    }

    step = removeFromStep(
      step,
      removed.map(item => item.description)
    );

    if (step) {
      updatedSteps.push(step);
    }
  }

  return updatedSteps
    .map(
      (step, index) =>
        `Step ${index + 1}: ${step}`
    )
    .join("\n");
}
