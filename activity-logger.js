const ActivityLogger = {
    CONFIG: {
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby7eXy51_62Lh_H_TkAYWSWyZ6pJaLJ7OoFNW2dofSQ9TtRi5UprElciBhNMIqafDrY/exec',
        IS_ADMIN: false
    },

    init: function() {
        // Delay by 1.5 seconds to ensure student identity AND dynamic buttons are loaded
        setTimeout(() => {
            this.CONFIG.IS_ADMIN = (window.studentEmail === 'jlibiblecollege@gmail.com');
            
            if (this.CONFIG.IS_ADMIN) {
                this.ui.createAdminDashboard();
            }

            // Log entry
            this.logActivity('Portal Accessed', 'Dashboard');
            
            // START THE LISTENERS
            this.setupListeners();
            console.log("Activity Tracking Active.");
        }, 1500); 
    },

    ui: {
        createAdminDashboard: function() {
            const adminSecurity = document.getElementById('admin-security-section');
            const adminStudents = document.getElementById('admin-students-toggle-div');
            if (adminSecurity) adminSecurity.style.display = 'block';
            if (adminStudents) adminStudents.style.display = 'block';
        },

        toggleStudents: function() {
            const wrapper = document.getElementById('student-directory-wrapper');
            const btn = document.getElementById('viewStudentsBtn');
            if (!wrapper) return;

            if (wrapper.style.display === 'none' || wrapper.style.display === '') {
                wrapper.style.display = 'block';
                btn.innerHTML = '❌ CLOSE STUDENT DIRECTORY';
                btn.style.backgroundColor = '#dc3545';
            } else {
                wrapper.style.display = 'none';
                btn.innerHTML = '👥 VIEW STUDENT DIRECTORY';
                btn.style.backgroundColor = '#1e3c72';
            }
        },

        togglePanel: function() {
            window.open('security-dashboard.html', '_blank');
        }
    },

    logActivity: function(action, location) {
        // CRITICAL: Always pull the latest email/name from window
        const data = {
            email: window.studentEmail || 'Unknown',
            name: window.studentName || 'Unknown',
            action: action,
            location: location,
            device: navigator.userAgent.slice(0, 50)
        };

        fetch(this.CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(data)
        }).catch(err => console.error("Logging error:", err));
    },

    setupListeners: function() {
        // 1. Track Print attempts
        window.addEventListener('beforeprint', () => {
            this.logActivity('Print Attempt', 'PDF Viewer');
        });
        
        // 2. Track Right Clicks
        window.addEventListener('contextmenu', () => {
            this.logActivity('Right Click Violation', 'Website Content');
        });

        // 3. Track All Clicks
        document.addEventListener('click', (e) => {
            const target = e.target;

            // TRACK PDF PANELS (Check for the card or anything inside it)
            const pdfPanel = target.closest('.pdf-card'); 
            if (pdfPanel) {
                const pdfName = pdfPanel.querySelector('h3')?.innerText || 'Unknown PDF';
                this.logActivity(`Opened PDF: ${pdfName}`, 'Dashboard');
                return; // Stop here if we found a PDF click
            }

            // TRACK PROFILE (Checks for ID or Text)
            if (target.id === 'profile-btn' || target.innerText.includes('Profile')) {
                this.logActivity('Click Profile', 'Student Profile View');
                return;
            }

            // TRACK MARKSHEET (Checks for ID or Text)
            if (target.id === 'marksheet-btn' || target.innerText.includes('Marksheet')) {
                this.logActivity('Checked Marksheet', 'Student Portal');
                return;
            }
            
            // TRACK DOWNLOADS
            if (target.innerText.includes('Download') || target.classList.contains('download-btn')) {
                this.logActivity('Download Attempt', 'File System');
            }
        }, true); // 'true' makes the listener more sensitive to clicks
    }
};

// Start the logger
ActivityLogger.init();
