document.addEventListener('DOMContentLoaded', () => {
  const pokeball = document.querySelector('.pokeball');
  const formContainer = document.querySelector('#pokemonSearchFormContainer');
  const handleClick = () => {
    pokeball.classList.add('start-animation');
    pokeball.addEventListener('animationend', () => {
      pokeball.style.display = 'none';
      formContainer.style.display = 'block'; 
    }, { once: true });
    document.body.removeEventListener('click', handleClick);
  };
  document.body.addEventListener('click', handleClick);
});