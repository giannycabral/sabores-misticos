// Inicialização das variáveis globais
const cart = [];
let cartTotal = 0;
let discountApplied = false;

document.addEventListener('DOMContentLoaded', function() {
  // Adicionar listeners para os botões de adicionar ao carrinho
  const addButtons = document.querySelectorAll('.add-to-order');
  addButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });

  // Adicionar listeners para os botões de filtro
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', filterMenu);
  });

  // Adicionar listener para o campo de pesquisa
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', searchMenu);
  }

  // Adicionar listener para o botão de aplicar cupom
  const couponButton = document.getElementById('apply-coupon');
  if (couponButton) {
    couponButton.addEventListener('click', applyCoupon);
  }

  // Adicionar listener para o método de entrega
  const deliveryMethodSelect = document.getElementById('delivery-method');
  if (deliveryMethodSelect) {
    deliveryMethodSelect.addEventListener('change', updateTotal);
  }

  // Inicializar formulário
  document.getElementById('orderForm').addEventListener('submit', submitOrder);

  // ===== Efeitos visuais mágicos =====
  
  // Adicionar cursor mágico
  const cursor = document.createElement('div');
  cursor.classList.add('magic-cursor');
  document.body.appendChild(cursor);
  
  // Efeito de estrelas cadentes ocasional
  setInterval(function() {
    createShootingStar();
  }, 3000);
  
  // Efeito de cursor mágico
  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Criar pequena partícula ocasionalmente
    if (Math.random() > 0.96) {
      createMagicParticle(e.clientX, e.clientY);
    }
  });
  
  // Efeito de revelação ao scroll
  const magicElements = document.querySelectorAll('.menu-item, .magic-card, .section-divider');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  magicElements.forEach(element => {
    observer.observe(element);
    element.classList.add('magic-reveal');
  });
  
  // Efeito de foco nos campos de formulário
  const formInputs = document.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focus');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focus');
    });
  });
});

// Função para adicionar item ao carrinho
function addToCart(event) {
  const button = event.currentTarget;
  const itemId = button.getAttribute('data-id');
  const itemPrice = parseFloat(button.getAttribute('data-price'));
  const menuItem = button.closest('.menu-item');
  const itemName = menuItem.querySelector('h3').textContent;
  
  // Verificar se o item já está no carrinho
  const existingItemIndex = cart.findIndex(item => item.id === itemId);
  
  if (existingItemIndex !== -1) {
    // Incrementar quantidade
    cart[existingItemIndex].quantity += 1;
  } else {
    // Adicionar novo item
    cart.push({
      id: itemId,
      name: itemName,
      price: itemPrice,
      quantity: 1
    });
  }
  
  // Atualizar carrinho visualmente
  updateCartDisplay();
  
  // Feedback visual para o usuário
  button.textContent = 'Adicionado!';
  setTimeout(() => {
    button.textContent = 'Adicionar ao Pedido';
  }, 1000);
}

// Função para atualizar a exibição do carrinho
function updateCartDisplay() {
  const orderItemsList = document.getElementById('order-items');
  orderItemsList.innerHTML = '';
  
  if (cart.length === 0) {
    orderItemsList.innerHTML = '<li class="empty-cart">Seu carrinho está vazio</li>';
    cartTotal = 0;
  } else {
    cartTotal = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      cartTotal += itemTotal;
      
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <div>
          <span>${item.quantity}x ${item.name}</span>
        </div>
        <div>
          <span>R$ ${itemTotal.toFixed(2)}</span>
          <button class="remove-item" data-id="${item.id}">×</button>
        </div>
      `;
      orderItemsList.appendChild(listItem);
    });
    
    // Adicionar listeners para os botões de remover
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', removeFromCart);
    });
  }
  
  updateTotal();
}

// Função para remover item do carrinho
function removeFromCart(event) {
  const button = event.currentTarget;
  const itemId = button.getAttribute('data-id');
  
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
  }
  
  updateCartDisplay();
}

// Função para atualizar o total
function updateTotal() {
  let total = cartTotal;
  
  // Adicionar valor dos acompanhamentos selecionados
  const sides = document.querySelectorAll('input[name="sides"]:checked');
  sides.forEach(side => {
    if (side.value === 'fries') total += 12;
    else if (side.value === 'bread') total += 8;
    else if (side.value === 'salad') total += 15;
  });
  
  // Adicionar valor das bebidas extras
  const drinks = document.querySelectorAll('input[name="drinks"]:checked');
  drinks.forEach(drink => {
    if (drink.value === 'agua') total += 5;
    else if (drink.value === 'pocao') total += 8;
    else if (drink.value === 'vinho') total += 22;
  });
  
  // Verificar se é entrega e adicionar taxa
  const deliveryMethod = document.getElementById('delivery-method');
  if (deliveryMethod && deliveryMethod.value === 'delivery') {
    total += 10; // Taxa de entrega
  }
  
  // Aplicar desconto se houver
  if (discountApplied) {
    total = total * 0.9; // 10% de desconto
  }
  
  // Atualizar exibição do total
  document.getElementById('cart-total-price').textContent = `R$ ${total.toFixed(2)}`;
  
  return total;
}

// Função para aplicar cupom de desconto
function applyCoupon() {
  const couponInput = document.getElementById('coupon');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  // Lista de cupons válidos
  const validCoupons = ['MISTICO10', 'MAGIA2025', 'LANCAMENTO'];
  
  if (validCoupons.includes(couponCode)) {
    discountApplied = true;
    updateTotal();
    
    // Feedback ao usuário
    couponInput.style.backgroundColor = '#d4edda';
    alert('Cupom aplicado com sucesso! 10% de desconto.');
  } else {
    discountApplied = false;
    couponInput.style.backgroundColor = '#f8d7da';
    alert('Cupom inválido. Tente novamente.');
  }
}

// Função para filtrar o menu por categoria
function filterMenu(event) {
  const filterValue = event.currentTarget.getAttribute('data-filter');
  
  // Atualizar botão ativo
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  // Mostrar/ocultar categorias
  const categories = document.querySelectorAll('.menu-category');
  const categoryTitles = document.querySelectorAll('.category-title');
  
  if (filterValue === 'all') {
    categories.forEach(category => {
      category.style.display = 'grid';
    });
    categoryTitles.forEach(title => {
      title.style.display = 'block';
    });
  } else {
    categories.forEach(category => {
      if (category.id === filterValue) {
        category.style.display = 'grid';
      } else {
        category.style.display = 'none';
      }
    });
    
    categoryTitles.forEach(title => {
      if (title.nextElementSibling && title.nextElementSibling.id === filterValue) {
        title.style.display = 'block';
      } else {
        title.style.display = 'none';
      }
    });
  }
}

// Função para pesquisar no menu
function searchMenu() {
  const searchText = document.getElementById('menu-search').value.toLowerCase();
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    const itemDescription = item.querySelector('.item-description').textContent.toLowerCase();
    
    if (itemName.includes(searchText) || itemDescription.includes(searchText)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  
  // Verificar se há itens visíveis em cada categoria
  const categories = document.querySelectorAll('.menu-category');
  categories.forEach(category => {
    const visibleItems = category.querySelectorAll('.menu-item[style="display: flex;"]');
    const categoryTitle = document.querySelector(`h3.category-title + #${category.id}`).previousElementSibling;
    
    if (visibleItems.length === 0) {
      category.style.display = 'none';
      categoryTitle.style.display = 'none';
    } else {
      category.style.display = 'grid';
      categoryTitle.style.display = 'block';
    }
  });
}

// Função para enviar o pedido
function submitOrder(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    alert('Por favor, adicione pelo menos um item ao seu pedido.');
    return;
  }
  
  // Coletar dados do formulário
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const deliveryAddress = document.getElementById('delivery-address').value;
  const deliveryMethod = document.getElementById('delivery-method').value;
  
  // Calcular total final
  const totalPrice = updateTotal();
  
  // Preparar resumo do pedido
  let orderSummary = `Resumo do Pedido:\n\n`;
  orderSummary += `Cliente: ${customerName}\n`;
  orderSummary += `Telefone: ${customerPhone}\n`;
  orderSummary += `${deliveryMethod === 'delivery' ? 'Endereço de entrega: ' + deliveryAddress : 'Retirada no local'}\n\n`;
  
  orderSummary += `Itens do pedido:\n`;
  cart.forEach(item => {
    orderSummary += `- ${item.quantity}x ${item.name}: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  orderSummary += `\nTotal: R$ ${totalPrice.toFixed(2)}`;
  
  if (discountApplied) {
    orderSummary += ` (com 10% de desconto aplicado)`;
  }
  
  orderSummary += `\n\nObrigado por escolher o Sabores Místicos!`;
  
  alert(orderSummary);
  
  // Limpar formulário e carrinho após pedido
  document.getElementById('orderForm').reset();
  cart.length = 0;
  updateCartDisplay();
}

// ===== Funções para efeitos visuais mágicos =====

// Função para criar estrela cadente
function createShootingStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');
  
  // Posição aleatória no topo da tela
  const startX = Math.random() * window.innerWidth;
  star.style.left = startX + 'px';
  
  document.body.appendChild(star);
  
  // Remover estrela após a animação
  setTimeout(() => {
    star.remove();
  }, 1000);
}

// Função para criar partículas mágicas
function createMagicParticle(x, y) {
  const particle = document.createElement('div');
  particle.classList.add('magic-particle');
  
  // Posição inicial no cursor
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  
  // Tamanho e cor aleatórios
  const size = Math.random() * 10 + 5;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  
  // Definir variáveis CSS personalizadas para movimento aleatório
  const randomX = (Math.random() * 100 - 50) + 'px';
  const randomY = (Math.random() * -100) + 'px';
  particle.style.setProperty('--random-x', randomX);
  particle.style.setProperty('--random-y', randomY);
  
  // Adicionar ao body
  document.body.appendChild(particle);
  
  // Remover partícula após animação
  setTimeout(() => {
    particle.remove();
  }, 1500);
}