import os
import json
from itertools import zip_longest
from typing import Optional, TypedDict

import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import service_account

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
RANGE = "A1:Z65"


class Tile(TypedDict):
    number: int
    region: int
    region_unlock: Optional[int]
    name: str
    description: str
    image: str
    bonus_requirements: Optional[list[int]]
    min_proofs: int

    # Computed
    completed: bool


class SheetsAPI:
    def __init__(self):
        service_account_info = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])

        self.credentials = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=["https://www.googleapis.com/auth/spreadsheets"],
        )

        self.credentials.refresh(google_requests.Request())

    def read(self, range: str):
        """
        Read a range of values from the spreadsheet
        NOTE: `row` will be 1 larger than the actual tile number due to header row in spreadsheet.
        """

        res = requests.get(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{range}",
            headers={"Authorization": f"Bearer {self.credentials.token}"},
        )

        return res

    def read_tiles(self, team: int) -> list[Tile]:
        """
        Read and parse the tile data for a given team, same shape/logic as
        server/main.py's index() route.
        """

        res = self.read(RANGE)
        res.raise_for_status()

        values = res.json().get("values", [])
        headers, *rows = values

        team_field = f"completed_{team}"
        tiles: list[Tile] = []

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

            try:
                min_proofs = int(record["min_proofs"])
            except:
                min_proofs = 1

            tile: Tile = {
                "number": int(record["number"]),
                "region": int(record["region"]),
                "region_unlock": region_unlock,
                "name": record["name"],
                "description": record["description"],
                "image": record["image"],
                "completed": record[team_field] == "TRUE",
                "bonus_requirements": bonus_requirements,
                "min_proofs": min_proofs,
            }

            tiles.append(tile)

        return tiles

    def visible_regions(self, tiles: list[Tile]) -> set[int]:
        """
        Same unlock logic as server/main.py's index() route: region 0 is
        always visible, and completing a tile whose `region_unlock` names
        another region makes that region visible too.
        """

        visible = {0}

        for tile in tiles:
            if tile["completed"] and tile["region_unlock"] is not None:
                visible.add(tile["region_unlock"])

        return visible

    def write(self, cell: str, value: str):
        """
        Write a value to a cell in the spreadsheet
        NOTE: `row` will
        be 1 larger than the actual tile number due to header row in spreadsheet.
        """

        res = requests.put(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{cell}?valueInputOption=USER_ENTERED",
            headers={"Authorization": f"Bearer {self.credentials.token}"},
            json={"values": [[value]]},
        )

        return res
