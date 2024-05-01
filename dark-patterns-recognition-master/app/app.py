from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from joblib import load
import os

presence_classifier = load(r'C:\Users\Priyeshwar\Documents\UI[1]\UI\dark-patterns-recognition-new\dark-patterns-recognition-master\api\presence_classifier.joblib')
presence_vect = load(r'C:\Users\Priyeshwar\Documents\UI[1]\UI\dark-patterns-recognition-new\dark-patterns-recognition-master\api\presence_vectorizer.joblib')
category_vect = load(r'C:\Users\Priyeshwar\Documents\UI[1]\UI\dark-patterns-recognition-new\dark-patterns-recognition-master\api\category_vectorizer.joblib')
category_classifier = load(r'C:\Users\Priyeshwar\Documents\UI[1]\UI\dark-patterns-recognition-new\dark-patterns-recognition-master\api\category_classifier.joblib')

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        output = []
        data = request.get_json().get('tokens')

        category_count = {}  # Dictionary to store category counts

        for token in data:
            result = presence_classifier.predict(presence_vect.transform([token]))
            if result == 'Dark':
                cat = category_classifier.predict(category_vect.transform([token]))
                output.append(cat[0])
            else:
                output.append(result[0])

            # Count category occurrences
            category_count[output[-1]] = category_count.get(output[-1], 0) + 1

        # Print category counts
        print("Category Counts:")
        for category, count in category_count.items():
            print(f"{category}: {count}")

        with open('output_template.html', 'w') as file:
            file.write(render_template('output_template.html', category_count=category_count))

        os.system('start output_template.html')  # Open the file in the default browser

        return jsonify({'message': 'Output saved to output.html'})

if __name__ == '__main__':
    app.run(threaded=True, debug=True)
