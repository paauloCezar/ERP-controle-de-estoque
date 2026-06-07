document.addEventListener("DOMContentLoaded", () => {

  // --- TELA DE LOGIN ---
  const loginForm = document.getElementById("menu__loginForm");

  if (loginForm) {
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const btnSubmit = document.querySelector(".menu__btn-entrar");
    const btnAlternar = document.getElementById("btnIrParaCadastro");

    const menuTitle = document.querySelector(".menu__title");
    const menuParagraph = document.querySelector(".menu__paragraph");
    const signupText = document.querySelector(".menu__signup-text");
    const mensagemErro = document.getElementById("menu__mensagemErro");

    let modoCadastro = false;

    if (btnAlternar) {
      btnAlternar.addEventListener("click", (e) => {
        e.preventDefault();
        mensagemErro.textContent = "";
        modoCadastro = !modoCadastro;

        if (modoCadastro) {
          menuTitle.textContent = "Primeiro Acesso";
          menuParagraph.textContent = "Crie seu usuário para acessar o sistema";
          btnSubmit.textContent = "Cadastrar";
          signupText.innerHTML = 'Já tem conta? <a href="#" id="btnIrParaCadastro">Faça Login</a>';
        } else {
          menuTitle.textContent = "Bem-vindo!";
          menuParagraph.textContent = "Entre para acessar o sistema";
          btnSubmit.textContent = "Entrar";
          signupText.innerHTML = 'Primeiro acesso? <a href="#" id="btnIrParaCadastro">Cadastre-se</a>';
        }
        revincularBotao();
      });
    }

    function revincularBotao() {
      const novoBtnAlternar = document.getElementById("btnIrParaCadastro");
      if (novoBtnAlternar) {
        novoBtnAlternar.addEventListener("click", (e) => {
          e.preventDefault();
          if (btnAlternar) btnAlternar.click();
        });
      }
    }

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      mensagemErro.textContent = "";

      const user = usuarioInput.value.trim();
      const pass = senhaInput.value;

      if (modoCadastro) {
        localStorage.setItem("erp_usuario", user);
        localStorage.setItem("erp_senha", pass);
        alert("Usuário cadastrado com sucesso! Agora faça o seu login.");
        if (btnAlternar) btnAlternar.click();
        loginForm.reset();
      } else {
        const usuarioSalvo = localStorage.getItem("erp_usuario");
        const senhaSalva = localStorage.getItem("erp_senha");

        if (!usuarioSalvo) {
          mensagemErro.textContent = "Nenhum usuário cadastrado. Clique em Cadastre-se.";
          return;
        }

        if (user === usuarioSalvo && pass === senhaSalva) {
          alert("Login efetuado com sucesso!");
          window.location.href = "dashboard.html";
        } else {
          mensagemErro.textContent = "Usuário ou senha incorretos!";
        }
      }
    });
  }
});