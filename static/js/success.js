// Success Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Add success animation
    const successContainer = document.querySelector('.success-container');
    if (successContainer) {
        successContainer.style.opacity = '0';
        successContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            successContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            successContainer.style.opacity = '1';
            successContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Confetti effect (optional)
    createConfetti();
});

// Social Sharing Functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent('I just registered for Divine Encounter 2026! Join me for this life-changing spiritual experience. Where Heaven Meets Earth - March 15-17, 2026');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent('I just registered for Divine Encounter 2026! Join me for this transformative spiritual gathering. #DivineEncounter2026');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent('I just registered for Divine Encounter 2026! 🙏\n\nJoin me for this life-changing spiritual experience.\n\n📅 March 15-17, 2026\n📍 Grace Convention Center, Lagos\n\nWhere Heaven Meets Earth ✨\n\nRegister here:');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

// Simple confetti effect
function createConfetti() {
    const colors = ['#c29657', '#d4a76a', '#2c3e50', '#34495e', '#27ae60'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 30);
    }
}

function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    
    document.body.appendChild(confetti);
    
    const duration = 3000 + Math.random() * 2000;
    const startTime = Date.now();
    const startLeft = parseFloat(confetti.style.left);
    const drift = (Math.random() - 0.5) * 100;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const top = progress * window.innerHeight;
            const left = startLeft + drift * progress;
            const rotation = progress * 360 * 4;
            const opacity = 1 - progress;
            
            confetti.style.top = top + 'px';
            confetti.style.left = left + 'px';
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        } else {
            confetti.remove();
        }
    }
    
    animate();
}

// Print confirmation (optional feature)
function printConfirmation() {
    window.print();
}

// Download calendar event (optional feature)
function downloadCalendarEvent() {
    const event = {
        title: 'Divine Encounter 2026',
        description: 'Where Heaven Meets Earth - A transformative spiritual gathering',
        location: 'Grace Convention Center, Lagos',
        startDate: '2026-03-15T18:00:00',
        endDate: '2026-03-17T13:00:00'
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.startDate.replace(/[-:]/g, '')}
DTEND:${event.endDate.replace(/[-:]/g, '')}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'divine-encounter-2026.ics';
    link.click();
}