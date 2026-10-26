// التنقل بين الصفحات (Tabs)
function switchTab(tabId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active-page'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.add('active-page');
    }

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    if (tabId === 'home-page') navItems[0]?.classList.add('active');
    if (tabId === 'reports-page') navItems[1]?.classList.add('active');
    if (tabId === 'emergency-page') navItems[2]?.classList.add('active');
    if (tabId === 'services-page') navItems[3]?.classList.add('active');
    if (tabId === 'more-page') navItems[4]?.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. تفعيل زرار الوضع الليلي (Dark Mode)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                themeToggle.innerText = '☀️';
            } else {
                themeToggle.innerText = '🌙';
            }
        });
    }

    // 2. تفعيل نافذة تسجيل الدخول
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    const nationalIdInput = document.getElementById('nationalIdInput');

    if (headerLoginBtn && loginModal) {
        headerLoginBtn.addEventListener('click', () => {
            if (nationalIdInput) nationalIdInput.value = '';
            loginModal.style.display = 'flex';
        });
    }

    if (closeModal && loginModal) {
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // 3. تفعيل نافذة "عن التطبيق" وإغلاقها
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.querySelector('.close-modal-about');

    if (closeAboutModal && aboutModal) {
        closeAboutModal.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
    }

    // إغلاق النوافذ المنبثقة عند الضغط خارجها
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // معالجة نموذج تسجيل الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idVal = nationalIdInput ? nationalIdInput.value.trim() : '';

            if (idVal.length !== 14 || isNaN(idVal)) {
                alert('⚠️ يرجى إدخال رقم قومي صحيح مكون من 14 رقماً!');
                return;
            }

            alert('✅ تم تسجيل الدخول بنجاح برقم قومي: ' + idVal);
            if (headerLoginBtn) headerLoginBtn.innerText = '🆔 ' + idVal.substring(0, 6) + '...';
            loginModal.style.display = 'none';
        });
    }

    // 4. إدارة البلاغات والتحديد الجغرافي GPS
    const complaintForm = document.getElementById('complaintForm');
    const cardsContainer = document.getElementById('cardsContainer');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const issueDesc = document.getElementById('issueDesc');

    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                getLocationBtn.innerText = '⌛ جاري تحديد موقعك...';
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        if (issueDesc) issueDesc.value += `\n📍 موقع GPS: https://maps.google.com/?q=${lat},${lng}`;
                        getLocationBtn.innerText = '✅ تم تحديد الموقع بنجاح!';
                    },
                    () => {
                        alert('عذراً، تعذر الحصول على موقعك. يرجى تفعيل الـ GPS في جهازك.');
                        getLocationBtn.innerText = '📍 تحديد موقعي الحالي تلقائياً (GPS)';
                    }
                );
            }
        });
    }

    let savedReports = JSON.parse(localStorage.getItem('my_reports') || '[]');

    function renderReports() {
        if (!cardsContainer) return;

        const statTotal = document.getElementById('statTotal');
        const statPending = document.getElementById('statPending');
        const statResolved = document.getElementById('statResolved');

        if (statTotal) statTotal.innerText = savedReports.length;
        if (statPending) statPending.innerText = savedReports.filter(r => r.status === 'قيد المعالجة').length;
        if (statResolved) statResolved.innerText = savedReports.filter(r => r.status === 'تم الحل').length;

        if (savedReports.length === 0) {
            cardsContainer.innerHTML = '<p style="text-align: center; color: var(--text-sub); padding: 20px;">لا توجد بلاغات مسجلة حتى الآن.</p>';
            return;
        }

        cardsContainer.innerHTML = savedReports.map(rep => `
            <div class="report-card">
                <h4>📌 ${rep.type}</h4>
                <p>📱 رقم التواصل: ${rep.phone}</p>
                <p>📍 المحافظة: ${rep.gov} - المدينة/الحي: ${rep.city}</p>
                <p>📝 التفاصيل: ${rep.desc}</p>
                ${rep.img ? `<img src="${rep.img}" class="report-img" alt="صورة البلاغ">` : ''}
                <span class="report-status">⏳ ${rep.status}</span>
            </div>
        `).join('');
    }

    if (complaintForm) {
        complaintForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const gov = document.getElementById('governorateSelect').value;
            const city = document.getElementById('cityNameInput').value;
            const nationalId = document.getElementById('reporterNationalId').value;
            const phone = document.getElementById('reporterPhone').value;
            const type = document.getElementById('issueType').value;
            const desc = document.getElementById('issueDesc').value;
            const imgInput = document.getElementById('issueImg');

            const processSave = (imgBase64 = '') => {
                const newReport = {
                    id: Date.now(),
                    gov,
                    city,
                    nationalId,
                    phone,
                    type,
                    desc,
                    img: imgBase64,
                    status: 'قيد المعالجة',
                    date: new Date().toLocaleDateString('ar-EG')
                };

                savedReports.unshift(newReport);
                localStorage.setItem('my_reports', JSON.stringify(savedReports));
                renderReports();
                complaintForm.reset();
                alert('🚀 تم إرسال البلاغ بنجاح وتخصيص رقم متابعة له!');
                switchTab('reports-page');
            };

            if (imgInput && imgInput.files && imgInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    processSave(evt.target.result);
                };
                reader.readAsDataURL(imgInput.files[0]);
            } else {
                processSave('');
            }
        });
    }

    renderReports();
});
let lastScrollTop = 0;
const header = document.querySelector('.top-header');

window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
        header.classList.add('hide-header');
    } else {
        header.classList.remove('hide-header');
    }

    lastScrollTop = Math.max(currentScroll, 0);
});
