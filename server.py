from flask import Flask, render_template, request, jsonify
from markupsafe import escape
from flask import request
import base64
from io import BytesIO
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras import layers
import tensorflow as tf
from PIL import Image
import numpy as np

app = Flask(__name__)


@app.route("/")
@app.route("/index")
def index():
    return render_template('index.html')

@app.route('/predizer', methods=['POST'])
def predizer():
    IMG_SIZE = 28
    # Converta a imagem codificada em base64 para um objeto de imagem PIL
    data = request.json['imagem']
    header, encoded = data.split(",", 1)
    binary_data = base64.b64decode(encoded)

    with BytesIO(binary_data) as stream:
        with Image.open(stream) as img:
            # Processa a imagem para a predição
            resize_and_rescale = tf.keras.Sequential([
                layers.Resizing(IMG_SIZE, IMG_SIZE),
                layers.Rescaling(1./255)
            ])
            model = load_model('modelo2.keras')
            # Supondo que a imagem é RGBA, extrair o canal alfa
            posImage = np.array(img)[:, :, 3]
            posImage = np.expand_dims(posImage, axis=-1)
            posImage = resize_and_rescale(posImage)
            posImage = np.expand_dims(posImage, axis=0)
            prediction = model.predict(posImage)
            # Responda com a predição
            probabilities = {str(i): round(float(prediction[0][i]), 3) for i in range(10)}
            return jsonify(probabilities)


@app.route('/salvar_desenho', methods=['POST'])
def salvar_desenho():
    data = request.json['imagem']
    # Remover o cabeçalho da string de imagem codificada em base64
    image_data = data.split(';base64,')[1]
    # Decodificar a imagem
    decoded_image = base64.b64decode(image_data)
    # Converter a imagem decodificada para um objeto de imagem que possa ser salvo
    image = Image.open(BytesIO(decoded_image))
    # Salvar a imagem ou fazer qualquer outra coisa necessária
    image.save('desenho.png', 'PNG')
    return 'Desenho salvo com sucesso!', 200

if __name__ == "__main__":
    app.run()
