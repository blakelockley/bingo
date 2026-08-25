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

ADMIN_TOKEN = "nNxOJ9pg5W7p29VqpXzYYDTH"

TEAM_TOKENS = {
    "Qv4Z4Z0gbRavAqPcFRBog0uy": 1,
    "sdZDh77sKjv4Z4Z0gbZQo9yt": 2,
    "ZxiG4UG4V0IdZDh77sKMMQPg": 3,
    "6OUTwaBiXXiKrxlFog8B7eIa": 4,
}

TEAM_NAMES = {
    1: "The Happy Ol' Gooners (H.O.Gs)",
    2: "Hoggers",
    3: "Unknucky",
    4: "Poop Dealers",
}


@app.after_request
def add_cors_headers(response):
    # X-Token is a custom header, so browsers send a preflight OPTIONS
    # request first — it needs the same CORS headers as the real response.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "X-Token, Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


class RawTile(TypedDict):
    number: int
    region: int
    region_unlock: Optional[int]
    name: str
    description: str
    image: str
    bonus_requirements: Optional[list[int]]
    completed_1: bool
    completed_2: bool
    completed_3: bool
    completed_4: bool


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


class BonusDataItem(TypedDict):
    bonus_unlocked: bool
    bonus_required: int
    bonus_progress: int

    tile: Optional[Tile]


class Region(TypedDict):
    number: int
    tiles: list[Tile]


class AdminRegion(TypedDict):
    number: int
    tiles: list[RawTile]


def parse_raw_tiles(headers: list[str], rows: list[list[str]]) -> list[RawTile]:
    raw_tiles: list[RawTile] = []

    for row in rows:
        record = dict(zip_longest(headers, row, fillvalue=""))

        try:
            region_unlock = int(record["region_unlock"])
        except:
            region_unlock = None

        try:
            bonus_requirements = list(
                map(int, str(record["bonus_requirements"]).split(","))
            )
        except:
            bonus_requirements = None

        raw_tiles.append(
            {
                "number": int(record["number"]),
                "region": int(record["region"]),
                "region_unlock": region_unlock,
                "name": record["name"],
                "description": record["description"],
                "image": record["image"],
                "bonus_requirements": bonus_requirements,
                "completed_1": record["completed_1"] == "TRUE",
                "completed_2": record["completed_2"] == "TRUE",
                "completed_3": record["completed_3"] == "TRUE",
                "completed_4": record["completed_4"] == "TRUE",
            }
        )

    return raw_tiles


def build_admin_regions(raw_tiles: list[RawTile]) -> list[AdminRegion]:
    """
    Every region, unfiltered by unlock state, with each tile's raw
    completed_1..4 flags intact — for the admin token only.
    """

    regions: dict[int, AdminRegion] = {}

    for raw_tile in raw_tiles:
        if raw_tile["region"] not in regions:
            regions[raw_tile["region"]] = {"number": raw_tile["region"], "tiles": []}

        regions[raw_tile["region"]]["tiles"].append(raw_tile)

    return list(regions.values())


def build_tiles(raw_tiles: list[RawTile], team: Optional[int]):
    """
    Build tiles/regions for a given team. If `team` is None every tile's
    `completed` flag is forced to False — completion progress is per-team
    information and must never be exposed without a token.
    """

    team_field = f"completed_{team}" if team is not None else None

    tiles: list[Tile] = []
    tile_map: dict[int, Tile] = {}
    regions: dict[int, Region] = {}
    region_unlock_map: dict[int, int] = {}

    for raw_tile in raw_tiles:
        tile: Tile = {
            "number": raw_tile["number"],
            "region": raw_tile["region"],
            "region_unlock": raw_tile["region_unlock"],
            "name": raw_tile["name"],
            "description": raw_tile["description"],
            "image": raw_tile["image"],
            "bonus_requirements": raw_tile["bonus_requirements"],
            "completed": raw_tile[team_field] if team_field else False,
        }

        tiles.append(tile)
        tile_map[tile["number"]] = tile

        if tile["region"] not in regions:
            regions[tile["region"]] = {"number": tile["region"], "tiles": []}

        regions[tile["region"]]["tiles"].append(tile)

        if tile["region_unlock"] is not None:
            region_unlock_map[tile["number"]] = tile["region_unlock"]

    return tiles, tile_map, regions, region_unlock_map


def visible_region_numbers(
    tiles: list[Tile], region_unlock_map: dict[int, int]
) -> set[int]:
    visible = {0}

    for tile in tiles:
        if tile["completed"]:
            unlock = region_unlock_map.get(tile["number"])
            if unlock is not None:
                visible.add(unlock)

    return visible


def compute_bonus_data(
    tile_map: dict[int, Tile], bonus_tiles: list[Tile], visible_numbers: set[int]
) -> list[BonusDataItem]:
    bonus_data: list[BonusDataItem] = []

    for bonus_tile in bonus_tiles:
        bonus_requirements = bonus_tile["bonus_requirements"]
        bonus_required = len(bonus_requirements)

        bonus_visibility = 0
        bonus_progress = 0

        for tile_number in bonus_requirements:
            tile = tile_map[tile_number]

            if tile["region"] in visible_numbers:
                bonus_visibility += 1

            if tile["completed"]:
                bonus_progress += 1

        bonus_unlocked = bonus_required == bonus_visibility

        bonus_data.append(
            {
                "bonus_progress": bonus_progress,
                "bonus_required": bonus_required,
                "bonus_unlocked": bonus_unlocked,
                "bonus_visibility": bonus_visibility,
                "tile": bonus_tile if bonus_unlocked else None,
            }
        )

    return bonus_data


@app.route("/")
def index():
    client_token = request.headers.get("X-Token")
    team = TEAM_TOKENS.get(client_token)

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

    raw_tiles = parse_raw_tiles(headers, rows)

    if client_token == ADMIN_TOKEN:
        admin_regions = build_admin_regions(raw_tiles)

        # Admin sees the whole board, so every bonus tile's requirements
        # are considered visible — reveal them all rather than hiding any
        # behind per-team progress.
        tiles, tile_map, _, _ = build_tiles(raw_tiles, None)
        visible_numbers = {tile["region"] for tile in tiles}
        bonus_tiles = [tile for tile in tiles if tile["bonus_requirements"]]
        bonus_data = compute_bonus_data(tile_map, bonus_tiles, visible_numbers)

        return jsonify({"regions": admin_regions, "bonus_tiles": bonus_data})

    if team is not None:
        tiles, tile_map, regions, region_unlock_map = build_tiles(raw_tiles, team)
        visible_numbers = visible_region_numbers(tiles, region_unlock_map)
    else:
        # No/invalid token: don't error, just show only the regions every
        # team has unlocked (the intersection, not the union) — a region
        # only one team has reached shouldn't be spoiled for everyone else.
        visible_numbers = None

        for other_team in set(TEAM_TOKENS.values()):
            team_tiles, _, _, team_region_unlock_map = build_tiles(
                raw_tiles, other_team
            )
            team_visible = visible_region_numbers(team_tiles, team_region_unlock_map)
            visible_numbers = (
                team_visible
                if visible_numbers is None
                else visible_numbers & team_visible
            )

        visible_numbers = visible_numbers or {0}

        tiles, tile_map, regions, region_unlock_map = build_tiles(raw_tiles, None)

    visible_regions = [
        regions[number] for number in visible_numbers if number in regions
    ]

    bonus_tiles = [tile for tile in tiles if tile["bonus_requirements"]]
    bonus_data = compute_bonus_data(tile_map, bonus_tiles, visible_numbers)

    return jsonify(
        {
            "regions": visible_regions,
            "bonus_tiles": bonus_data,
            "team": (
                {
                    "number": team,
                    "name": TEAM_NAMES[team],
                    "score": sum(1 for tile in tiles if tile["completed"]),
                }
                if team
                else None
            ),
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
