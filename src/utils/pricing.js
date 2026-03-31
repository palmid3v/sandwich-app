export const itemCost = (item, isProtein = false, isDouble = false) => {
  let base = 0;

  if (item.grams) {
    base = (item.price / item.grams) * item.usedGrams;
  } else {
    base = (item.price / item.units) * item.used;
  }

  if (isProtein && isDouble) {
    return base * 1.5;
  }

  return base;
};

export const calculateTotalCost = ({
  proteins,
  toppings,
  extras,
  ingredients,
}) => {
  const isDouble = extras.some((e) => e.name === "Doble proteína");

  const proteinsCost = proteins.reduce(
    (sum, p) => sum + itemCost(p, true, isDouble),
    0,
  );

  const defaultToppingsCost = itemCost({
    price: 6490,
    grams: 150,
    usedGrams: 30,
  }); // 🔥 pimentón SIEMPRE

  const toppingsCost =
    defaultToppingsCost + toppings.reduce((sum, t) => sum + itemCost(t), 0);

  const extrasCost = extras.reduce((sum, e) => {
    if (e.name === "Queso extra") {
      return (
        sum +
        itemCost({
          price: e.cost,
          units: e.units,
          used: e.used,
        })
      );
    }
    return sum;
  }, 0);

  return (
    1750 + // pan 15cm fijo
    ingredients.baseCost +
    ingredients.mozzarella +
    proteinsCost +
    toppingsCost +
    extrasCost
  );
};

export const calculateSalePrice = ({ totalCost, extras }) => {
  let extraCharges = 0;

  if (extras.some((e) => e.name === "Queso extra")) {
    extraCharges += 1000;
  }

  if (extras.some((e) => e.name === "Doble proteína")) {
    extraCharges += 2500;
  }

  const rawPrice = totalCost * 1.75 + extraCharges;

  // 🔥 siempre redondea hacia arriba
  const roundedPrice = Math.ceil(rawPrice / 1000) * 1000 - 100;

  return roundedPrice;
};
