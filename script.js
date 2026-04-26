import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2_Zijvaz6nnPQGM4fmJ0ByzQhJcySwKo",
  authDomain: "triviadorgame-44355.firebaseapp.com",
  databaseURL: "https://triviadorgame-44355-default-rtdb.europe-west1.firebasedatabase.app/", 
  projectId: "triviadorgame-44355",
  storageBucket: "triviadorgame-44355.firebasestorage.app",
  messagingSenderId: "538607991286",
  appId: "1:538607991286:web:17887d9f783141f90918f6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Întrebările tale din Python (am pus câteva exemple, poți adăuga restul)
const QUESTIONS = [
    { cat: "Istorie", q: "Cine a fost primul domnitor al Principatelor Unite?", a: ["Mihai Viteazul", "Alexandru Ioan Cuza", "Carol I", "Ștefan cel Mare"], c: "Alexandru Ioan Cuza" },
    { cat: "Geografie", q: "Care este capitala Canadei?", a: ["Toronto", "Vancouver", "Ottawa", "Montreal"], c: "Ottawa" },
    { cat: "Știință", q: "Care este simbolul chimic pentru aur?", a: ["Ag", "Au", "Fe", "Pb"], c: "Au" },
    { cat: "Sport", q: "În ce sport se folosește termenul de «Eseu» (Try)?", a: ["Fotbal", "Rugby", "Baschet", "Tenis"], c: "Rugby" }
];

let myRoom = null;
let myRole = null; // "p1" sau "p2"

window.creeazaCamera = function() {
    const code = Math.floor(1000 + Math.random() * 9000);
    myRoom = code;
    myRole = "p1";
    
    set(ref(db, 'rooms/' + code), {
        status: "waiting",
        p1Score: 0,
        p2Score: 0,
        currentQ: 0,
        answered: 0
    });
    
    alert("Camera creată! Cod: " + code);
    ascultaSchimbari(code);
};

window.intraInCamera = function() {
    const code = document.getElementById('roomCode').value;
    if(!code) return alert("Introdu codul!");
    myRoom = code;
    myRole = "p2";
    
    update(ref(db, 'rooms/' + code), { status: "active" });
    ascultaSchimbari(code);
};

function ascultaSchimbari(code) {
    onValue(ref(db, 'rooms/' + code), (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.status === "active") {
            document.getElementById('setup').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            afiseazaIntrebare(data.currentQ);
        }
        
        document.getElementById('my-score').innerText = (myRole === "p1") ? data.p1Score : data.p2Score;
    });
}

function afiseazaIntrebare(index) {
    const qData = QUESTIONS[index];
    document.getElementById('category-label').innerText = qData.cat;
    document.getElementById('question-text').innerText = qData.q;
    
    const divAns = document.getElementById('answers');
    divAns.innerHTML = "";
    
    qData.a.forEach(ans => {
        const b = document.createElement('button');
        b.innerText = ans;
        b.className = "btn";
        b.onclick = () => verificaRaspuns(ans, qData.c, index);
        divAns.appendChild(b);
    });
}

function verificaRaspuns(ales, corect, index) {
    let puncte = (ales === corect) ? 10 : 0;
    const roomRef = ref(db, 'rooms/' + myRoom);
    
    // Dezactivează butoanele după click
    document.getElementById('answers').innerHTML = "Așteptăm celălalt jucător...";

    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        let updateData = {};
        if (myRole === "p1") updateData.p1Score = data.p1Score + puncte;
        else updateData.p2Score = data.p2Score + puncte;
        
        // Trecem la următoarea întrebare dacă ambii au răspuns (simplificat aici)
        updateData.currentQ = (index + 1 < QUESTIONS.length) ? index + 1 : index;
        
        update(roomRef, updateData);
    }, { onlyOnce: true });
}