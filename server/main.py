import json
import os
from typing import Optional, TypedDict
import requests

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import service_account

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    # X-Token is a custom header, so browsers send a preflight OPTIONS
    # request first — it needs the same CORS headers as the real response.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "X-Token, Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


SPREADSHEET_ID = "1nTDDOllO7VVZhH5sgdm6snsHYNBQUWjc7Ks9UvXWTt4"
RANGE = "A1:Z65"

TOKEN_TEAM_1 = "6OUiKrxlFog8TwaBZDh77sKG"
TOKEN_TEAM_2 = "QqoRasBp4tuBog0uiXXB7eIa"
TOKEN_TEAM_3 = "ZxiId4UG4V0MMQPg4Z4Z0gby"
TOKEN_TEAM_4 = "sJHjvucPS3gZQo9yvAqPcFR6"

# token -> which "completed_N" / team slot it identifies
TEAM_TOKENS = {
    TOKEN_TEAM_1: 1,
    TOKEN_TEAM_2: 2,
    TOKEN_TEAM_3: 3,
    TOKEN_TEAM_4: 4,
}


class Tile(TypedDict):
    number: int
    region_unlock: Optional[int]
    name: str
    description: str
    image: str
    completed_1: bool
    completed_2: bool
    completed_3: bool
    completed_4: bool


class Region(TypedDict):
    number: int
    tiles: list[Tile]


@app.route("/")
def index():
    client_token = request.headers.get("X-Token")
    team = TEAM_TOKENS.get(client_token)

    if team is None:
        return jsonify({"error": "Invalid or missing token"}), 401

    team_field = f"completed_{team}"

    service_account_info = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )

    credentials.refresh(google_requests.Request())

    google_token = credentials.token

    sheet_response = requests.get(
        f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{RANGE}",
        headers={"Authorization": f"Bearer {google_token}"},
    )
    sheet_response.raise_for_status()

    values = sheet_response.json().get("values", [])
    headers, *rows = values

    tiles: list[Tile] = []
    regions: dict[int, Region] = {}
    region_unlock_map: dict[int, int] = {}

    for row in rows:
        record = dict(zip(headers, row))
        region_number = int(record["region"])

        try:
            region_unlock = int(record["region_unlock"])
        except:
            region_unlock = None

        tile: Tile = {
            "number": int(record["number"]),
            "region_unlock": region_unlock,
            "name": record["name"],
            "description": record["description"],
            "image": record["image"],
            "completed_1": record["completed_1"] == "TRUE",
            "completed_2": record["completed_2"] == "TRUE",
            "completed_3": record["completed_3"] == "TRUE",
            "completed_4": record["completed_4"] == "TRUE",
        }

        tiles.append(tile)

        if region_number not in regions:
            regions[region_number] = {"number": region_number, "tiles": []}

        regions[region_number]["tiles"].append(tile)

        if region_unlock := tile.get("region_unlock"):
            region_unlock_map[tile["number"]] = region_unlock

    completed_tiles = filter(lambda tile: tile[team_field], tiles)

    visible_regions: list[Region] = [regions[0]]

    for tile in completed_tiles:
        if region_number := region_unlock_map.get(tile["number"]):
            visible_regions.append(regions[region_number])

    return jsonify({"regions": visible_regions})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
