import json
import os

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify
from google.auth.transport import requests as google_requests
from google.oauth2 import service_account

app = Flask(__name__)


@app.route("/")
def index():
    service_account_info = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )

    credentials.refresh(google_requests.Request())

    response = jsonify({"token": credentials.token})
    response.headers.add("Access-Control-Allow-Origin", "*")

    return response


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
