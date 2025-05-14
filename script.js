document.getElementById("orderForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const burgerQty = parseInt(document.getElementById("burger-qty").value) || 0;
  const saladQty = parseInt(document.getElementById("salad-qty").value) || 0;
  const brewQty = parseInt(document.getElementById("brew-qty").value) || 0;

  const total =
    burgerQty * 42 +
    saladQty * 33 +
    brewQty * 18;

  alert(`O total do seu pedido é R$ ${total.toFixed(2)}. Obrigado por escolher o Sabores Místicos!`);
});