export const itemCost = (item, isProtein = false, isDouble = false) => {
  let base = 0;

  if (item.grams) {
    base = (item.price / item.grams) * item.usedGrams;
  } else {
    base = (item.price / item.units) * item.used;
  }

  if (isProtein && isDouble) {
    return base * 2;
  }

  return base;
};

export const calculateTotalCost = ({
  proteins,
  toppings,
  extras,
  ingredients
}) => {

  const isDouble = extras.some(e => e.name === "Doble proteína");

  const proteinsCost = proteins.reduce(
    (sum, p) => sum + itemCost(p, true, isDouble),
    0
  );

  const toppingsCost = toppings.reduce(
    (sum, t) => sum + itemCost(t),
    0
  );

  const extrasCost = extras.reduce(
    (sum, e) => e.price ? sum + itemCost(e) : sum,
    0
  );

  return (
    1750 + // pan 15cm fijo
    ingredients.baseCost +
    ingredients.mozzarella +
    proteinsCost +
    toppingsCost +
    extrasCost
  );
};