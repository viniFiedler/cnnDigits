document.addEventListener("DOMContentLoaded", function() {
    let canvas = document.getElementById('desenhoQuad');
    let ctx = canvas.getContext('2d');
    let painting = false;
    let erasing = false;
    let brushSize = 20; // Tamanho padrão do pincel

    function startPosition(e) {
        painting = true;
        if (erasing) {
            erase(e);
        } else {
            draw(e);
        }
    }

    function finishedPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
    if (!painting) return;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    // Ajusta as coordenadas do mouse com o deslocamento da página
    var x = e.clientX - canvas.offsetLeft + window.scrollX;
    var y = e.clientY - canvas.offsetTop + window.scrollY;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function erase(e) {
    if (!painting) return;
    // Ajusta as coordenadas do mouse com o deslocamento da página
    var x = e.clientX - canvas.offsetLeft + window.scrollX;
    var y = e.clientY - canvas.offsetTop + window.scrollY;

    // Limpa um quadrado onde o mouse está, efetivamente apagando o que está ali
    ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize * 3, brushSize * 3);
}


    // Event listeners para o canvas
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', function(e) {
        if (erasing) {
            erase(e);
        } else {
            draw(e);
        }
    });

    // Event listeners para os botões
    document.getElementById('btnDesenhar').addEventListener('click', function() {
        erasing = false;
    });

    document.getElementById('btnApagar').addEventListener('click', function() {
        erasing = true;
    });

    function enviarDesenho() {
    var canvas = document.getElementById('desenhoQuad');
    var imageData = canvas.toDataURL('image/png'); // Converte a imagem do canvas para formato PNG

    // Enviar a imagem codificada em base64 para o servidor usando AJAX
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/salvar_desenho', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ imagem: imageData }));

    xhr.onload = function() {
        if (xhr.status == 200) {
            alert('Desenho enviado com sucesso!');
        } else {
            alert('Erro ao enviar o desenho.');
        }
    };
}

// Você pode chamar essa função quando um botão for clicado, por exemplo:
document.getElementById('btnEnviar').addEventListener('click', enviarDesenho);
});
document.getElementById('btnLimpar').addEventListener('click', function() {
    var canvas = document.getElementById('desenhoQuad');
    var ctx = canvas.getContext('2d');
    // Limpa todo o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

setInterval(function() {
    var canvas = document.getElementById('desenhoQuad');
    var imageData = canvas.toDataURL('image/png'); // Converte a imagem do canvas para formato PNG

    // Enviar a imagem codificada em base64 para o servidor usando AJAX
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/predizer', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ imagem: imageData }));

    xhr.onload = function() {
        if (xhr.status == 200) {
            // Converte a resposta em JSON
            var response = JSON.parse(xhr.responseText);
            var listaProbabilidades = document.getElementById('listaProbabilidades');
            listaProbabilidades.innerHTML = ''; // Limpa a lista antiga

            // Encontra a maior probabilidade
            let maxProb = Math.max(...Object.values(response));

            // Adiciona cada probabilidade à lista
            Object.entries(response).forEach(([key, value]) => {
                var li = document.createElement('li');
                li.textContent = `${key} : ${value.toFixed(3)}`; // Formata a saída para três casas decimais
                // Se a probabilidade atual for a maior, destaca em vermelho
                if (value === maxProb) {
                    li.style.color = 'red';
                }
                listaProbabilidades.appendChild(li);
            });
        } else {
            console.error('Erro ao receber as probabilidades.');
        }
    };
}, 500); // Atualiza a cada 0,5 segundos
; // Atualiza a cada 0,5 segundos


