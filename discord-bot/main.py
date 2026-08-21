import os

import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

from bingo import Bingo

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = int(os.getenv("GUILD_ID", "532377514975428628"))
GUILD = discord.Object(id=GUILD_ID)

intents = discord.Intents.default()
bot = commands.Bot(intents=intents, command_prefix=commands.when_mentioned)


@bot.event
async def on_ready():
    await bot.add_cog(Bingo(bot))
    await bot.tree.sync(guild=GUILD)


@bot.tree.command(name="sync", description="Re-sync slash commands", guild=GUILD)
async def sync(interaction: discord.Interaction):
    await bot.tree.sync(guild=GUILD)
    await interaction.response.send_message("Command sync successful", ephemeral=True)


@bot.tree.command(name="tree_clear", description="Clear and re-sync slash commands", guild=GUILD)
async def tree_clear(interaction: discord.Interaction):
    bot.tree.clear_commands(guild=GUILD)
    await bot.tree.sync(guild=GUILD)
    await interaction.response.send_message("Command sync successful", ephemeral=True)


if __name__ == "__main__":
    bot.run(token=DISCORD_TOKEN)
