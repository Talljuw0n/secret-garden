function initNav() {
    var toggle = document.getElementById('mobileToggle');
    var navLinks = document.getElementById('navLinks');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = navLinks.classList.contains('active');
        navLinks.classList.toggle('active', !isOpen);
        toggle.classList.toggle('active', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', function (e) {
        if (
            navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !toggle.contains(e.target)
        ) {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    var navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.style.boxShadow = window.pageYOffset > 100
                ? '0 2px 16px rgba(0,0,0,0.1)'
                : 'none';
        });
    }
}

// Run immediately if DOM is ready, otherwise wait for it
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}