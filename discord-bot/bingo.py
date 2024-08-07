import os
from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands
from sheets import SheetsAPI

GUILD_ID = os.getenv("GUILD_ID", "532377514975428628")

TEAM_COLUMN_MAP = {
    "Team A": "E",
    "Team B": "F",
    "Team C": "G",
}


class Bingo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.guilds(discord.Object(id=GUILD_ID))
    @commands.hybrid_command(
        name="completed_tile",
        description="Submit a tile completion",
    )
    @app_commands.describe(tile_number="Which tile you have just completed")
    @app_commands.describe(proof="Screenshot of your proof")
    async def completed_tile(
        self,
        ctx: commands.Context,
        tile_number: str,
        proof: discord.Attachment,
        proof_1: Optional[discord.Attachment] = None,
        proof_2: Optional[discord.Attachment] = None,
        proof_3: Optional[discord.Attachment] = None,
        proof_4: Optional[discord.Attachment] = None,
        proof_5: Optional[discord.Attachment] = None,
        proof_6: Optional[discord.Attachment] = None,
        proof_7: Optional[discord.Attachment] = None,
        proof_8: Optional[discord.Attachment] = None,
        proof_9: Optional[discord.Attachment] = None,
    ):
        sheets = SheetsAPI()

        rsn = ctx.author.name  # TODO: Lookup rsn from discord user id
        team = "Team A"  # TODO: Lookup team from discord user id

        row = int(tile_number) + 1  # Add 1 to account for header row
        column = TEAM_COLUMN_MAP[team]

        res = sheets.write(f"Tiles!{column}{row}", rsn)

        embed: discord.Embed
        if res.status_code == 200:
            proof_list = list(
                filter(
                    bool, (proof, *map(locals().get, (f"proof_{i}" for i in range(10))))
                )
            )

            embeds = [
                discord.Embed(
                    title=f"Tile {tile_number} completed for {team} by {rsn}!",
                    description=f"The website has been updated with your completion!",
                    color=discord.Color.green(),
                )
            ]

            for item in proof_list:
                embed = discord.Embed(color=discord.Color.green())
                embed.set_image(url=item.url)

                embeds.append(embed)

            await ctx.send(embeds=embeds, ephemeral=True)

        else:
            embed = discord.Embed(
                title=f"An error occured while updating the spreadsheet...",
                description=res.text,
                color=discord.Color.red(),
            )

            await ctx.send(embed=embed)
