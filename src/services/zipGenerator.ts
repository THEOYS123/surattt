import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Order } from '../types';

export async function generateInvitationZip(order: Order): Promise<void> {
  const zip = new JSZip();
  const d = order.invitationData;
  const isWedding = d.categorySlug === 'pernikahan' || Boolean(d.groomName && d.brideName);
  const isBusiness = d.categorySlug === 'bisnis' || d.categorySlug === 'seminar' || d.categorySlug === 'workshop' || Boolean(d.companyName);

  // Generate self-contained HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(d.title)}</title>
  <meta name="description" content="${escapeHtml(d.description || d.tagline || d.title)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Cover / Welcome Screen -->
  <div id="coverOverlay" class="cover-overlay">
    <div class="cover-content">
      <p class="tagline">${escapeHtml(d.tagline || 'UNDANGAN KHUSUS')}</p>
      <h1 class="main-title">${escapeHtml(d.title)}</h1>
      
      <div class="guest-box">
        <p class="to-label">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <h3 id="guestNameDisplay" class="guest-name">Tamu Undangan</h3>
      </div>

      <button id="openBtn" class="btn-primary" onclick="openInvitation()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><path d="M21 8v13H3V8"></path><path d="M1 3h22v5H1z"></path><path d="M10 12h4"></path></svg>
        Buka Undangan
      </button>
    </div>
  </div>

  <!-- Audio Player (Optional) -->
  ${d.backgroundMusicUrl ? `
  <div class="music-floating">
    <button id="musicToggleBtn" class="music-btn" onclick="toggleAudio()" aria-label="Toggle Music">
      <span id="musicIcon">🎵</span>
    </button>
    <audio id="bgAudio" loop src="${escapeHtml(d.backgroundMusicUrl)}"></audio>
  </div>
  ` : ''}

  <!-- Main Invitation Body -->
  <main id="mainContent" class="main-wrapper">
    
    <!-- Hero Header -->
    <header class="hero-section" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('${escapeHtml(d.coverImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80')}');">
      <div class="hero-inner">
        <span class="badge-pill">${escapeHtml(d.tagline || 'OFFICIAL INVITATION')}</span>
        <h1 class="hero-heading">${escapeHtml(d.title)}</h1>
        <p class="hero-date">📅 ${formatIndoDate(d.eventDate)} • ${escapeHtml(d.startTime)} WIB</p>
        <p class="hero-venue">📍 ${escapeHtml(d.venueName)}</p>
      </div>
    </header>

    <!-- Countdown Timer -->
    <section class="section countdown-section">
      <h2 class="section-title">Menghitung Hari Menuju Acara</h2>
      <div class="countdown-grid" id="countdownGrid">
        <div class="cd-item"><span id="cdDays" class="cd-num">00</span><span class="cd-label">Hari</span></div>
        <div class="cd-item"><span id="cdHours" class="cd-num">00</span><span class="cd-label">Jam</span></div>
        <div class="cd-item"><span id="cdMinutes" class="cd-num">00</span><span class="cd-label">Menit</span></div>
        <div class="cd-item"><span id="cdSeconds" class="cd-num">00</span><span class="cd-label">Detik</span></div>
      </div>
    </section>

    <!-- Description & Greetings -->
    <section class="section text-center">
      <div class="container-narrow">
        <p class="desc-text">${escapeHtml(d.description || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.')}</p>
      </div>
    </section>

    <!-- Wedding Details -->
    ${isWedding ? `
    <section class="section couples-section">
      <div class="container">
        <h2 class="section-title font-script">Mempelai</h2>
        <div class="couples-grid">
          ${d.groomName ? `
          <div class="couple-card">
            ${d.groomPhotoUrl ? `<img src="${escapeHtml(d.groomPhotoUrl)}" alt="${escapeHtml(d.groomName)}" class="couple-photo">` : ''}
            <h3 class="couple-name">${escapeHtml(d.groomName)}</h3>
            <p class="couple-parents">${escapeHtml(d.groomParents || '')}</p>
            ${d.groomInstagram ? `<p class="couple-ig">IG: ${escapeHtml(d.groomInstagram)}</p>` : ''}
          </div>
          ` : ''}

          <div class="and-symbol">&</div>

          ${d.brideName ? `
          <div class="couple-card">
            ${d.bridePhotoUrl ? `<img src="${escapeHtml(d.bridePhotoUrl)}" alt="${escapeHtml(d.brideName)}" class="couple-photo">` : ''}
            <h3 class="couple-name">${escapeHtml(d.brideName)}</h3>
            <p class="couple-parents">${escapeHtml(d.brideParents || '')}</p>
            ${d.brideInstagram ? `<p class="couple-ig">IG: ${escapeHtml(d.brideInstagram)}</p>` : ''}
          </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- Akad & Resepsi Agenda -->
    <section class="section events-section">
      <div class="container">
        <h2 class="section-title">Rangkaian Acara</h2>
        <div class="event-cards-grid">
          ${d.akadDate ? `
          <div class="event-card">
            <h3 class="event-type">Akad Nikah</h3>
            <p class="event-datetime">📅 ${formatIndoDate(d.akadDate)}<br>⏰ ${escapeHtml(d.akadTime || d.startTime)}</p>
            <p class="event-loc">📍 <strong>${escapeHtml(d.akadVenue || d.venueName)}</strong><br>${escapeHtml(d.akadAddress || d.venueAddress)}</p>
          </div>
          ` : ''}
          ${d.resepsiDate ? `
          <div class="event-card">
            <h3 class="event-type">Resepsi</h3>
            <p class="event-datetime">📅 ${formatIndoDate(d.resepsiDate)}<br>⏰ ${escapeHtml(d.resepsiTime || d.endTime || 'Selesai')}</p>
            <p class="event-loc">📍 <strong>${escapeHtml(d.resepsiVenue || d.venueName)}</strong><br>${escapeHtml(d.resepsiAddress || d.venueAddress)}</p>
          </div>
          ` : ''}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Business / Speakers / Agenda -->
    ${isBusiness ? `
    <section class="section business-section">
      <div class="container">
        ${d.companyName ? `<div class="company-badge">${escapeHtml(d.companyName)}</div>` : ''}
        <h2 class="section-title">Informasi Acara</h2>
        
        <div class="event-card max-w-lg mx-auto">
          <p class="event-datetime">📅 ${formatIndoDate(d.eventDate)}<br>⏰ ${escapeHtml(d.startTime)} - ${escapeHtml(d.endTime || 'Selesai')} WIB</p>
          <p class="event-loc">📍 <strong>${escapeHtml(d.venueName)}</strong><br>${escapeHtml(d.venueAddress)}</p>
          ${d.registrationUrl ? `
          <div style="margin-top:16px;">
            <a href="${escapeHtml(d.registrationUrl)}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-block; text-decoration:none;">Daftar Sekarang</a>
          </div>
          ` : ''}
        </div>

        ${d.speakers && d.speakers.length > 0 ? `
        <div style="margin-top:40px;">
          <h3 class="section-title" style="font-size:1.5rem;">Pembicara & Narasumber</h3>
          <div class="speakers-grid">
            ${d.speakers.map(s => `
              <div class="speaker-card">
                <h4>${escapeHtml(s.name)}</h4>
                <p>${escapeHtml(s.title)}</p>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <!-- School / Education Details -->
    ${d.categorySlug === 'sekolah' || d.institutionName ? `
    <section class="section school-section">
      <div class="container">
        ${d.institutionName ? `<div class="company-badge">🏫 ${escapeHtml(d.institutionName)}</div>` : ''}
        <h2 class="section-title">Informasi & Susunan Acara</h2>
        
        <div class="event-card max-w-lg mx-auto" style="margin-bottom:24px;">
          <p class="event-datetime">📅 ${formatIndoDate(d.eventDate)}<br>⏰ ${escapeHtml(d.startTime)} - ${escapeHtml(d.endTime || 'Selesai')} WIB</p>
          <p class="event-loc">📍 <strong>${escapeHtml(d.venueName)}</strong><br>${escapeHtml(d.venueAddress)}</p>
          ${d.ticketPrice ? `<p style="margin-top:8px; font-weight:600; color:#b45309;">🎟️ ${escapeHtml(d.ticketPrice)}</p>` : ''}
          ${d.principalOrHead || d.committeeHead ? `
          <div style="margin-top:14px; padding-top:14px; border-top:1px solid #e7e5e4; font-size:0.875rem; color:#57534e;">
            ${d.principalOrHead ? `<p>👤 <strong>Kepala Sekolah:</strong> ${escapeHtml(d.principalOrHead)}</p>` : ''}
            ${d.committeeHead ? `<p>👥 <strong>Ketua Panitia:</strong> ${escapeHtml(d.committeeHead)}</p>` : ''}
          </div>
          ` : ''}
        </div>

        ${d.agendaRundown && d.agendaRundown.length > 0 ? `
        <div>
          <h3 class="section-title" style="font-size:1.3rem;">Rundown Kegiatan</h3>
          <div class="speakers-grid">
            ${d.agendaRundown.map(item => `
              <div class="speaker-card">
                <span class="badge-pill" style="font-size:0.75rem; margin-bottom:6px; display:inline-block;">⏱️ ${escapeHtml(item.time)}</span>
                <h4>${escapeHtml(item.activity)}</h4>
                ${item.performer ? `<p>🎭 ${escapeHtml(item.performer)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <!-- General / Honoree Details (Birthday, Aqiqah, etc) -->
    ${d.honoreeName ? `
    <section class="section text-center">
      <div class="container-narrow">
        <h2 class="section-title">${escapeHtml(d.honoreeName)}</h2>
        ${d.honoreeAge ? `<p class="badge-pill" style="display:inline-block; margin-bottom:16px;">${escapeHtml(d.honoreeAge)}</p>` : ''}
        <p class="desc-text">${escapeHtml(d.description || '')}</p>
      </div>
    </section>
    ` : ''}

    <!-- Photo Gallery -->
    ${d.galleryImages && d.galleryImages.length > 0 ? `
    <section class="section gallery-section">
      <div class="container">
        <h2 class="section-title">Galeri Foto</h2>
        <div class="gallery-grid">
          ${d.galleryImages.map(img => `
            <div class="gallery-item">
              <img src="${escapeHtml(img)}" alt="Gallery Photo" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Venue & Google Maps -->
    <section class="section map-section">
      <div class="container">
        <h2 class="section-title">Lokasi Acara</h2>
        <p class="map-venue-name">${escapeHtml(d.venueName)}</p>
        <p class="map-address">${escapeHtml(d.venueAddress)}</p>

        ${d.dressCode ? `
        <div class="dresscode-box">
          👔 <strong>Dress Code:</strong> ${escapeHtml(d.dressCode)}
        </div>
        ` : ''}

        ${d.googleMapsUrl ? `
        <div class="text-center" style="margin-top:20px;">
          <a href="${escapeHtml(d.googleMapsUrl)}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex; align-items:center; text-decoration:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Buka Petunjuk Arah (Google Maps)
          </a>
        </div>
        ` : ''}
      </div>
    </section>

    <!-- Gift / Rekening (Optional) -->
    ${d.bankAccounts && d.bankAccounts.length > 0 ? `
    <section class="section gift-section">
      <div class="container-narrow text-center">
        <h2 class="section-title">Amplop Digital & Kado</h2>
        <p class="desc-text" style="font-size:0.95rem; margin-bottom:24px;">Doa restu Anda adalah hadiah terindah. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat mentransfer ke rekening berikut:</p>
        <div class="bank-cards">
          ${d.bankAccounts.map(b => `
            <div class="bank-card">
              <span class="bank-name">${escapeHtml(b.bankName)}</span>
              <p class="account-num" id="acc-${escapeHtml(b.accountNumber)}">${escapeHtml(b.accountNumber)}</p>
              <p class="account-holder">a.n. ${escapeHtml(b.accountHolder)}</p>
              <button class="btn-copy" onclick="copyAccount('${escapeHtml(b.accountNumber)}')">Salin No. Rekening</button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- RSVP & Wishes Section -->
    <section class="section rsvp-section">
      <div class="container-narrow">
        <h2 class="section-title">Konfirmasi Kehadiran & Doa (RSVP)</h2>
        <form id="rsvpForm" class="rsvp-form" onsubmit="submitRSVP(event)">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input type="text" id="rsvpName" required placeholder="Masukkan nama Anda">
          </div>
          <div class="form-group">
            <label>Konfirmasi Kehadiran</label>
            <select id="rsvpStatus" required>
              <option value="Hadir">Ya, Saya akan Hadir</option>
              <option value="Mungkin">Mungkin Hadir</option>
              <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah Tamu</label>
            <input type="number" id="rsvpCount" min="1" max="5" value="1" required>
          </div>
          <div class="form-group">
            <label>Ucapan & Doa</label>
            <textarea id="rsvpWishes" rows="3" placeholder="Tuliskan ucapan dan doa restu..."></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Kirim Konfirmasi</button>
        </form>

        <div id="rsvpSuccessMsg" class="alert-success" style="display:none; margin-top:16px;">
          Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.
        </div>

        <!-- WhatsApp Quick Confirm -->
        ${d.whatsappContact ? `
        <div class="text-center" style="margin-top:24px;">
          <a href="https://wa.me/${escapeHtml(d.whatsappContact)}?text=Halo%2C%20saya%20ingin%20mengonfirmasi%20kehadiran%20di%20acara%20${encodeURIComponent(d.title)}" target="_blank" rel="noopener" class="btn-wa">
            Konfirmasi via WhatsApp
          </a>
        </div>
        ` : ''}
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>Terima kasih atas kehadiran & doa restu Anda.</p>
      <p class="footer-sub">${escapeHtml(d.title)}</p>
    </footer>

  </main>

  <div id="toast" class="toast">Nomor rekening berhasil disalin!</div>

  <script>
    window.EVENT_DATE = "${escapeHtml(d.eventDate)}T${escapeHtml(d.startTime)}:00";
  </script>
  <script src="js/script.js"></script>
</body>
</html>`;

  // Generate CSS
  const cssContent = `/* Standalone CSS for SURAT Invitation */
:root {
  --primary: #854d0e;
  --primary-light: #fef08a;
  --bg-dark: #1c1917;
  --bg-light: #fafaf9;
  --text-main: #292524;
  --text-muted: #78716c;
  --radius: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background-color: var(--bg-light);
  color: var(--text-main);
  line-height: 1.6;
  overflow-x: hidden;
}

/* Cover Overlay */
.cover-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('${escapeHtml(d.coverImageUrl || '')}') center/cover no-repeat;
  color: #fff;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
}

.cover-overlay.opened {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.cover-content {
  max-width: 480px;
  width: 100%;
}

.tagline {
  font-size: 0.85rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #facc15;
  margin-bottom: 12px;
}

.main-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.guest-box {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  padding: 16px;
  border-radius: var(--radius);
  margin-bottom: 24px;
}

.to-label {
  font-size: 0.85rem;
  color: #d6d3d1;
  margin-bottom: 4px;
}

.guest-name {
  font-size: 1.35rem;
  font-weight: 600;
  color: #fff;
}

.btn-primary {
  background: #ca8a04;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary:hover {
  background: #a16207;
  transform: translateY(-1px);
}

/* Floating Music */
.music-floating {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.music-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e7e5e4;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Layout */
.main-wrapper {
  max-width: 640px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 30px rgba(0,0,0,0.06);
  min-height: 100vh;
}

.hero-section {
  padding: 80px 24px 60px;
  color: #fff;
  text-align: center;
  background-size: cover;
  background-position: center;
}

.badge-pill {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.hero-heading {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 12px;
}

.hero-date, .hero-venue {
  font-size: 0.95rem;
  color: #e7e5e4;
}

.section {
  padding: 48px 24px;
  border-bottom: 1px solid #f5f5f4;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 24px;
  color: #1c1917;
}

.font-script {
  font-family: 'Great Vibes', cursive;
  font-size: 2.75rem;
}

/* Countdown */
.countdown-grid {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.cd-item {
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 10px;
  padding: 12px;
  min-width: 68px;
  text-align: center;
}

.cd-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #854d0e;
}

.cd-label {
  font-size: 0.75rem;
  color: #a16207;
  text-transform: uppercase;
}

.container-narrow {
  max-width: 440px;
  margin: 0 auto;
}

.desc-text {
  color: var(--text-muted);
  line-height: 1.7;
}

/* Couples */
.couples-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.couple-card {
  text-align: center;
}

.couple-photo {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fef08a;
  margin-bottom: 12px;
}

.couple-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  color: #1c1917;
}

.couple-parents {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.couple-ig {
  font-size: 0.8rem;
  color: #854d0e;
  font-weight: 600;
  margin-top: 4px;
}

.and-symbol {
  font-family: 'Great Vibes', cursive;
  font-size: 2.5rem;
  color: #ca8a04;
}

/* Event Cards */
.event-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.event-card {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.event-type {
  font-size: 1.2rem;
  font-weight: 700;
  color: #854d0e;
  margin-bottom: 8px;
}

.event-datetime {
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.event-loc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.gallery-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
}

/* Gift / Bank */
.bank-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-card {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}

.bank-name {
  font-weight: 700;
  color: #1c1917;
  font-size: 1.1rem;
}

.account-num {
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #854d0e;
  margin: 6px 0;
}

.account-holder {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.btn-copy {
  background: #fff;
  border: 1px solid #ca8a04;
  color: #ca8a04;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* RSVP Form */
.rsvp-form .form-group {
  margin-bottom: 16px;
}

.rsvp-form label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #44403c;
}

.rsvp-form input, .rsvp-form select, .rsvp-form textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d6d3d1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.btn-wa {
  display: inline-block;
  background: #25D366;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.footer {
  text-align: center;
  padding: 36px 20px;
  background: #1c1917;
  color: #d6d3d1;
  font-size: 0.85rem;
}

.footer-sub {
  font-size: 0.75rem;
  color: #a8a29e;
  margin-top: 4px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #1c1917;
  color: #fff;
  padding: 10px 20px;
  border-radius: 9999px;
  font-size: 0.85rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10000;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
`;

  // Generate JS
  const jsContent = `/* Standalone JavaScript for SURAT Invitation */

// Extract guest name from URL parameter "?to=Nama+Tamu"
(function initGuest() {
  var urlParams = new URLSearchParams(window.location.search);
  var guest = urlParams.get('to');
  var guestEl = document.getElementById('guestNameDisplay');
  if (guest && guestEl) {
    guestEl.textContent = guest;
  }
})();

// Open invitation
function openInvitation() {
  var overlay = document.getElementById('coverOverlay');
  if (overlay) {
    overlay.classList.add('opened');
  }
  // Play music if available
  var audio = document.getElementById('bgAudio');
  if (audio) {
    audio.play().catch(function(e) {
      console.log('Audio autoplay prevented:', e);
    });
  }
}

// Toggle audio
function toggleAudio() {
  var audio = document.getElementById('bgAudio');
  var icon = document.getElementById('musicIcon');
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    if (icon) icon.textContent = '🎵';
  } else {
    audio.pause();
    if (icon) icon.textContent = '🔇';
  }
}

// Countdown timer
(function initCountdown() {
  if (!window.EVENT_DATE) return;
  var targetDate = new Date(window.EVENT_DATE).getTime();

  function update() {
    var now = new Date().getTime();
    var diff = targetDate - now;

    if (diff <= 0) {
      var grid = document.getElementById('countdownGrid');
      if (grid) grid.innerHTML = '<p style="font-weight:600; color:#854d0e;">Acara Sedang Berlangsung / Telah Selesai</p>';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    var dEl = document.getElementById('cdDays');
    var hEl = document.getElementById('cdHours');
    var mEl = document.getElementById('cdMinutes');
    var sEl = document.getElementById('cdSeconds');

    if (dEl) dEl.textContent = days < 10 ? '0' + days : days;
    if (hEl) hEl.textContent = hours < 10 ? '0' + hours : hours;
    if (mEl) mEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    if (sEl) sEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  update();
  setInterval(update, 1000);
})();

// Copy account
function copyAccount(accNumber) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(accNumber).then(function() {
      showToast('Nomor rekening/bank ' + accNumber + ' berhasil disalin!');
    }).catch(function() {
      fallbackCopy(accNumber);
    });
  } else {
    fallbackCopy(accNumber);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Berhasil disalin: ' + text);
  } catch (err) {
    alert('Silakan salin manual: ' + text);
  }
  document.body.removeChild(ta);
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2500);
}

// RSVP submission
function submitRSVP(e) {
  e.preventDefault();
  var name = document.getElementById('rsvpName').value;
  var status = document.getElementById('rsvpStatus').value;
  var count = document.getElementById('rsvpCount').value;
  var wishes = document.getElementById('rsvpWishes').value;

  var item = {
    name: name,
    status: status,
    count: count,
    wishes: wishes,
    date: new Date().toISOString()
  };

  try {
    var stored = JSON.parse(localStorage.getItem('my_rsvps') || '[]');
    stored.unshift(item);
    localStorage.setItem('my_rsvps', JSON.stringify(stored));
  } catch (err) {}

  document.getElementById('rsvpForm').reset();
  var success = document.getElementById('rsvpSuccessMsg');
  if (success) success.style.display = 'block';
  showToast('Terima kasih, konfirmasi kehadiran berhasil dikirim!');
}
`;

  // README file with instructions in Indonesian
  const readmeContent = `=====================================================
PANDUAN WEBSITE UNDANGAN DIGITAL MANDIRI (STANDALONE)
Dibuat melalui Platform SURAT (https://surattt.netlify.app)
Order ID: ${order.id}
Slug: ${order.slug}
=====================================================

Website ini adalah paket web statis mandiri yang berdiri sendiri (self-contained).
Anda dapat meng-upload file ini ke hosting mana saja tanpa bergantung lagi pada platform utama SURAT!

STRUKTUR FILE:
- index.html        -> Halaman utama undangan digital
- css/style.css     -> Berkas gaya dan tampilan responsif mobile-first
- js/script.js      -> Berkas interaktivitas (countdown, cover buka undangan, musik, RSVP)
- README.txt        -> Panduan penggunaan ini

CARA MENG-UPLOAD KE HOSTING:

1. Netlify Drop (Gratis & Tercepat):
   - Buka https://app.netlify.com/drop
   - Tarik (drag & drop) folder hasil ekstrak ZIP ini ke dalam browser.
   - Website Anda langsung aktif dengan domain gratis seperti: https://undangan-saya.netlify.app

2. cPanel Hosting (Hosting Pribadi):
   - Masuk ke cPanel -> File Manager
   - Buka folder public_html (atau subdomain yang Anda inginkan)
   - Upload file ZIP ini lalu klik "Extract"
   - Pastikan file index.html berada di direktori tujuan

3. GitHub Pages:
   - Buat repositori baru di GitHub
   - Upload semua isi folder ini
   - Aktifkan GitHub Pages di menu Settings -> Pages

CARA MEMBAGIKAN DENGAN NAMA TAMU PERSONAL:
Format link:
https://domain-anda.com/?to=Nama+Tamu

Contoh:
https://domain-anda.com/?to=Budi+Santoso
Halaman pembuka akan otomatis menampilkan:
"Kepada Yth. Bapak/Ibu/Saudara/i Budi Santoso"

Salam hangat,
Tim SURAT Digital Indonesia
`;

  // Add files to ZIP
  zip.file('index.html', htmlContent);
  zip.file('css/style.css', cssContent);
  zip.file('js/script.js', jsContent);
  zip.file('README.txt', readmeContent);

  // Generate ZIP blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `${order.slug || 'undangan'}.zip`;
  saveAs(content, filename);
}

export const generateStandaloneWebsiteZip = generateInvitationZip;

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatIndoDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${day} ${months[monthIdx] || ''} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
