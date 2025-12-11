// --- DATOS INICIALES ---
const defaultProducts = [
    { id: 1, name: 'Aceite Sintético 5W-30', price: 25.00, stock: 10 },
    { id: 2, name: 'Batería 12V 600Amps', price: 85.00, stock: 5 },
    { id: 3, name: 'Juego de Bujías (4)', price: 12.00, stock: 20 },
    { id: 4, name: 'Filtro de Aire Universal', price: 8.50, stock: 15 },
    { id: 5, name: 'Llantas R15 (Unidad)', price: 60.00, stock: 2 } // Stock bajo para probar
];

// Cargar productos del LocalStorage o usar los default si es la primera vez
let products = JSON.parse(localStorage.getItem('automaster_products')) || defaultProducts;

// --- ELEMENTOS DEL DOM ---
const loginForm = document.getElementById('loginForm');
const addProductForm = document.getElementById('addProductForm');
const btnLogout = document.getElementById('btnLogout');

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
            alert('Credenciales incorrectas.\n\nPrueba con:\nUsuario: admin | Pass: 1234\nUsuario: cliente | Pass: 1234');
        }
    });
}

// 2. Manejo de Agregar Producto (Solo Admin)
if(addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-prod-name').value;
        const price = parseFloat(document.getElementById('new-prod-price').value);
        const stock = parseInt(document.getElementById('new-prod-stock').value);

        if(name && price && stock) {
            addProduct(name, price, stock);
            e.target.reset(); // Limpiar formulario
        }
    });
}

// 3. Logout
if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        location.reload(); // Recargar página para "cerrar sesión"
    });
}

// --- FUNCIONES LÓGICAS ---

function loadView(viewId, userName) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // 2. Mostrar la sección deseada
    document.getElementById(viewId).classList.add('active');
    
    // 3. Configurar Navbar
    document.getElementById('navbar').style.display = 'flex';
    document.getElementById('welcome-msg').innerText = `Hola, ${userName}`;

    // 4. Renderizar datos según la vista
    if(viewId === 'view-admin') renderInventory();
    if(viewId === 'view-client') renderCatalog();
}

// --- ADMIN: LÓGICA DE INVENTARIO ---

function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = ''; // Limpiar tabla

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
    const newProduct = { 
        id: Date.now(), // ID único basado en fecha
        name, 
        price, 
        stock 
    };
    
    products.push(newProduct);
    saveData();
    renderInventory(); // Actualizar tabla visualmente
    showNotification('Producto agregado correctamente al sistema.');
}

// --- CLIENTE: LÓGICA DE CATÁLOGO ---

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = ''; // Limpiar grid

    products.forEach(p => {
        const card = `
            <div class="product-card">
                <div class="stock-badge">Stock: ${p.stock}</div>
                <i class="fas fa-box-open"></i>
                <h3>${p.name}</h3>
                <p class="price">$${p.price.toFixed(2)}</p>
                <button 
                    class="btn-reserve" 
                    onclick="reserveProduct(${p.id})" 
                    ${p.stock === 0 ? 'disabled' : ''}>
                    ${p.stock > 0 ? 'Reservar para Retiro' : 'Agotado'}
                </button>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Esta función debe estar global (window) para que el HTML onclick la encuentre
window.reserveProduct = function(id) {
    const product = products.find(p => p.id === id);
    
    if (product && product.stock > 0) {
        product.stock--; // Restar 1 al stock
        saveData(); // Guardar en persistencia
        renderCatalog(); // Volver a pintar la pantalla con el nuevo número
        showNotification(`¡Reservado! Has apartado: ${product.name}`);
    } else {
        alert('Lo sentimos, este producto ya no tiene stock.');
    }
};

// --- UTILIDADES ---

function saveData() {
    localStorage.setItem('automaster_products', JSON.stringify(products));
}

function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => { 
        notif.style.display = 'none'; 
    }, 3000);
}