// Customer page logic
(async function(){
  const { db } = window.NakliyeShared;

  const form = document.querySelector('#requestForm');
  const successBox = document.querySelector('#successBox');
  const errorBox = document.querySelector('#errorBox');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    errorBox.textContent = '';
    successBox.textContent = '';

    const data = Object.fromEntries(new FormData(form).entries());

    // Convert numeric
    data.weightKg = Number(data.weightKg||0);
    data.volumeM3 = Number(data.volumeM3||0);

    // Metadata
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = 'pending';

    try{
      await db.collection('requests').add(data);
      form.reset();
      successBox.textContent = 'Talebiniz alınmıştır. Ekibimiz en kısa sürede sizinle iletişime geçecektir.';
      window.scrollTo({top:0, behavior:'smooth'});
    }catch(err){
      console.error(err);
      errorBox.textContent = 'Bir hata oluştu. Lütfen tekrar deneyiniz.';
    }
  });
})();