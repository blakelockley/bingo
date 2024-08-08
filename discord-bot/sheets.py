import os

import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import service_account

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")


class SheetsAPI:
    def __init__(self):
        self.credentials = service_account.Credentials.from_service_account_file(
            "sheets-write.json",
            scopes=["https://www.googleapis.com/auth/spreadsheets"],
        )

        self.credentials.refresh(google_requests.Request())

    def read(self, range: str):
        """
        Write a value to a cell in the spreadsheet
        NOTE: `row` will be 1 larger than the actual tile number due to header row in spreadsheet.
        """

        res = requests.get(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{range}",
            headers={"Authorization": f"Bearer {self.credentials.token}"},
        )

        return res

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
