const API_URL = './database.json';
const PHONE_NUMBER = '393911388220'; // Change with actual number

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  setupWhatsAppForm();
  setupBurgerMenu();
  setupStickyNavbar();
});

function setupStickyNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

async function fetchData() {
  const menuContainer = document.getElementById('menu-container');
  const alertBox = document.getElementById('alert-box');
  const alertText = document.getElementById('alert-text');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Errore nel recupero dati');
    
    const data = await response.json();
    
    // Handle Alert
    if (data.alert && data.alert.trim() !== '' && alertText && alertBox) {
      alertText.textContent = data.alert;
      // alertBox.classList.remove('hidden'); // TEMPORARILY DISABLED
    }

    // Handle Menu
    if (menuContainer) {
      renderMenu(data.menu, menuContainer);
    }
    
  } catch (error) {
    console.error(error);
    if (menuContainer) {
      menuContainer.innerHTML = '<p class="text-center" style="color:red;">Impossibile caricare il menù al momento. Riprova più tardi.</p>';
    }
  }
}

function renderMenu(menuData, container) {
  container.innerHTML = '';
  
  for (const [category, items] of Object.entries(menuData)) {
    if (!items || items.length === 0) continue;
    
    const visibleItems = items.filter(item => item.visible);
    if (visibleItems.length === 0) continue;

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'menu-category';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = category;
    categoryDiv.appendChild(categoryTitle);

    visibleItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'menu-item';
      
      const itemInfo = document.createElement('div');
      itemInfo.className = 'menu-item-info';
      
      const itemName = document.createElement('h4');
      itemName.textContent = item.name;
      
      const itemIngredients = document.createElement('p');
      itemIngredients.textContent = item.ingredients;
      
      itemInfo.appendChild(itemName);
      itemInfo.appendChild(itemIngredients);
      
      const itemPrice = document.createElement('div');
      itemPrice.className = 'menu-item-price';
      itemPrice.textContent = `€ ${item.price.toFixed(2)}`;
      
      itemDiv.appendChild(itemInfo);
      itemDiv.appendChild(itemPrice);
      
      categoryDiv.appendChild(itemDiv);
    });
    
    container.appendChild(categoryDiv);
  }
}

function setupWhatsAppForm() {
  const form = document.getElementById('wa-form');
  if (!form) return;
  
  // Set min date to today
  const dateInput = document.getElementById('wa-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Counter logic
  const btnMinus = document.getElementById('btn-minus');
  const btnPlus = document.getElementById('btn-plus');
  const countDisplay = document.getElementById('people-count');
  const inputPeople = document.getElementById('wa-people');

  if (btnMinus && btnPlus && countDisplay && inputPeople) {
    btnMinus.addEventListener('click', () => {
      let current = parseInt(inputPeople.value);
      if (current > 1) {
        current--;
        inputPeople.value = current;
        countDisplay.textContent = current;
      }
    });
    btnPlus.addEventListener('click', () => {
      let current = parseInt(inputPeople.value);
      if (current < 20) { // arbitrary max
        current++;
        inputPeople.value = current;
        countDisplay.textContent = current + (current === 20 ? '+' : '');
      }
    });
  }

  const errorDiv = document.getElementById('wa-error');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide error initially
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }
    
    const name = document.getElementById('wa-name').value;
    const date = document.getElementById('wa-date').value;
    const time = document.getElementById('wa-time').value;
    const people = document.getElementById('wa-people').value;
    const notes = document.getElementById('wa-notes').value;
    
    // Validation
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday
    
    if (dayOfWeek === 1) { // Monday
      if (errorDiv) {
        errorDiv.textContent = 'Il ristorante è chiuso il Lunedì. Seleziona un\'altra data.';
        errorDiv.style.display = 'block';
      }
      return; // Stop submission
    }
    
    // Time validation (19:30 - 23:30)
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const minTime = 19 * 60 + 30; // 19:30
    const maxTime = 23 * 60 + 30; // 23:30
    
    if (timeInMinutes < minTime || timeInMinutes > maxTime) {
      if (errorDiv) {
        errorDiv.textContent = 'Le prenotazioni sono aperte solo per il servizio serale (19:30 - 23:30).';
        errorDiv.style.display = 'block';
      }
      return; // Stop submission
    }
    
    const formattedDate = date.split('-').reverse().join('/');
    
    const rawMessage = `Salve Hostaria La Carbonara! Vorrei confermare una prenotazione.\n\n*Nome:* ${name}\n*Data:* ${formattedDate}\n*Ora:* ${time}\n*Persone:* ${people}\n*Note:* ${notes ? notes : 'Nessuna'}`;
    const message = encodeURIComponent(rawMessage);
    
    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${message}`;
    
    // Provide a small visual feedback on the button before redirecting
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> REDIRECTING...';
    btn.style.backgroundColor = '#25D366'; // WhatsApp Green
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      form.reset();
      if(countDisplay) {
        inputPeople.value = 2;
        countDisplay.textContent = '2';
      }
    }, 1000);
  });
}

function setupBurgerMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    // Close menu on scroll
    window.addEventListener('scroll', () => {
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    });
  }
}
