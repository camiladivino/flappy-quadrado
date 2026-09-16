// ==========================================
// ELEMENTOS HTML
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");


// ==========================================
// CONFIGURAÇÕES DO JOGO
// ==========================================

const LARGURA_PERSONAGEM = 50;
const ALTURA_PERSONAGEM = 50;

const LARGURA_CANO = 60;
const ESPACO_ENTRE_CANOS = 160;


// ==========================================
// IMAGENS
// ==========================================

const birdImg = new Image();
birdImg.src = "bird.png";

const pipeTopImg = new Image();
pipeTopImg.src = "pipe_top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe_bottom.png";


// ==========================================
// CARREGAMENTO DAS IMAGENS
// ==========================================

let imagensCarregadas = 0;

const totalImagens = 3;

startBtn.disabled = true;
startBtn.textContent = "Carregando...";


function imagemCarregada() {

    imagensCarregadas++;

    if (imagensCarregadas === totalImagens) {

        startBtn.disabled = false;

        startBtn.textContent = "Iniciar Jogo";
    }
}


birdImg.onload = imagemCarregada;

pipeTopImg.onload = imagemCarregada;

pipeBottomImg.onload = imagemCarregada;


// ==========================================
// VARIÁVEIS DO JOGO
// ==========================================

let birdX;
let birdY;

let gravity;
let velocity;
let jump;

let pipes;

let score;

let gameOver;

let jogoRodando = false;

let animacaoId = null;

let pipeIntervalId = null;


// ==========================================
// RESETAR JOGO
// ==========================================

function resetarVariaveis() {

    birdX = 60;

    birdY = 250;

    gravity = 0.25;

    velocity = 0;

    jump = -5;

    pipes = [];

    score = 0;

    gameOver = false;
}


// ==========================================
// CRIAR CANO
// ==========================================

function criarCano() {

    const alturaMinima = 80;

    const alturaMaxima =
        canvas.height -
        ESPACO_ENTRE_CANOS -
        100;


    const altura =
        Math.floor(
            Math.random() *
            (alturaMaxima - alturaMinima)
        ) + alturaMinima;


    pipes.push({

        x: canvas.width,

        height: altura,

        width: LARGURA_CANO,

        gap: ESPACO_ENTRE_CANOS,

        passou: false

    });
}


// ==========================================
// COLISÃO
// ==========================================

function colisao(cano) {

    const birdDireita =
        birdX + LARGURA_PERSONAGEM;


    const birdBaixo =
        birdY + ALTURA_PERSONAGEM;


    const canoDireita =
        cano.x + cano.width;


    const inicioCanoBaixo =
        cano.height + cano.gap;


    const dentroHorizontal =
        birdDireita > cano.x &&
        birdX < canoDireita;


    const bateuCanoTopo =
        birdY < cano.height;


    const bateuCanoBaixo =
        birdBaixo > inicioCanoBaixo;


    const bateuCano =
        dentroHorizontal &&
        (
            bateuCanoTopo ||
            bateuCanoBaixo
        );


    const bateuChao =
        birdBaixo >= canvas.height;


    const bateuTeto =
        birdY <= 0;


    return (
        bateuCano ||
        bateuChao ||
        bateuTeto
    );
}


// ==========================================
// TELA DE GAME OVER
// ==========================================

function mostrarGameOver() {

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.65)";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign = "center";


    ctx.fillStyle = "white";


    ctx.font =
        "bold 32px Arial";


    ctx.fillText(
        "Fim de jogo!",
        canvas.width / 2,
        280
    );


    ctx.font =
        "24px Arial";


    ctx.fillText(
        "Pontuação: " + score,
        canvas.width / 2,
        330
    );


    ctx.textAlign = "start";


    startBtn.style.display =
        "inline-block";


    startBtn.textContent =
        "Jogar Novamente";
}


// ==========================================
// LOOP PRINCIPAL
// ==========================================

function desenhar() {

    // Se acabou o jogo
    if (gameOver) {

        jogoRodando = false;


        if (pipeIntervalId) {

            clearInterval(
                pipeIntervalId
            );

            pipeIntervalId = null;
        }


        mostrarGameOver();

        return;
    }


    // Limpa a tela
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ======================================
    // FÍSICA DO PÁSSARO
    // ======================================

    velocity += gravity;

    birdY += velocity;


    // Desenha o pássaro
    ctx.drawImage(

        birdImg,

        birdX,

        birdY,

        LARGURA_PERSONAGEM,

        ALTURA_PERSONAGEM

    );


    // ======================================
    // CANOS
    // ======================================

    pipes.forEach((cano) => {

        // Move o cano para a esquerda
        cano.x -= 2.5;


        // CANO SUPERIOR

        ctx.drawImage(

            pipeTopImg,

            cano.x,

            0,

            cano.width,

            cano.height

        );


        // CANO INFERIOR

        const inicioCanoBaixo =
            cano.height +
            cano.gap;


        const alturaCanoBaixo =
            canvas.height -
            inicioCanoBaixo;


        ctx.drawImage(

            pipeBottomImg,

            cano.x,

            inicioCanoBaixo,

            cano.width,

            alturaCanoBaixo

        );


        // ==================================
        // COLISÃO
        // ==================================

        if (colisao(cano)) {

            gameOver = true;
        }


        // ==================================
        // PONTUAÇÃO
        // ==================================

        if (
            !cano.passou &&
            cano.x + cano.width < birdX
        ) {

            cano.passou = true;

            score++;
        }

    });


    // ======================================
    // REMOVE CANOS QUE SAÍRAM DA TELA
    // ======================================

    pipes = pipes.filter(

        cano =>
            cano.x +
            cano.width >
            0

    );


    // ======================================
    // MOSTRA PONTUAÇÃO
    // ======================================

    ctx.fillStyle = "white";

    ctx.strokeStyle = "black";

    ctx.lineWidth = 4;

    ctx.font =
        "bold 22px Arial";


    const texto =
        "Pontuação: " + score;


    ctx.strokeText(
        texto,
        10,
        30
    );


    ctx.fillText(
        texto,
        10,
        30
    );


    // Próximo frame
    animacaoId =
        requestAnimationFrame(
            desenhar
        );
}


// ==========================================
// PULO
// ==========================================

function pular() {

    if (
        jogoRodando &&
        !gameOver
    ) {

        velocity = jump;
    }
}


// ==========================================
// BARRA DE ESPAÇO
// ==========================================

document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.code === "Space"
        ) {

            evento.preventDefault();

            pular();
        }

    }
);


// ==========================================
// CLIQUE NO CANVAS TAMBÉM PULA
// ==========================================

canvas.addEventListener(
    "click",
    () => {

        pular();

    }
);


// ==========================================
// INICIAR PARTIDA
// ==========================================

function iniciarJogo() {

    // Limpa intervalo antigo
    if (pipeIntervalId) {

        clearInterval(
            pipeIntervalId
        );

        pipeIntervalId = null;
    }


    // Cancela animação antiga
    if (animacaoId) {

        cancelAnimationFrame(
            animacaoId
        );

        animacaoId = null;
    }


    resetarVariaveis();


    jogoRodando = true;


    // Cria primeiro cano
    criarCano();


    // Cria novos canos
    pipeIntervalId =
        setInterval(
            () => {

                if (!gameOver) {

                    criarCano();
                }

            },

            2000
        );


    desenhar();
}


// ==========================================
// BOTÃO INICIAR
// ==========================================

startBtn.addEventListener(
    "click",
    () => {

        if (startBtn.disabled) {

            return;
        }


        startBtn.style.display =
            "none";


        let contagem = 3;


        countdownEl.textContent =
            contagem;


        const intervalo =
            setInterval(
                () => {

                    contagem--;


                    if (
                        contagem > 0
                    ) {

                        countdownEl
                            .textContent =
                            contagem;

                    }

                    else {

                        clearInterval(
                            intervalo
                        );


                        countdownEl
                            .textContent =
                            "VAI!";


                        setTimeout(
                            () => {

                                countdownEl
                                    .textContent =
                                    "";

                            },

                            500
                        );


                        iniciarJogo();
                    }

                },

                1000
            );

    }
);


// ==========================================
// TELA INICIAL
// ==========================================

resetarVariaveis();


ctx.fillStyle = "white";

ctx.textAlign = "center";

ctx.font = "22px Arial";


ctx.fillText(

    "Clique em Iniciar Jogo",

    canvas.width / 2,

    canvas.height / 2

);


ctx.textAlign = "start";