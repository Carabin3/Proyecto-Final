const btnRegister = document.querySelector('.btn-secundario');
const FormStep = document.querySelectorAll('.form-step');
const btn_prevent = document.querySelector('.prevent');

let ForstepsNum = 0;

btnRegister.addEventListener('click', (e) =>{
    e.preventDefault(); 
    ForstepsNum++;
    updateformssteps();
});



btn_prevent.addEventListener('click', (e)=>{
    e.preventDefault();
        ForstepsNum--;
    updateformssteps();

})

function updateformssteps(){
FormStep.forEach(form=>{
if(form.classList.contains('Active')){
    form.classList.remove('Active')
}
})


   FormStep[ForstepsNum].classList.add('Active');
}




const dirijir =  document.getElementById('reset');


dirijir.addEventListener('click' , (e)=>{
 e.preventDefault();

 window.location.href="/recuperar.html"
 
 
});
