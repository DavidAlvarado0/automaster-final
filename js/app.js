// --- DATOS INICIALES ---
const defaultProducts = [
    { id: 1, name: 'Aceite Sintético 5W-30', price: 25.00, stock: 10 },
    { id: 2, name: 'Batería 12V 600Amps', price: 85.00, stock: 5 },
    { id: 3, name: 'Juego de Bujías (4)', price: 12.00, stock: 20 },
    { id: 4, name: 'Filtro de Aire Universal', price: 8.50, stock: 15 },
    { id: 5, name: 'Llantas R15 (Unidad)', price: 60.00, stock: 2 }
];

// Cargar productos del LocalStorage o usar los default
let products = JSON.parse(localStorage.getItem('automaster_products')) || defaultProducts;

// --- ELEMENTOS DEL DOM ---
const loginForm = document.getElementById('loginForm');
const addProductForm = document.getElementById('addProductForm');
const btnLogout = document.getElementById('btnLogout');
const reservationModal = document.getElementById('reservation-modal');
const reservationForm = document.getElementById('reservationForm');

// --- EVENT LISTENERS ---

// 1. Manejo del Login
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.toLowerCase().trim();
        const pass = document.getElementById('password').value.trim();

        if (user === 'admin' && pass === '1234') {
            loadView('view-admin', 'Administrador');
        } else if (user === 'cliente' && pass === '1234') {
            loadView('view-client', 'Cliente Estimado');
        } else {
            alert('Credenciales incorrectas.\nPrueba con:\nUser: admin | Pass: 1234\nUser: cliente | Pass: 1234');
        }
    });
}

// 2. Agregar Producto (Solo Admin)
if(addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-prod-name').value;
        const price = parseFloat(document.getElementById('new-prod-price').value);
        const stock = parseInt(document.getElementById('new-prod-stock').value);

        if(name && price && stock) {
            addProduct(name, price, stock);
            e.target.reset(); 
        }
    });
}

// 3. Confirmar Reserva (Cliente - Formulario Modal)
if(reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener datos del formulario modal
        const prodId = parseInt(document.getElementById('modal-prod-id').value);
        const clientName = document.getElementById('client-name').value;
        const branch = document.getElementById('client-branch').value;
        
        // Ejecutar lógica de reserva
        confirmReservation(prodId, clientName, branch);
    });
}

// 4. Logout
if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        location.reload(); 
    });
}

// --- FUNCIONES DE NAVEGACIÓN ---

function loadView(viewId, userName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Mostrar la sección deseada
    document.getElementById(viewId).classList.add('active');
    
    // Configurar Navbar
    document.getElementById('navbar').style.display = 'flex';
    document.getElementById('welcome-msg').innerText = `Hola, ${userName}`;

    // Renderizar datos según la vista
    if(viewId === 'view-admin') renderInventory();
    if(viewId === 'view-client') renderCatalog();
}

// --- FUNCIONES ADMIN ---

function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = ''; 

    products.forEach(p => {
        const row = `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>$${p.price.toFixed(2)}</td>
                <td class="${p.stock < 3 ? 'stock-warning' : ''}">${p.stock}</td>
                <td>
                    <span style="color: ${p.stock > 0 ? 'green' : 'red'}">
                        ${p.stock > 0 ? '● Disponible' : '● Agotado'}
                    </span>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function addProduct(name, price, stock) {
    const newProduct = { id: Date.now(), name, price, stock };
    products.push(newProduct);
    saveData();
    renderInventory();
    showNotification('Producto agregado correctamente.');
}

// --- FUNCIONES CLIENTE Y MODAL ---

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    products.forEach(p => {
        // El botón ahora llama a openModal()
        const card = `
            <div class="product-card">
                <div class="stock-badge">Stock: ${p.stock}</div>
                <i class="fas fa-box-open"></i>
                <h3>${p.name}</h3>
                <p class="price">$${p.price.toFixed(2)}</p>
                <button 
                    class="btn-reserve" 
                    onclick="openModal(${p.id})" 
                    ${p.stock === 0 ? 'disabled' : ''}>
                    ${p.stock > 0 ? 'Reservar' : 'Agotado'}
                </button>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Abrir Modal
window.openModal = function(id) {
    const product = products.find(p => p.id === id);
    if(!product || product.stock <= 0) return;

    // Llenar datos en el modal
    document.getElementById('modal-prod-id').value = product.id;
    document.getElementById('modal-prod-name').innerText = product.name;
    document.getElementById('modal-prod-price').innerText = product.price.toFixed(2);
    
    // Mostrar modal
    reservationModal.classList.add('active');
};

// Cerrar Modal
window.closeModal = function() {
    reservationModal.classList.remove('active');
    document.getElementById('reservationForm').reset(); // Limpiar campos
};

// Lógica Final de Reserva
function confirmReservation(id, clientName, branch) {
    const product = products.find(p => p.id === id);

    if (product && product.stock > 0) {
        product.stock--; // Restar inventario
        saveData(); // Guardar
        renderCatalog(); // Refrescar pantalla
        closeModal(); // Cerrar modal
        
        // Notificación con datos
        showNotification(`¡Reserva Exitosa!\nCliente: ${clientName}\nRetiro en: ${branch}`);
    } else {
        alert('Error: El producto ya no tiene stock disponible.');
        closeModal();
        renderCatalog();
    }
}

// --- UTILIDADES ---

function saveData() {
    localStorage.setItem('automaster_products', JSON.stringify(products));
}

function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.display = 'block';
    
    setTimeout(() => { 
        notif.style.display = 'none'; 
    }, 4000);
}