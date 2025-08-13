// Admin panel logic
(async function(){
  const { auth, db, formatPhoneForWa, encodeQuery, renderStatusBadge, autoSuggestVehicle } = window.NakliyeShared;

  const loginCard = document.querySelector('#loginCard');
  const panelCard = document.querySelector('#panelCard');
  const loginForm = document.querySelector('#loginForm');
  const logoutBtn = document.querySelector('#logoutBtn');
  const tableBody = document.querySelector('#requestsBody');
  const fleetSelect = document.querySelector('#fleetSelect');
  const approveBtn = document.querySelector('#approveBtn');
  const markDoneBtn = document.querySelector('#markDoneBtn');
  const refreshBtn = document.querySelector('#refreshBtn');
  const selectedIdEl = document.querySelector('#selectedId');
  const waPreview = document.querySelector('#waPreview');
  const waOpenBtn = document.querySelector('#waOpenBtn');
  const mailLink = document.querySelector('#mailLink');
  const suggestBtn = document.querySelector('#suggestBtn');

  let selectedDoc = null;
  let fleet = [];

  // Load vehicles.json
  fetch('./vehicles.json').then(r=>r.json()).then(v=>{
    fleet = v;
    v.forEach(item=>{
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.id} • ${item.name} • ${item.payload_kg}kg • ${item.volume_m3}m³`;
      fleetSelect.appendChild(opt);
    });
  });

  auth.onAuthStateChanged(user=>{
    if(user){
      loginCard.style.display='none';
      panelCard.style.display='block';
      loadRequests();
    }else{
      loginCard.style.display='block';
      panelCard.style.display='none';
    }
  });

  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    try{
      await auth.signInWithEmailAndPassword(email, password);
    }catch(err){
      if(err.code==='auth/user-not-found'){
        // Auto create admin if not exists (first time use)
        await auth.createUserWithEmailAndPassword(email, password);
      }else{
        alert(err.message);
      }
    }
  });

  logoutBtn.addEventListener('click', ()=> auth.signOut());

  async function loadRequests(){
    const snap = await db.collection('requests').orderBy('createdAt','desc').get();
    tableBody.innerHTML='';
    snap.forEach(doc=>{
      const d = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.fullName||''}<br><small class="whatsapp">${d.phone||''}</small><br><small>${d.email||''}</small></td>
        <td><strong>${d.itemType||''}</strong><br><small>${d.itemDesc||''}</small><br>
            <small>Ağırlık: ${d.weightKg||0} kg • Hacim: ${d.volumeM3||0} m³</small></td>
        <td><small>${d.fromAddress||''}</small><br>→<br><small>${d.toAddress||''}</small></td>
        <td>${d.date||''} ${d.time||''}</td>
        <td>${renderStatusBadge(d.status||'pending')}</td>
        <td>
          <button class="btn btn-secondary btn-sm" data-id="${doc.id}">Seç</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // attach handlers
    tableBody.querySelectorAll('button[data-id]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-id');
        const docRef = db.collection('requests').doc(id);
        const d = (await docRef.get()).data();
        selectedDoc = {id, ref:docRef, data:d};
        selectedIdEl.textContent = id;

        // Suggest vehicle
        if(fleet.length>0){
          const sug = autoSuggestVehicle(fleet, Number(d.weightKg||0), Number(d.volumeM3||0));
          if(sug){
            fleetSelect.value = sug.id;
          }
        }

        updatePreview();
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
  }

  function updatePreview(){
    if(!selectedDoc){ waPreview.textContent=''; return; }
    const d = selectedDoc.data;
    const assigned = fleetSelect.value ? fleet.find(f=>f.id===fleetSelect.value) : null;
    const msg = `Sayın ${d.fullName||''}, ${d.date||''} ${d.time||''} tarihinde ${d.itemType||''} (${d.weightKg||0}kg, ${d.volumeM3||0}m³) nakliyeniz için aracınız atandı: ${assigned?assigned.name+' ('+assigned.id+')': 'Belirlenecek'}. Çıkış: ${d.fromAddress||''} → Varış: ${d.toAddress||''}. İletişim: ${d.email||''} - ${d.phone||''}`;
    waPreview.value = msg;
    const waPhone = formatPhoneForWa(d.phone||'');
    waOpenBtn.dataset.href = `https://wa.me/${waPhone}?text=${encodeQuery(msg)}`;
    mailLink.href = `mailto:${(d.email||'')}?subject=${encodeQuery('Nakliye Onay Bilgisi')}&body=${encodeQuery(msg)}`;
  }

  fleetSelect.addEventListener('change', updatePreview);
  suggestBtn.addEventListener('click', updatePreview);

  waOpenBtn.addEventListener('click', ()=>{
    const href = waOpenBtn.dataset.href;
    if(!href || href.endsWith('/?text=')){ alert('Telefon numarası eksik veya hatalı.'); return; }
    window.open(href, '_blank');
  });

  approveBtn.addEventListener('click', async ()=>{
    if(!selectedDoc){ alert('Önce bir talep seçiniz.'); return; }
    await selectedDoc.ref.update({ status:'approved', assignedVehicle: fleetSelect.value||null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    updatePreview();
    alert('Talep onaylandı ve işaretlendi.');
    location.reload();
  });

  markDoneBtn.addEventListener('click', async ()=>{
    if(!selectedDoc){ alert('Önce bir talep seçiniz.'); return; }
    await selectedDoc.ref.update({ status:'done', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    alert('Talep tamamlandı olarak işaretlendi.');
    location.reload();
  });

  refreshBtn.addEventListener('click', loadRequests);
})();