import os
from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands
from sheets import SheetsAPI

GUILD_ID = int(os.getenv("GUILD_ID", "532377514975428628"))
MOD_SUBMISSION_CHANNEL_ID = int("1271294688313348147")
TILE_SUBMISSION_CHANNEL_ID = int("1539403936602132530")

TEAM_COLUMN_MAP = {
    1: "G",
    2: "H",
    3: "I",
    4: "J",
}


class Bingo(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def cog_command_error(
        self, ctx: commands.Context, error: commands.CommandError
    ):
        if isinstance(error, commands.MissingPermissions):
            embed = discord.Embed(
                title="Missing permissions",
                description="You need the Manage Server permission to use this command.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        raise error

    @app_commands.guilds(discord.Object(id=GUILD_ID))
    @commands.hybrid_command(
        name="upload",
        description="Submit a tile completion",
    )
    @app_commands.describe(team="Your team number (1-4)")
    @app_commands.describe(tile_number="Which tile you have just completed")
    @app_commands.describe(proof="Screenshot of your proof")
    async def upload(
        self,
        ctx: commands.Context,
        team: int,
        tile_number: str,
        proof: discord.Attachment,
        proof_2: Optional[discord.Attachment] = None,
        proof_3: Optional[discord.Attachment] = None,
        proof_4: Optional[discord.Attachment] = None,
        proof_5: Optional[discord.Attachment] = None,
    ):
        # Reading/writing the sheet is a chain of blocking HTTP calls that
        # can take longer than Discord's 3s interaction window — defer
        # immediately so the interaction doesn't get invalidated under us.
        await ctx.defer()

        if ctx.channel.id != TILE_SUBMISSION_CHANNEL_ID:
            embed = discord.Embed(
                title="Wrong channel",
                description=f"Please use <#{TILE_SUBMISSION_CHANNEL_ID}> to submit tile completions.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        if team not in TEAM_COLUMN_MAP:
            embed = discord.Embed(
                title="Invalid team",
                description=f"Team must be one of {', '.join(map(str, TEAM_COLUMN_MAP))}.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        sheets = SheetsAPI()

        tiles = sheets.read_tiles(team)
        tile = next((t for t in tiles if t["number"] == int(tile_number)), None)

        if tile is None:
            embed = discord.Embed(
                title="Invalid tile number",
                description=f"Tile {tile_number} doesn't exist.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        if tile["completed"]:
            embed = discord.Embed(
                title="Already completed",
                description=f"Team {team} has already completed tile #{tile_number}.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        if tile["region"] not in sheets.visible_regions(tiles):
            embed = discord.Embed(
                title="Region locked",
                description=f"Region {tile['region']} isn't unlocked for team {team} yet.",
                color=discord.Color.red(),
            )

            return await ctx.send(embed=embed, ephemeral=True)

        row = int(tile_number) + 1  # Add 1 to account for header row
        column = TEAM_COLUMN_MAP[team]

        res = sheets.write(f"db!{column}{row}", "TRUE")

        embed: discord.Embed
        if res.status_code == 200:
            proof_list = list(
                filter(
                    bool, (proof, *map(locals().get, (f"proof_{i}" for i in range(10))))
                )
            )

            embeds: list[discord.Embed] = []
            mod_embeds: list[discord.Embed] = []

            website_link = "[bingo.rngstreet.com](https://bingo.rngstreet.com)"

            if tile["region_unlock"]:
                embed = discord.Embed(
                    title=f"Team {team} has completed tile #{tile_number}!",
                    description=f"A new region has been unlocked for your team! {website_link}",
                    color=discord.Color.gold(),
                )
            else:
                embed = discord.Embed(
                    title=f"Team {team} has completed tile #{tile_number}!",
                    description=f"The website has been updated with your completion! {website_link}",
                    color=discord.Color.green(),
                )

            embeds.append(embed)

            # Bonus tiles list the tile numbers they require; check whether
            # this completion is the one that just satisfies any of them.
            completed_before = {t["number"] for t in tiles if t["completed"]}
            completed_after = completed_before | {tile["number"]}

            newly_completed_bonus_tiles = [
                t
                for t in tiles
                if t["bonus_requirements"]
                and not all(r in completed_before for r in t["bonus_requirements"])
                and all(r in completed_after for r in t["bonus_requirements"])
            ]

            for bonus_tile in newly_completed_bonus_tiles:
                bonus_row = bonus_tile["number"] + 1  # Add 1 to account for header row
                sheets.write(f"db!{column}{bonus_row}", "TRUE")

            if newly_completed_bonus_tiles:
                bonus_names = ", ".join(t["name"] for t in newly_completed_bonus_tiles)
                embeds.append(
                    discord.Embed(
                        title=f"Team {team} has completed a bonus tile!",
                        description=f"Team {team} has earnt a bonus point for completing the tile: {bonus_names}!",
                        color=discord.Color.purple(),
                    )
                )

            for item in proof_list:
                embed = discord.Embed(color=discord.Color.blue())
                embed.set_image(url=item.url)

                mod_embeds.append(embed)

            await ctx.send(embeds=embeds, ephemeral=False)

            await self.bot.get_channel(MOD_SUBMISSION_CHANNEL_ID).send(
                embeds=[*embeds, *mod_embeds]
            )

        else:
            embed = discord.Embed(
                title=f"An error occured while updating the spreadsheet...",
                description=res.text,
                color=discord.Color.red(),
            )

            await ctx.send(embed=embed)
