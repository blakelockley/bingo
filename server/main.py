import json
import os
from typing import Optional, TypedDict
import requests
from itertools import zip_longest

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import service_account

app = Flask(__name__)


SPREADSHEET_ID = "1nTDDOllO7VVZhH5sgdm6snsHYNBQUWjc7Ks9UvXWTt4"
RANGE = "A1:Z65"

TEAM_TOKENS = {
    "6OUiKrxlFog8TwaBZDh77sKG": 1,
    "QqoRasBp4tuBog0uiXXB7eIa": 2,
    "ZxiId4UG4V0MMQPg4Z4Z0gby": 3,
    "sJHjvucPS3gZQo9yvAqPcFR6": 4,
}


@app.after_request
def add_cors_headers(response):
    # X-Token is a custom header, so browsers send a preflight OPTIONS
    # request first — it needs the same CORS headers as the real response.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "X-Token, Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


class Tile(TypedDict):
    number: int
    region: int
    region_unlock: Optional[int]
    name: str
    description: str
    image: str
    bonus_requirements: list[int]

    # Computed
    completed: bool


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
    bonus_tiles: list[Tile] = []
    regions: dict[int, Region] = {}
    region_unlock_map: dict[int, int] = {}

    for row in rows:
        record = dict(zip_longest(headers, row, fillvalue=""))
        region_number = int(record["region"])

        print(f"{record=}")

        try:
            region_unlock = int(record["region_unlock"])
        except:
            region_unlock = None

        try:
            bonus_requirments = list(
                map(int, str(record["bonus_requirements"]).split(","))
            )
        except:
            bonus_requirments = []

        tile: Tile = {
            "number": int(record["number"]),
            "region_unlock": region_unlock,
            "region": region_number,
            "name": record["name"],
            "description": record["description"],
            "image": record["image"],
            "completed": record[team_field] == "TRUE",
            "bonus_requirements": bonus_requirments,
        }

        tiles.append(tile)

        if tile["bonus_requirements"]:
            bonus_tiles.append(tile)

        if region_number not in regions:
            regions[region_number] = {"number": region_number, "tiles": []}

        regions[region_number]["tiles"].append(tile)

        if region_unlock := tile.get("region_unlock"):
            region_unlock_map[tile["number"]] = region_unlock

    completed_tiles = filter(lambda tile: tile["completed"], tiles)

    visible_regions: list[Region] = [regions[0]]

    for tile in completed_tiles:
        if region_number := region_unlock_map.get(tile["number"]):
            visible_regions.append(regions[region_number])

    return jsonify({"regions": visible_regions, "bonus_tiles": bonus_tiles})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
