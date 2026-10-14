const priceFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

function formatPrice(price) {
  return priceFormatter.format(price);
}

export default formatPrice;
