// Menú Hamburguesa para móviles
const menuToggle = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Simulación de envío de formulario
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue
    alert('¡Gracias! Hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.');
    contactForm.reset(); // Limpia el formulario
});