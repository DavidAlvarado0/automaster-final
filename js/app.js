// --- DATOS INICIALES CON TUS IMÁGENES ---
/* IMPORTANTE: 
   Asegúrate de que tus archivos en la carpeta "img" tengan EXACTAMENTE 
   estos nombres, o cambia los nombres aquí abajo para que coincidan.
*/
const defaultProducts = [
    { 
        id: 1, 
        name: 'Aceite Sintético 5W-30', 
        price: 25.00, 
        stock: 10, 
        image: 'img/aceite.png'  
    },
    { 
        id: 2, 
        name: 'Batería 12V 600Amps', 
        price: 85.00, 
        stock: 5, 
        image: 'img/bateria.jpg' 
    },
    { 
        id: 3, 
        name: 'Juego de Bujías (4)', 
        price: 12.00, 
        stock: 20, 
        image: 'img/bujias.jpg' 
    },
    { 
        id: 4, 
        name: 'Filtro de Aire Universal', 
        price: 8.50, 
        stock: 15, 
        image: 'img/filtro.jpg' 
    },
    { 
        id: 5, 
        name: 'Llantas R15 (Unidad)', 
        price: 60.00, 
        stock: 2, 
        image: 'img/llantas.jpg' 
    }
];

let products = JSON.parse(localStorage.getItem('automaster_db_v3')) || defaultProducts;


const loginForm = document.getElementById('loginForm');
const addProductForm = document.getElementById('addProductForm');
const btnLogout = document.getElementById('btnLogout');
const reservationModal = document.getElementById('reservation-modal');
const reservationForm = document.getElementById('reservationForm');


// 1. Login
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
            alert('Credenciales incorrectas.\nPrueba: admin/1234 o cliente/1234');
        }
    });
}

// 2. Agregar Producto (Admin)
if(addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-prod-name').value;
        const price = parseFloat(document.getElementById('new-prod-price').value);
        const stock = parseInt(document.getElementById('new-prod-stock').value);

        // Nota: Los productos nuevos se agregan sin foto (image: null)
        // para no complicar el formulario, y usarán el icono por defecto.
        if(name && price && stock) {
            addProduct(name, price, stock);
            e.target.reset(); 
        }
    });
}

// 3. Confirmar Reserva (Cliente)
if(reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prodId = parseInt(document.getElementById('modal-prod-id').value);
        const clientName = document.getElementById('client-name').value;
        const branch = document.getElementById('client-branch').value;
        
        confirmReservation(prodId, clientName, branch);
    });
}

// 4. Logout
if(btnLogout) {
    btnLogout.addEventListener('click', () => location.reload());
}

// --- FUNCIONES LÓGICAS ---

function loadView(viewId, userName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.getElementById('navbar').style.display = 'flex';
    document.getElementById('welcome-msg').innerText = `Hola, ${userName}`;

    if(viewId === 'view-admin') renderInventory();
    if(viewId === 'view-client') renderCatalog();
}

// --- ADMIN: INVENTARIO ---

function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = ''; 

    products.forEach(p => {
        // Si tiene imagen, la muestra pequeñita en la tabla
        const imgThumb = p.image 
            ? `<img src="${p.image}" style="width:30px; height:30px; border-radius:4px; vertical-align:middle; margin-right:10px; object-fit:cover;">` 
            : '';

        const row = `
            <tr>
                <td>
                    ${imgThumb} 
                    <strong>${p.name}</strong>
                </td>
                <td>$${p.price.toFixed(2)}</td>
                <td class="${p.stock < 3 ? 'stock-warning' : ''}">${p.stock}</td>
                <td><span style="color: ${p.stock > 0 ? 'green' : 'red'}">${p.stock > 0 ? '● Disponible' : '● Agotado'}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function addProduct(name, price, stock) {
    const newProduct = { id: Date.now(), name, price, stock, image: null };
    products.push(newProduct);
    saveData();
    renderInventory();
    showNotification('Producto agregado correctamente.');
}

// --- CLIENTE: CATÁLOGO ---

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    products.forEach(p => {
        // Lógica: Si hay ruta de imagen, usa <img>, si no, usa el icono <i>
        // 'onerror' sirve por si la imagen no existe, pone el icono automáticamente.
        const imageHTML = p.image 
            ? `<img src="${p.image}" class="product-img" alt="${p.name}" onerror="this.onerror=null; this.parentNode.innerHTML='<i class=\'fas fa-box-open\'></i><h3>${p.name}</h3>...';">` 
            : `<i class="fas fa-box-open"></i>`;

        const card = `
            <div class="product-card">
                <div class="stock-badge">Stock: ${p.stock}</div>
                ${p.image ? `<img src="${p.image}" class="product-img" alt="${p.name}">` : `<i class="fas fa-box-open"></i>`}
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

// --- VENTANA MODAL ---

window.openModal = function(id) {
    const product = products.find(p => p.id === id);
    if(!product || product.stock <= 0) return;

    document.getElementById('modal-prod-id').value = product.id;
    document.getElementById('modal-prod-name').innerText = product.name;
    document.getElementById('modal-prod-price').innerText = product.price.toFixed(2);
    
    reservationModal.classList.add('active');
};

window.closeModal = function() {
    reservationModal.classList.remove('active');
    document.getElementById('reservationForm').reset();
};

function confirmReservation(id, clientName, branch) {
    const product = products.find(p => p.id === id);

    if (product && product.stock > 0) {
        product.stock--; 
        saveData();
        renderCatalog(); 
        closeModal(); 
        showNotification(`¡Reserva Exitosa!\nCliente: ${clientName}\nRetiro en: ${branch}`);
    } else {
        alert('Error: El producto ya no tiene stock disponible.');
        closeModal();
        renderCatalog();
    }
}

// --- UTILIDADES ---

function saveData() {
    // IMPORTANTE: Mantenemos la versión v3
    localStorage.setItem('automaster_db_v3', JSON.stringify(products));
}

function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.display = 'block';
    setTimeout(() => { notif.style.display = 'none'; }, 4000);
}