import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore, 
  doc,
  addDoc,
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4dnQnhvlwtCp2-frCEKIAPYeex_PUTXs",
  authDomain: "projeto-a71e2.firebaseapp.com",
  projectId: "projeto-a71e2",
  storageBucket: "projeto-a71e2.firebasestorage.app",
  messagingSenderId: "1077864959827",
  appId: "1:1077864959827:web:e48b7ac5ec0ca39d6e1ba6" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
};

// --------------------------------------------------------------------------

// Gerar ID
export function gerarID() { 
  return Math.random().toString(36).substring(2, 6); 
}

export function loop() {
  let loop = document.createElement('div');
  loop.classList.add('loop');
  loop.innerHTML = '<img src="carregando.gif" class="gif" width="120px">';
  document.body.prepend(loop);
}

export function remove_loop() {
  document.querySelector('.loop')?.remove();
}

// Solicita permissão para notificações na inicialização
function solicitarPermissaoNotificacao() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// --- Tela | Home ---
if (window.location.pathname.includes('index.html')) {
  solicitarPermissaoNotificacao();
  
  let usuario = 'user1';

  let btnEnviar = document.querySelector('.btnEnviar');
  btnEnviar.onclick = () => { enviarMSG(); };

  // Permite enviar mensagem pressionando Enter
  let inputChat = document.querySelector('.inputChat');
  inputChat.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMSG();
  });

  async function enviarMSG() {
    let texto = inputChat.value.trim();
    
    if (texto === '') {
      alert('Preencha um texto');
      return;
    }

    inputChat.value = '';

    await addDoc(collection(db, "conversa"), {
      usuario: usuario,
      mensagem: texto,
      dataHora: serverTimestamp()
    });
  }

  // Monitora o chat em tempo real
  let carregamentoInicial = true;

  function escutarMensagens() {
    let consultaComFiltro = query(collection(db, "conversa"), orderBy("dataHora", "asc"));

    onSnapshot(consultaComFiltro, (snapshot) => {
      let conversa = document.querySelector('.conversa');
      conversa.innerHTML = '';

      // Verifica alterações para enviar notificações de novas mensagens
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !carregamentoInicial) {
          let novaMsg = change.doc.data();

          if (document.hidden && Notification.permission === "granted") {
            new Notification(`Nova mensagem de ${novaMsg.usuario || 'Usuário'}`, {
              body: novaMsg.mensagem,
              icon: 'carregando.gif'
            });
          }
        }
      });

      // Renderiza a lista de mensagens na tela
      snapshot.forEach(doc => {
        let dados = doc.data();
        let usuarioMsg = dados.usuario;
        let mensagem = dados.mensagem;
        
        let dataFinal = '';
        if (dados.dataHora) {
          let data = dados.dataHora.toDate();
          let dataFormatada = data.toLocaleString('pt-BR');
          dataFinal = 'Data: ' + dataFormatada.slice(0, 10) + ' Hora: ' + dataFormatada.slice(12);
        }

        let MSG = document.createElement('p');
        MSG.classList.add('MSG');
        if (usuarioMsg) MSG.classList.add(usuarioMsg);
        
        MSG.innerHTML = `
          ${mensagem}
          <p style='font-size:12px;'>${dataFinal}</p>
        `;
        conversa.append(MSG);
      });

      conversa.scrollTop = conversa.scrollHeight;
      carregamentoInicial = false;
    });
  }

  escutarMensagens();
}